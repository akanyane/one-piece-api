import type { Tables } from "@/supabase/database.types";

export type ApiFieldRow = { field: string; type: string; notes?: string };

type FieldDef<K extends string> = { key: K; type: string; notes?: string };

function toRows<K extends string>(fields: FieldDef<K>[]): ApiFieldRow[] {
  return fields.map(({ key, type, notes }) => ({ field: key, type, notes }));
}

const CHARACTER_FIELD_DEFS: FieldDef<keyof Tables<"characters">>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes: "Localized name; see CharacterNameJson when present",
  },
  { key: "age", type: "number | null" },
  {
    key: "birthday",
    type: "object | null",
    notes: "Structured birthday payload when present",
  },
  { key: "blood_type", type: "string" },
  { key: "height", type: "number | null" },
  { key: "status", type: "string" },
  { key: "image_url", type: "string | null" },
  {
    key: "extra_data",
    type: "object | null",
    notes:
      "Free-form extra fields, e.g. origin, epithet, occupation, affiliation, first_appearance",
  },
];

const BOUNTY_FIELD_DEFS: FieldDef<keyof Tables<"bounties">>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  { key: "amount", type: "number | null" },
  { key: "character_id", type: "string | null", notes: "FK → characters.id" },
  { key: "is_active", type: "boolean" },
];

const DEVIL_FRUIT_FIELD_DEFS: FieldDef<keyof Tables<"devil_fruits">>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes:
      "Localized fruit name; CharacterNameJson when present (en, jp, romaji)",
  },
  {
    key: "model",
    type: "object | null",
    notes: "Localized model name; same CharacterNameJson shape when present",
  },
  { key: "type", type: "string | null", notes: "e.g. Paramecia, Zoan, Logia" },
  { key: "sub_type", type: "string | null" },
  { key: "image_url", type: "string | null" },
];

const SHIP_FIELD_DEFS: FieldDef<keyof Tables<"ships">>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes: "Localized name; CharacterNameJson shape when present",
  },
  { key: "status", type: "string", notes: "e.g. Active, Destroyed, Unknown" },
  { key: "type", type: "string | null", notes: "Ship class, when known" },
  { key: "image_url", type: "string | null" },
  {
    key: "extra_data",
    type: "object | null",
    notes:
      "Free-form extra fields, e.g. affiliation, first_appearance, length, height",
  },
];

const ISLAND_FIELD_DEFS: FieldDef<keyof Tables<"islands">>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes: "Localized name; CharacterNameJson shape when present",
  },
  {
    key: "sea",
    type: "string | null",
    notes: "e.g. East Blue, Paradise, New World, Sky",
  },
  { key: "image_url", type: "string | null" },
  {
    key: "extra_data",
    type: "object | null",
    notes:
      "Free-form extra fields, e.g. affiliation, type, population, first_appearance",
  },
];

const AFFILIATION_FIELD_DEFS: FieldDef<string>[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes: "Localized name; CharacterNameJson shape when present",
  },
  {
    key: "memberCount",
    type: "number",
    notes:
      "Number of characters linked to this affiliation; computed per request, not a stored column",
  },
];

export const CHARACTER_FIELDS = toRows(CHARACTER_FIELD_DEFS);
export const BOUNTY_FIELDS = toRows(BOUNTY_FIELD_DEFS);
export const DEVIL_FRUIT_FIELDS = toRows(DEVIL_FRUIT_FIELD_DEFS);
export const SHIP_FIELDS = toRows(SHIP_FIELD_DEFS);
export const ISLAND_FIELDS = toRows(ISLAND_FIELD_DEFS);
export const AFFILIATION_FIELDS = toRows(AFFILIATION_FIELD_DEFS);
