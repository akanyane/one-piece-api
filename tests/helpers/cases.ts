import { expect } from "vitest";

/**
 * Shared parameter cases for every list endpoint: [raw query value, value the
 * API must use]. `undefined` raw = param omitted.
 */

export const PAGE_CASES = [
  [undefined, 1],
  ["1", 1],
  ["2", 2],
  ["7", 7],
  ["0", 1],
  ["-3", 1],
  ["2.9", 2],
  ["abc", 1],
  ["", 1],
  ["10000", 10_000],
  ["10001", 10_000],
] as const;

export const LIMIT_CASES = [
  [undefined, 20],
  ["1", 1],
  ["5", 5],
  ["100", 100],
  ["101", 100],
  ["9999", 100],
  // 0 / blank / garbage fall back to the default; negatives clamp to 1.
  ["0", 20],
  ["", 20],
  ["x", 20],
  ["-5", 1],
  ["7.8", 7],
] as const;

/**
 * Smaller page/limit sets for endpoints with many other axes. Parsing is
 * shared, and the full grids above already run against /api/characters and
 * the simple lists.
 */
export const PAGE_CASES_CORE = [
  [undefined, 1],
  ["3", 3],
  ["0", 1],
  ["10001", 10_000],
] as const;
export const LIMIT_CASES_CORE = [
  [undefined, 20],
  ["1", 1],
  ["100", 100],
  ["101", 100],
] as const;

/** [raw q, sanitized q the filter must use, or undefined for no filter]. */
export const Q_CASES = [
  [undefined, undefined],
  ["", undefined],
  ["   ", undefined],
  ["luffy", "luffy"],
  ["  Monkey   D  ", "Monkey D"],
  ["ルフィ", "ルフィ"],
  // PostgREST `or=(…)` syntax characters and `*` become spaces.
  ['zo(r),o"*\\', "zo r o"],
  ['(),"*', undefined],
  // Capped at 120 characters.
  ["x".repeat(130), "x".repeat(120)],
] as const;

/** Expected ILIKE pattern: `%`, `_` and `\` in the query are matched literally. */
export function ilikePattern(q: string): string {
  return `%${q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

/** Expected PostgREST `or` filter for a name search over JSON columns. */
export function nameOr(q: string, columns: string[] = ["name"]): string {
  const p = ilikePattern(q);
  return columns
    .flatMap((c) => [
      `${c}->>en.ilike.${p}`,
      `${c}->>jp.ilike.${p}`,
      `${c}->>romaji.ilike.${p}`,
    ])
    .join(",");
}

/** `Link` header → { rel: URL }. */
export function parseLink(header: string | null): Record<string, URL> {
  const out: Record<string, URL> = {};
  for (const [, url, rel] of (header ?? "").matchAll(
    /<([^>]+)>;\s*rel="([a-z]+)"/g,
  )) {
    out[rel] = new URL(url);
  }
  return out;
}

/**
 * Checks the list-response contract: JSON array body, cache header,
 * `X-Total-Count`, and a `Link` header whose URLs keep every other request
 * param and point at the right pages.
 */
export async function expectListResponse(
  res: Response,
  opts: {
    requestUrl: string;
    page: number;
    limit: number;
    total: number;
    body: unknown[];
  },
): Promise<void> {
  const { requestUrl, page, limit, total, body } = opts;
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("application/json");
  expect(res.headers.get("cache-control")).toBe(
    "public, s-maxage=60, stale-while-revalidate=300",
  );
  expect(await res.json()).toEqual(body);
  expect(res.headers.get("x-total-count")).toBe(String(total));

  const last = Math.max(1, Math.ceil(total / limit));
  const links = parseLink(res.headers.get("link"));
  const expected: Record<string, number> = { first: 1, last };
  if (page > 1) expected.prev = Math.min(page - 1, last);
  if (page < last) expected.next = page + 1;
  expect(Object.keys(links).sort()).toEqual(Object.keys(expected).sort());

  const req = new URL(requestUrl);
  for (const [rel, target] of Object.entries(expected)) {
    const url = links[rel];
    expect(url.origin + url.pathname).toBe(req.origin + req.pathname);
    expect(url.searchParams.get("page")).toBe(String(target));
    expect(url.searchParams.get("limit")).toBe(String(limit));
    for (const [k, v] of req.searchParams) {
      if (k !== "page" && k !== "limit")
        expect(url.searchParams.get(k)).toBe(v);
    }
  }
}

/** Select strings the API must send (relations embedded through junction tables). */
export const CHARACTER_SELECT =
  "*, bounties(*), character_devil_fruits(is_active, devil_fruits(id, name, type, sub_type, image_url)), character_affiliations(is_active, affiliations(id, name))";
export const DEVIL_FRUIT_SELECT =
  "*, character_devil_fruits(is_active, characters(id, name, image_url, status))";
export const AFFILIATION_DETAIL_SELECT =
  "*, character_affiliations(is_active, characters(id, name, image_url, status))";
