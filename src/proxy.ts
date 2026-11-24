import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  classifyClient,
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
  if (track && (request.method === "GET" || request.method === "HEAD")) {
    event.waitUntil(
      recordApiHit({
        path: normalizeApiPath(request.nextUrl.pathname),
        client: classifyClient(request.headers.get("user-agent")),
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
