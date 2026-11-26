import { isUuid } from "@/lib/uuid";

export type AgeBand = "all" | "0-12" | "13-17" | "18-29" | "30-59" | "60+";

const AGE_BANDS = new Set<AgeBand>([
  "all",
  "0-12",
  "13-17",
  "18-29",
  "30-59",
  "60+",
]);

export function parseAgeBand(raw: string | string[] | undefined): AgeBand {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && AGE_BANDS.has(v as AgeBand)) return v as AgeBand;
  return "all";
}

const MAX_Q = 120;

export function parseNameQuery(raw: string | string[] | undefined): string {
  const v = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  // The query goes into a PostgREST `or=(...)` filter: drop its syntax chars
  // (`,` `(` `)` `"` `\`), plus `*`, which PostgREST treats as a LIKE wildcard.
  return v
    .slice(0, MAX_Q)
    .replace(/[,()"\\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildCharactersListHref(opts: {
  page: number;
  limit: number;
  q: string;
  ageBand: AgeBand;
}): string {
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(opts.limit),
  });
  if (opts.q) params.set("q", opts.q);
  if (opts.ageBand !== "all") params.set("ageBand", opts.ageBand);
  return `/characters?${params.toString()}`;
}

export function ageRangeForBand(band: AgeBand): {
  min: number | null;
  max: number | null;
} {
  switch (band) {
    case "0-12":
      return { min: 0, max: 12 };
    case "13-17":
      return { min: 13, max: 17 };
    case "18-29":
      return { min: 18, max: 29 };
    case "30-59":
      return { min: 30, max: 59 };
    case "60+":
      return { min: 60, max: null };
    default:
      return { min: null, max: null };
  }
}

export const CHARACTER_STATUSES = ["Alive", "Deceased", "Unknown"] as const;
export type CharacterStatus = (typeof CHARACTER_STATUSES)[number];

export type CharacterFilters = {
  status?: CharacterStatus;
  /** Affiliation UUID: current members only. */
  affiliation?: string;
  /** Devil fruit UUID: its current user only. */
  devilFruit?: string;
  /** `true`: eats a devil fruit now; `false`: doesn't. */
  hasDevilFruit?: boolean;
};

/**
 * `status`, `affiliation`, `devilFruit` and `hasDevilFruit` from a public API
 * request. Blank values count as absent; anything else that isn't valid is an
 * error (a 400), so a typo never silently returns every character.
 */
export function parseCharacterFilters(
  params: URLSearchParams,
): { filters: CharacterFilters } | { error: string } {
  const get = (key: string) => params.get(key)?.trim() || undefined;
  const filters: CharacterFilters = {};

  const status = get("status")?.toLowerCase();
  if (status) {
    const match = CHARACTER_STATUSES.find((s) => s.toLowerCase() === status);
    if (!match) {
      return { error: "Invalid status: use alive, deceased or unknown" };
    }
    filters.status = match;
  }

  for (const key of ["affiliation", "devilFruit"] as const) {
    const id = get(key)?.toLowerCase();
    if (!id) continue;
    if (!isUuid(id)) return { error: `Invalid ${key}: expected a UUID` };
    filters[key] = id;
  }

  const has = get("hasDevilFruit")?.toLowerCase();
  if (has) {
    if (has !== "true" && has !== "false") {
      return { error: "Invalid hasDevilFruit: use true or false" };
    }
    filters.hasDevilFruit = has === "true";
  }

  if (filters.devilFruit && filters.hasDevilFruit === false) {
    return { error: "devilFruit can't be combined with hasDevilFruit=false" };
  }
  return { filters };
}
