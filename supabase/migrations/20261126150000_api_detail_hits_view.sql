-- Detail-route hits with the exact path and the item's name, read from
-- api_params_daily (param = 'id'). api_usage_daily keeps the "{id}"
-- template so per-endpoint totals stay one row each.
create or replace view public.api_detail_hits
with (security_invoker = true) as
select
  p.day,
  replace(p.path, '{id}', p.value) as path,
  split_part(p.path, '/', 3) as resource,
  coalesce(
    c.name ->> 'en',
    df.name ->> 'en',
    bc.name ->> 'en',
    s.name ->> 'en',
    i.name ->> 'en',
    a.name ->> 'en'
  ) as name,
  p.hits
from public.api_params_daily p
left join public.characters c
  on p.path = '/api/characters/{id}' and c.id::text = p.value
left join public.devil_fruits df
  on p.path = '/api/devil-fruits/{id}' and df.id::text = p.value
left join public.bounties b
  on p.path = '/api/bounties/{id}' and b.id::text = p.value
left join public.characters bc on bc.id = b.character_id
left join public.ships s
  on p.path = '/api/ships/{id}' and s.id::text = p.value
left join public.islands i
  on p.path = '/api/islands/{id}' and i.id::text = p.value
left join public.affiliations a
  on p.path = '/api/affiliations/{id}' and a.id::text = p.value
where p.param = 'id';

revoke all on public.api_detail_hits from anon, authenticated;
