import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  classifyClient,
  E2E_USER_AGENT,
  normalizeApiPath,
  originHost,
  recordApiHit,
} from "@/lib/api-usage";

/**
 * Counts public API calls. Runs before Vercel's CDN cache, so cached responses
 * are counted too (route handlers only see cache misses). The write happens
 * after the response is sent, via `waitUntil`, and never blocks or fails it.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const track =
    process.env.VERCEL_ENV === "production" ||
    process.env.TRACK_API_USAGE === "1";
  const userAgent = request.headers.get("user-agent");
  if (
    track &&
    (request.method === "GET" || request.method === "HEAD") &&
    // The e2e suite (tests/e2e) runs against production; keep it out of the stats.
    !userAgent?.startsWith(E2E_USER_AGENT)
  ) {
    event.waitUntil(
      recordApiHit({
        path: normalizeApiPath(request.nextUrl.pathname),
        client: classifyClient(userAgent),
        country: request.headers.get("x-vercel-ip-country") ?? "",
        origin: originHost(request.headers.get("origin")),
      }),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/openapi.json"],
};
