-- Covering indexes for foreign keys flagged by the Supabase performance
-- advisor (lint 0001_unindexed_foreign_keys). They speed up the character ↔
-- bounty / affiliation / devil fruit joins and cascading deletes.
create index if not exists bounties_character_id_idx
  on public.bounties (character_id);
create index if not exists character_affiliations_character_id_idx
  on public.character_affiliations (character_id);
create index if not exists character_affiliations_affiliation_id_idx
  on public.character_affiliations (affiliation_id);
create index if not exists character_devil_fruits_character_id_idx
  on public.character_devil_fruits (character_id);
create index if not exists character_devil_fruits_devil_fruit_id_idx
  on public.character_devil_fruits (devil_fruit_id);
