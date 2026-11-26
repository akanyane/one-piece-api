import type { PostgrestError } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { clampLimit, clampPage } from "@/lib/api-params";
import type { BountySort } from "@/lib/bounties-catalog-url";
import type { AgeBand } from "@/lib/characters-catalog-url";
import { ageRangeForBand } from "@/lib/characters-catalog-url";
import { supabase } from "@/supabase/client";

/** Reference data (characters, devil fruits, bounties) only changes when someone runs a data pass. */
const REVALIDATE_SECONDS = 60;

/**
 * Every tag used by the caches below. An entry carries the tags of all the
 * tables it reads, so purging one resource also purges entries that embed it.
 * `/internal/revalidate` purges these on demand after a direct data fix.
 */
export const CACHE_TAGS = [
  "characters",
  "devil-fruits",
  "bounties",
  "ships",
  "islands",
  "affiliations",
] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];

/** Escape `%` and `_` so user input is literal in SQL `ILIKE`. */
function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * PostgREST `or` filter: case-insensitive substring match of `q` on the
 * localized name (English, Japanese, romaji), plus any extra JSON columns.
 * `q` must already be sanitized with `parseNameQuery`.
 */
function nameFilter(q: string, columns: string[] = ["name"]): string {
  const pattern = `%${escapeIlike(q)}%`;
  return columns
    .flatMap((col) =>
      ["en", "jp", "romaji"].map((key) => `${col}->>${key}.ilike.${pattern}`),
    )
    .join(",");
}

/** PostgREST answers a page past the end with PGRST103 (416); the API treats that as an empty page. */
function isPastLastPage(error: { code?: string }): boolean {
  return error.code === "PGRST103";
}

/**
 * Every paginated list ends its ORDER BY with `id`. Many rows share a
 * `created_at` (bulk imports: 1431 characters, 102 distinct timestamps), and
 * without a unique tie-breaker Postgres may return overlapping pages.
 */
const BY_ID = { ascending: true } as const;

/** A junction-table embed, e.g. `{ is_active, devil_fruits: {...} }`, normalized. */
type Link<T> = { is_active: boolean | null; target: T | null };

/**
 * Flattens junction rows into `[{ ...target, is_active }]`: current links
 * first, then by English name, then id. A null `is_active` counts as current.
 */
function flattenLinks<T extends { id: string; name: unknown }>(
  links: Link<T>[],
) {
  return links
    .flatMap(({ is_active, target }) =>
      target ? [{ ...target, is_active: is_active !== false }] : [],
    )
    .sort(
      (a, b) =>
        Number(b.is_active) - Number(a.is_active) ||
        displayCharacterNameForSort(a.name).localeCompare(
          displayCharacterNameForSort(b.name),
        ) ||
        a.id.localeCompare(b.id),
    );
}

/** Characters embed their bounties, devil fruits and affiliations. */
const CHARACTER_SELECT =
  "*, bounties(*), character_devil_fruits(is_active, devil_fruits(id, name, type, sub_type, image_url)), character_affiliations(is_active, affiliations(id, name))";

type CharacterLinks = {
  character_devil_fruits: {
    is_active: boolean | null;
    devil_fruits: {
      id: string;
      name: unknown;
      type: string | null;
      sub_type: string | null;
      image_url: string | null;
    } | null;
  }[];
  character_affiliations: {
    is_active: boolean | null;
    affiliations: { id: string; name: unknown } | null;
  }[];
};

/** API shape: junction embeds become `devil_fruits[]` and `affiliations[]`. */
function toApiCharacter<R extends CharacterLinks>(row: R) {
  const { character_devil_fruits, character_affiliations, ...rest } = row;
  return {
    ...rest,
    devil_fruits: flattenLinks(
      (character_devil_fruits ?? []).map((l) => ({
        is_active: l.is_active,
        target: l.devil_fruits,
      })),
    ),
    affiliations: flattenLinks(
      (character_affiliations ?? []).map((l) => ({
        is_active: l.is_active,
        target: l.affiliations,
      })),
    ),
  };
}

/** A character as embedded in a devil fruit (`users`) or affiliation (`members`). */
type CharacterRef = {
  id: string;
  name: unknown;
  image_url: string | null;
  status: string;
};
type CharacterLink = {
  is_active: boolean | null;
  characters: CharacterRef | null;
};

