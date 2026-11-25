import { NextResponse } from "next/server";

/** Matches the revalidate window used by the cached data functions in `lib/data.ts`. */
const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

/** JSON response for public API routes, with CDN/browser caching headers attached. */
export function apiJson<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: { ...init?.headers, "Cache-Control": CACHE_CONTROL },
  });
}

/**
 * JSON response for a list endpoint: the page of rows as a plain array (the
 * body shape never changes), plus `X-Total-Count` (rows across all pages) and
 * an RFC 8288 `Link` header with `first`, `prev`, `next` and `last` URLs that
 * keep the request's other query params.
 */
export function apiPage<T>(
  request: Request,
  data: T[],
  { page, limit, total }: { page: number; limit: number; total: number },
): NextResponse {
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const url = (n: number) => {
    const u = new URL(request.url);
    u.searchParams.set("page", String(n));
    u.searchParams.set("limit", String(limit));
    return u.toString();
  };
  const links: [string, number][] = [["first", 1]];
  if (page > 1) links.push(["prev", Math.min(page - 1, lastPage)]);
  if (page < lastPage) links.push(["next", page + 1]);
  links.push(["last", lastPage]);

  return apiJson(data, {
    headers: {
      "X-Total-Count": String(total),
      Link: links.map(([rel, n]) => `<${url(n)}>; rel="${rel}"`).join(", "),
    },
  });
}
