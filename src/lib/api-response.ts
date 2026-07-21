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
