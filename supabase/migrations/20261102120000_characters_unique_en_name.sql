-- A character can only exist once: the English name is unique, ignoring case
-- and surrounding whitespace. Same-name different people get the wiki's
-- disambiguated title, e.g. "Bomba" vs "Bomba (Marine)".
create unique index if not exists characters_name_en_unique
  on public.characters (lower(btrim(name->>'en')));
