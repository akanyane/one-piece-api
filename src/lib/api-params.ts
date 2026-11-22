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
