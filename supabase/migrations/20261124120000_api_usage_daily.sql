-- Anonymous daily counters of public API usage, written by src/proxy.ts.
-- No IPs or full user agents: only the endpoint, a coarse client family,
-- the caller's country and, for browser calls, the calling site's host.
create table if not exists public.api_usage_daily (
  day date not null default (now() at time zone 'utc')::date,
  path text not null,
  client text not null,
  country text not null default '',
  origin text not null default '',
  hits bigint not null default 0,
  primary key (day, path, client, country, origin)
);

-- Deny-all for anon/authenticated, like every other table: only the server's
-- secret key (service_role, which bypasses RLS) reads or writes it.
alter table public.api_usage_daily enable row level security;
revoke all on table public.api_usage_daily from anon, authenticated;

create or replace function public.track_api_hit(
  p_path text,
  p_client text,
  p_country text default '',
  p_origin text default ''
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.api_usage_daily (path, client, country, origin, hits)
  values (
    left(p_path, 80),
    left(p_client, 24),
    left(coalesce(p_country, ''), 2),
    left(coalesce(p_origin, ''), 120),
    1
  )
  on conflict (day, path, client, country, origin)
  do update set hits = public.api_usage_daily.hits + 1;
$$;

revoke execute on function public.track_api_hit(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.track_api_hit(text, text, text, text)
  to service_role;
