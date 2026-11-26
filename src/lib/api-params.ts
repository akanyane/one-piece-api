import { parseNameQuery } from "@/lib/characters-catalog-url";

export const MAX_LIMIT = 100;
/** Far beyond any real catalog; keeps `(page - 1) * limit` inside Postgres' integer range. */
export const MAX_PAGE = 10_000;

export function clampPage(page: number): number {
  return Math.min(Math.max(1, Math.floor(page || 1)), MAX_PAGE);
}

export function clampLimit(limit: number): number {
  return Math.min(Math.max(1, Math.floor(limit || 20)), MAX_LIMIT);
}

/** `page` / `limit` from a public API request, clamped to safe ranges. */
export function parsePagination(params: URLSearchParams): {
  page: number;
  limit: number;
} {
  return {
    page: clampPage(Number(params.get("page"))),
    limit: clampLimit(Number(params.get("limit"))),
  };
}

/**
 * Params accepted as the name search, in priority order. `search` and `name`
 * are aliases people reach for before reading the docs; without them the
 * search was silently ignored and the whole list came back.
 */
export const SEARCH_PARAMS = ["q", "search", "name"] as const;

/** Sanitized name search (`q`, or an alias) from a public API request, or `undefined` when blank. */
export function parseSearch(params: URLSearchParams): string | undefined {
  for (const key of SEARCH_PARAMS) {
    const q = parseNameQuery(params.get(key) ?? undefined);
    if (q) return q;
  }
  return undefined;
}
