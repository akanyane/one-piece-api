import { unstable_cache } from "next/cache";
import type { BountySort } from "@/lib/bounties-catalog-url";
import type { AgeBand } from "@/lib/characters-catalog-url";
import { ageRangeForBand } from "@/lib/characters-catalog-url";
import { supabase } from "@/supabase/client";

const MAX_LIMIT = 100;
/** Reference data (characters, devil fruits, bounties) only changes when someone runs a data pass. */
const REVALIDATE_SECONDS = 60;

function clampPage(page: number): number {
  return Math.max(1, Math.floor(page || 1));
}

function clampLimit(limit: number): number {
  return Math.min(Math.max(1, Math.floor(limit || 20)), MAX_LIMIT);
}

/** Escape `%` and `_` so user input is literal in SQL `ILIKE`. */
function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export type GetCharactersParams = {
  page: number;
  limit: number;
  q?: string;
  ageBand?: AgeBand;
};

async function fetchCharacters(params: GetCharactersParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  let query = supabase
    .from("characters")
    .select("*, bounties(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.q) {
    const pattern = `%${escapeIlike(params.q)}%`;
    query = query.or(
      `name->>en.ilike.${pattern},name->>jp.ilike.${pattern},name->>romaji.ilike.${pattern}`,
    );
  }

  const { min, max } = ageRangeForBand(params.ageBand ?? "all");
  if (min !== null) query = query.gte("age", min);
  if (max !== null) query = query.lte("age", max);

  const { data, error, count } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );
  if (error) throw error;
  return { data, count: count ?? null };
}

/** Cached character list. Revalidates every {@link REVALIDATE_SECONDS}s or on-demand via `revalidateTag("characters")`. */
export const getCharacters = unstable_cache(
  fetchCharacters,
  ["characters-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["characters"] },
);

async function fetchCharacterById(id: string) {
  const { data, error } = await supabase
    .from("characters")
    .select("*, bounties(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Cached single-character lookup, keyed by id. */
export const getCharacterById = unstable_cache(
  fetchCharacterById,
  ["character-by-id"],
  { revalidate: REVALIDATE_SECONDS, tags: ["characters"] },
);

export type GetDevilFruitsParams = { page: number; limit: number };

async function fetchDevilFruits(params: GetDevilFruitsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  const { data, error, count } = await supabase
    .from("devil_fruits")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { data, count: count ?? null };
}

/** Cached devil fruit list. */
export const getDevilFruits = unstable_cache(
  fetchDevilFruits,
  ["devil-fruits-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["devil-fruits"] },
);

export type GetBountiesParams = {
  page: number;
  limit: number;
  isActive?: boolean;
  sort: BountySort;
};

async function fetchBounties(params: GetBountiesParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  let query = supabase
    .from("bounties")
    .select("*, characters(name, image_url, status)", { count: "exact" });

  if (params.isActive !== undefined) {
    query = query.eq("is_active", params.isActive);
  }

  if (params.sort === "high") {
    query = query
      .order("amount", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (params.sort === "low") {
    query = query
      .order("amount", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );
  if (error) throw error;
  return { data, count: count ?? null };
}

/** Cached bounty list. */
export const getBounties = unstable_cache(fetchBounties, ["bounties-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["bounties"],
});

export type GetShipsParams = { page: number; limit: number };

async function fetchShips(params: GetShipsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  const { data, error, count } = await supabase
    .from("ships")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { data, count: count ?? null };
}

/** Cached ship list. */
export const getShips = unstable_cache(fetchShips, ["ships-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["ships"],
});

export type GetIslandsParams = { page: number; limit: number };

async function fetchIslands(params: GetIslandsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  const { data, error, count } = await supabase
    .from("islands")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { data, count: count ?? null };
}

/** Cached island list. */
export const getIslands = unstable_cache(fetchIslands, ["islands-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["islands"],
});

export type GetAffiliationsParams = { page: number; limit: number };

async function fetchAffiliations(params: GetAffiliationsParams) {
  const page = clampPage(params.page);
  const limit = clampLimit(params.limit);

  // affiliations carries no image/recency signal of its own; pull every row
  // (small, fixed-size table) with a member count and sort the biggest
  // factions first, then paginate in memory.
  const { data, error } = await supabase
    .from("affiliations")
    .select("*, character_affiliations(count)");
  if (error) throw error;

  const withCounts = (data ?? []).map((row) => {
    const { character_affiliations, ...rest } = row;
    const memberCount = character_affiliations?.[0]?.count ?? 0;
    return { ...rest, memberCount };
  });
  withCounts.sort(
    (a, b) =>
      b.memberCount - a.memberCount ||
      displayCharacterNameForSort(a.name).localeCompare(
        displayCharacterNameForSort(b.name),
      ),
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
    tags: ["affiliations"],
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
  { revalidate: REVALIDATE_SECONDS, tags: ["characters"] },
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