function characterLinks(links: CharacterLink[] | null | undefined) {
  return flattenLinks(
    (links ?? []).map((l) => ({
      is_active: l.is_active,
      target: l.characters,
    })),
  );
}

/** Devil fruits embed the characters who ate them. */
const DEVIL_FRUIT_SELECT =
  "*, character_devil_fruits(is_active, characters(id, name, image_url, status))";

function toApiDevilFruit<R extends { character_devil_fruits: CharacterLink[] }>(
  row: R,
) {
  const { character_devil_fruits, ...rest } = row;
  return { ...rest, users: characterLinks(character_devil_fruits) };
}

type PageResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
};

/**
 * Runs one page of a filtered list query and returns its rows plus the total
 * row count. A page past the end comes back from PostgREST as an error with
 * no count, so the same filters are re-run as a count-only (HEAD) query.
 */
async function pageWithTotal<T>(
  pageQuery: PromiseLike<PageResult<T>>,
  countOnly: () => PromiseLike<{
    error: PostgrestError | null;
    count: number | null;
  }>,
): Promise<{ data: T[]; count: number }> {
  const { data, error, count } = await pageQuery;
  if (!error) return { data: data ?? [], count: count ?? 0 };
  if (!isPastLastPage(error)) throw error;
  const head = await countOnly();
  if (head.error) throw head.error;
  return { data: [], count: head.count ?? 0 };
}

export type GetCharactersParams = {
  page: number;
  limit: number;
  q?: string;
  ageBand?: AgeBand;
  /** Site catalog only: characters with a portrait first (the public API keeps newest-first). */
  portraitsFirst?: boolean;
};

async function fetchCharacters(params: GetCharactersParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // Built twice: once for the page, once as a count-only query when the
  // page is past the end (see pageWithTotal).
  const build = (head = false) => {
    let query = supabase
      .from("characters")
      .select(CHARACTER_SELECT, { count: "exact", head });
    if (params.portraitsFirst) {
      // PostgREST can't order by "is null", so sort by the URL itself with nulls
      // last — portraits come first, roughly alphabetical by file slug.
      query = query.order("image_url", { ascending: true, nullsFirst: false });
    }
    query = query.order("created_at", { ascending: false }).order("id", BY_ID);

    if (params.q) query = query.or(nameFilter(params.q));

    const { min, max } = ageRangeForBand(params.ageBand ?? "all");
    if (min !== null) query = query.gte("age", min);
    if (max !== null) query = query.lte("age", max);
    return query;
  };

  const { data, count } = await pageWithTotal(
    build().range((page - 1) * limit, page * limit - 1),
    () => build(true),
  );
  return { data: data.map(toApiCharacter), count };
}

/** Cached character list. Revalidates every {@link REVALIDATE_SECONDS}s or on-demand via `revalidateTag("characters")`. */
export const getCharacters = unstable_cache(
  fetchCharacters,
  ["characters-list"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["characters", "bounties", "devil-fruits", "affiliations"],
  },
);

async function fetchCharacterById(id: string) {
  const { data, error } = await supabase
    .from("characters")
    .select(CHARACTER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toApiCharacter(data) : null;
}

/** Cached single-character lookup, keyed by id. */
export const getCharacterById = unstable_cache(
  fetchCharacterById,
  ["character-by-id"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["characters", "bounties", "devil-fruits", "affiliations"],
  },
);

export type GetDevilFruitsParams = { page: number; limit: number; q?: string };

async function fetchDevilFruits(params: GetDevilFruitsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // Built twice: once for the page, once as a count-only query when the
  // page is past the end (see pageWithTotal).
  const build = (head = false) => {
    let query = supabase
      .from("devil_fruits")
      .select(DEVIL_FRUIT_SELECT, { count: "exact", head })
      .order("created_at", { ascending: false })
      .order("id", BY_ID);
    // Zoan models are searchable too, e.g. "nika" finds Hito Hito no Mi, Model: Nika.
    if (params.q) query = query.or(nameFilter(params.q, ["name", "model"]));
    return query;
  };

  const { data, count } = await pageWithTotal(
    build().range((page - 1) * limit, page * limit - 1),
    () => build(true),
  );
  return { data: data.map(toApiDevilFruit), count };
}

/** Cached devil fruit list. */
export const getDevilFruits = unstable_cache(
  fetchDevilFruits,
  ["devil-fruits-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits", "characters"] },
);

