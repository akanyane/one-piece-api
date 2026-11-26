-- Richer, still anonymous, API usage stats (written by src/proxy.ts):
--   * api_usage_daily.agent: the program name for "other"/"bot" clients
--     (e.g. "PostmanRuntime", "Googlebot"), never the full user agent.
--   * api_visitors_daily: distinct callers per day. `visitor` is an HMAC of
--     the IP keyed with a server secret and the date, so it can't be reversed
--     or linked across days. IPs are never stored.
--   * api_params_daily: which query params (and bucketed values) are used.

alter table public.api_usage_daily
  add column if not exists agent text not null default '';
alter table public.api_usage_daily drop constraint api_usage_daily_pkey;
alter table public.api_usage_daily
  add primary key (day, path, client, country, origin, agent);

create table if not exists public.api_visitors_daily (
  day date not null default (now() at time zone 'utc')::date,
  visitor text not null,
  hits bigint not null default 0,
  primary key (day, visitor)
);

create table if not exists public.api_params_daily (
  day date not null default (now() at time zone 'utc')::date,
  path text not null,
  param text not null,
  value text not null default '',
  hits bigint not null default 0,
  primary key (day, path, param, value)
);

-- Same deny-all as api_usage_daily: only service_role reads or writes.
alter table public.api_visitors_daily enable row level security;
alter table public.api_params_daily enable row level security;
revoke all on table public.api_visitors_daily from anon, authenticated;
revoke all on table public.api_params_daily from anon, authenticated;

-- New parameters all have defaults, so callers still sending the old four
-- arguments keep working while the new proxy code deploys.
drop function if exists public.track_api_hit(text, text, text, text);

create function public.track_api_hit(
  p_path text,
  p_client text,
  p_country text default '',
  p_origin text default '',
  p_agent text default '',
  p_visitor text default '',
  p_params jsonb default '[]'::jsonb
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.api_usage_daily (path, client, country, origin, agent, hits)
  values (
    left(p_path, 80),
    left(p_client, 24),
    left(coalesce(p_country, ''), 2),
    left(coalesce(p_origin, ''), 120),
    left(coalesce(p_agent, ''), 40),
    1
  )
  on conflict (day, path, client, country, origin, agent)
  do update set hits = public.api_usage_daily.hits + 1;

  if coalesce(p_visitor, '') <> '' then
    insert into public.api_visitors_daily (visitor, hits)
    values (left(p_visitor, 32), 1)
    on conflict (day, visitor)
    do update set hits = public.api_visitors_daily.hits + 1;
  end if;

  if jsonb_typeof(p_params) = 'array' then
    insert into public.api_params_daily (path, param, value, hits)
    select distinct
      left(p_path, 80),
      left(e ->> 'param', 32),
      left(coalesce(e ->> 'value', ''), 40),
      1::bigint
    from jsonb_array_elements(p_params) with ordinality as t(e, n)
    where n <= 8 and jsonb_typeof(e) = 'object' and e ->> 'param' is not null
    on conflict (day, path, param, value)
    do update set hits = public.api_params_daily.hits + 1;
  end if;
end;
$$;

revoke execute on function public.track_api_hit(text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.track_api_hit(text, text, text, text, text, text, jsonb)
  to service_role;
