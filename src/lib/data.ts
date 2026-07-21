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
    .select("*, bounties(*)")
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

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );
  if (error) throw error;
  return data;
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

  const { data, error } = await supabase
    .from("devil_fruits")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return data;
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

  let query = supabase.from("bounties").select("*, characters(name)");

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

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );
  if (error) throw error;
  return data;
}

/** Cached bounty list. */
export const getBounties = unstable_cache(fetchBounties, ["bounties-list"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["bounties"],
});

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
