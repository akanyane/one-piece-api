import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  agentName,
  classifyClient,
  clientIp,
  E2E_USER_AGENT,
  normalizeApiPath,
  originHost,
  recordApiHit,
  trackedParams,
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
    !userAgent?.startsWith(E2E_USER_AGENT) &&
    // Next.js router prefetches from the website itself, not API calls.
    !request.headers.has("rsc") &&
    !request.headers.has("next-router-prefetch")
  ) {
    const path = normalizeApiPath(request.nextUrl.pathname);
    const client = classifyClient(userAgent);
    event.waitUntil(
      recordApiHit({
        path,
        client,
        country: request.headers.get("x-vercel-ip-country") ?? "",
        origin: originHost(request.headers.get("origin")),
        agent: agentName(userAgent, client),
        ip: clientIp(request.headers),
        params: trackedParams(
          path,
          request.nextUrl.searchParams,
          request.nextUrl.pathname,
        ),
      }),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/openapi.json"],
};