async function fetchDevilFruitById(id: string) {
  const { data, error } = await supabase
    .from("devil_fruits")
    .select(DEVIL_FRUIT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toApiDevilFruit(data) : null;
}

/** Cached single devil fruit, same shape as a list item (with `users`). */
export const getDevilFruitById = unstable_cache(
  fetchDevilFruitById,
  ["devil-fruit-by-id"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits", "characters"] },
);

export type GetBountiesParams = {
  page: number;
  limit: number;
  isActive?: boolean;
  sort: BountySort;
  /** Matches the bounty holder's name. */
  q?: string;
};

async function fetchBounties(params: GetBountiesParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // Built twice: once for the page, once as a count-only query when the
  // page is past the end (see pageWithTotal).
  const build = (head = false) => {
    const plain = () =>
      supabase
        .from("bounties")
        .select("*, characters(name, image_url, status)", {
          count: "exact",
          head,
        });
    // Searching by name needs an inner join, so the filter on the embedded
    // character drops non-matching bounties instead of nulling `characters`.
    // Same row shape, so the cast only papers over the select-string typing.
    let query = params.q
      ? (supabase
          .from("bounties")
          .select("*, characters!inner(name, image_url, status)", {
            count: "exact",
            head,
          })
          .or(nameFilter(params.q), {
            referencedTable: "characters",
          }) as unknown as ReturnType<typeof plain>)
      : plain();

    if (params.isActive !== undefined) {
      query = query.eq("is_active", params.isActive);
    }

    if (params.sort === "high") {
      // Postgres sorts NULLs first in DESC order; an unknown amount isn't "high".
      query = query
        .order("amount", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else if (params.sort === "low") {
      query = query
        .order("amount", { ascending: true })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }
    return query.order("id", BY_ID);
  };

  return pageWithTotal(
    build().range((page - 1) * limit, page * limit - 1),
    () => build(true),
  );
}

/** Cached bounty list. */
export const getBounties = unstable_cache(fetchBounties, ["bounties-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["bounties", "characters"],
});

async function fetchBountyById(id: string) {
  const { data, error } = await supabase
    .from("bounties")
    .select("*, characters(name, image_url, status)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Cached single bounty, same shape as a list item. */
export const getBountyById = unstable_cache(fetchBountyById, ["bounty-by-id"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["bounties", "characters"],
});

export type GetShipsParams = { page: number; limit: number; q?: string };

async function fetchShips(params: GetShipsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // Built twice: once for the page, once as a count-only query when the
  // page is past the end (see pageWithTotal).
  const build = (head = false) => {
    let query = supabase
      .from("ships")
      .select("*", { count: "exact", head })
      .order("created_at", { ascending: false })
      .order("id", BY_ID);
    if (params.q) query = query.or(nameFilter(params.q));
    return query;
  };

  return pageWithTotal(
    build().range((page - 1) * limit, page * limit - 1),
    () => build(true),
  );
}

/** Cached ship list. */
export const getShips = unstable_cache(fetchShips, ["ships-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["ships"],
});

async function fetchShipById(id: string) {
  const { data, error } = await supabase
    .from("ships")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Cached single ship, same shape as a list item. */
export const getShipById = unstable_cache(fetchShipById, ["ship-by-id"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["ships"],
});

export type GetIslandsParams = { page: number; limit: number; q?: string };

async function fetchIslands(params: GetIslandsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // Built twice: once for the page, once as a count-only query when the
  // page is past the end (see pageWithTotal).
  const build = (head = false) => {
    let query = supabase
      .from("islands")
      .select("*", { count: "exact", head })
      .order("created_at", { ascending: false })
      .order("id", BY_ID);
    if (params.q) query = query.or(nameFilter(params.q));
    return query;
  };

  return pageWithTotal(
    build().range((page - 1) * limit, page * limit - 1),
    () => build(true),
  );
}

/** Cached island list. */
export const getIslands = unstable_cache(fetchIslands, ["islands-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["islands"],
});

async function fetchIslandById(id: string) {
  const { data, error } = await supabase
    .from("islands")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Cached single island, same shape as a list item. */
export const getIslandById = unstable_cache(fetchIslandById, ["island-by-id"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["islands"],
});

export type GetAffiliationsParams = { page: number; limit: number; q?: string };

const AFFILIATION_WITH_COUNT = "*, character_affiliations(count)";

/** Flattens PostgREST's `character_affiliations: [{ count }]` into `memberCount`. */
function withMemberCount<
  T extends { character_affiliations: { count: number }[] | null },
>(row: T) {
  const { character_affiliations, ...rest } = row;
  return { ...rest, memberCount: character_affiliations?.[0]?.count ?? 0 };
}

async function fetchAffiliations(params: GetAffiliationsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // affiliations carries no image/recency signal of its own; pull every row
  // (small, fixed-size table) with a member count and sort the biggest
  // factions first, then paginate in memory.
  let query = supabase.from("affiliations").select(AFFILIATION_WITH_COUNT);
  if (params.q) query = query.or(nameFilter(params.q));
  const { data, error } = await query;
  if (error) throw error;

  const withCounts = (data ?? []).map(withMemberCount);
  withCounts.sort(
    (a, b) =>
      b.memberCount - a.memberCount ||
      displayCharacterNameForSort(a.name).localeCompare(
        displayCharacterNameForSort(b.name),
      ) ||
      a.id.localeCompare(b.id),
  );

  const count = withCounts.length;
  const start = (page - 1) * limit;
  return { data: withCounts.slice(start, start + limit), count };
}

function displayCharacterNameForSort(name: unknown): string {
  if (!name || typeof name !== "object") return "";
  const en = (name as Record<string, unknown>).en;
  return typeof en === "string" ? en : "";
}

/** Cached affiliation list, biggest factions first. */
export const getAffiliations = unstable_cache(
  fetchAffiliations,
  ["affiliations-list"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["affiliations", "characters"],
  },
);

async function fetchAffiliationById(id: string) {
  const { data, error } = await supabase
    .from("affiliations")
    .select(
      "*, character_affiliations(is_active, characters(id, name, image_url, status))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { character_affiliations, ...rest } = data;
  const members = characterLinks(character_affiliations);
  return { ...rest, memberCount: members.length, members };
}

/** Cached single affiliation: the list item fields plus every member. */
export const getAffiliationById = unstable_cache(
  fetchAffiliationById,
  ["affiliation-by-id"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["affiliations", "characters"],
  },
);

async function fetchAllCharacterIds() {
  const { data, error } = await supabase
    .from("characters")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) throw error;
  return data;
}

/** Every character id + created_at, for the sitemap. Not paginated -- this is the full set. */
export const getAllCharacterIds = unstable_cache(
  fetchAllCharacterIds,
  ["characters-all-ids"],
  { revalidate: REVALIDATE_SECONDS, tags: ["characters"] },
);

async function fetchSiteStats() {
  const tables = [
    "characters",
    "devil_fruits",
    "bounties",
    "ships",
    "islands",
    "affiliations",
  ] as const;
  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return [table, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<(typeof tables)[number], number>;
}

/** Row counts per resource, for the homepage stats strip. */
export const getSiteStats = unstable_cache(fetchSiteStats, ["site-stats"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["characters", "devil-fruits", "bounties", "ships", "islands"],
});

async function fetchMostWanted(limit: number) {
  // Over-fetch: a character can hold several active bounties, and some have no portrait.
  const { data, error } = await supabase
    .from("bounties")
    .select("amount, characters!inner(id, name, image_url, status)")
    .eq("is_active", true)
    .not("amount", "is", null)
    .not("characters.image_url", "is", null)
    .order("amount", { ascending: false })
    .limit(limit * 3);
  if (error) throw error;

  const seen = new Set<string>();
  const out: {
    id: string;
    name: unknown;
    image_url: string | null;
    status: string;
    amount: number;
  }[] = [];
  for (const row of data ?? []) {
    const c = row.characters;
    if (!c || seen.has(c.id) || row.amount == null) continue;
    seen.add(c.id);
    out.push({ ...c, amount: row.amount });
    if (out.length === limit) break;
  }
  return out;
}

/** Highest active bounties with a portrait, one per character — the homepage marquee. */
export const getMostWanted = unstable_cache(fetchMostWanted, ["most-wanted"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["bounties", "characters"],
});

async function fetchCharacterProfile(id: string) {
  const { data, error } = await supabase
    .from("characters")
    .select(
      "*, bounties(*), character_affiliations(is_active, affiliations(id, name)), character_devil_fruits(is_active, devil_fruits(id, name, type, sub_type, image_url))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Character + bounties + affiliations + devil fruits, for the profile page (the public API keeps its own shape). */
export const getCharacterProfile = unstable_cache(
  fetchCharacterProfile,
  ["character-profile"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["characters", "bounties", "devil-fruits", "affiliations"],
  },
);

async function fetchCrewmates(affiliationId: string, excludeId: string) {
  const { data, error } = await supabase
    .from("character_affiliations")
    .select(
      "characters!inner(id, name, image_url, status, bounties(amount, is_active))",
    )
    .eq("affiliation_id", affiliationId)
    .neq("character_id", excludeId)
    .not("characters.image_url", "is", null)
    .limit(40);
  if (error) throw error;
  const rows = (data ?? []).flatMap((r) =>
    r.characters ? [r.characters] : [],
  );
  // Best-known faces first: highest bounty leads.
  const top = (c: (typeof rows)[number]) =>
    Math.max(0, ...(c.bounties ?? []).map((b) => b.amount ?? 0));
  return rows.sort((a, b) => top(b) - top(a)).slice(0, 8);
}

/** Other members of an affiliation (with portraits), highest bounty first. */
export const getCrewmates = unstable_cache(fetchCrewmates, ["crewmates"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["characters"],
});

const MEMBER_FIELDS =
  "is_active, characters(id, name, image_url, status, bounties(amount, is_active))";

async function fetchDevilFruitProfile(id: string) {
  const { data, error } = await supabase
    .from("devil_fruits")
    .select(`*, character_devil_fruits(${MEMBER_FIELDS})`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Devil fruit + every character who has eaten it (current and former). */
export const getDevilFruitProfile = unstable_cache(
  fetchDevilFruitProfile,
  ["devil-fruit-profile"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits", "characters"] },
);

async function fetchAffiliationProfile(id: string) {
  const { data, error } = await supabase
    .from("affiliations")
    .select(`*, character_affiliations(${MEMBER_FIELDS})`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Affiliation + its members (current and former). */
export const getAffiliationProfile = unstable_cache(
  fetchAffiliationProfile,
  ["affiliation-profile"],
  { revalidate: REVALIDATE_SECONDS, tags: ["affiliations", "characters"] },
);

async function fetchAllIds(table: "devil_fruits" | "affiliations") {
  const { data, error } = await supabase
    .from(table)
    .select("id, created_at")
    .limit(10000);
  if (error) throw error;
  return data;
}

/** Every devil fruit / affiliation id, for the sitemap. */
export const getAllDevilFruitIds = unstable_cache(
  () => fetchAllIds("devil_fruits"),
  ["devil-fruits-all-ids"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits"] },
);
export const getAllAffiliationIds = unstable_cache(
  () => fetchAllIds("affiliations"),
  ["affiliations-all-ids"],
  { revalidate: REVALIDATE_SECONDS, tags: ["affiliations"] },
);

async function fetchRelatedFruits(type: string, excludeId: string) {
  const { data, error } = await supabase
    .from("devil_fruits")
    .select("id, name, type, sub_type, image_url")
    .eq("type", type)
    .neq("id", excludeId)
    .not("image_url", "is", null)
    .limit(24);
  if (error) throw error;
  // Rotate the pick per fruit so neighbours differ from page to page.
  const rows = data ?? [];
  const offset = excludeId.charCodeAt(0) % Math.max(1, rows.length);
  return [...rows.slice(offset), ...rows.slice(0, offset)].slice(0, 4);
}

/** A few other fruits of the same type, with art. */
export const getRelatedFruits = unstable_cache(
  fetchRelatedFruits,
  ["related-fruits"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits"] },
);
