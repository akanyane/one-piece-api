import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CACHE_TAGS, type CacheTag } from "@/lib/data";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Constant-time check of `Authorization: Bearer <secret>`. */
export function isAuthorized(header: string | null, secret: string): boolean {
  const token = header?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) return false;
  // Hash both sides so lengths match and nothing leaks through timing.
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(token), digest(secret));
}

/**
 * `?tag=characters,ships` → those tags; no `tag` → every tag.
 * Returns the unknown names instead when any tag is not a cache tag.
 */
export function parseTags(
  raw: string | null,
): { tags: CacheTag[] } | { unknown: string[] } {
  const names = (raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (names.length === 0) return { tags: [...CACHE_TAGS] };
  const valid = new Set<string>(CACHE_TAGS);
  const unknown = names.filter((n) => !valid.has(n));
  if (unknown.length > 0) return { unknown };
  return { tags: [...new Set(names)] as CacheTag[] };
}

/**
 * Purge the server data cache right away, so the next request reads the
 * database instead of serving a stale entry once. For use after editing
 * data directly in Supabase. The CDN keeps its copy for up to its
 * `s-maxage` (60s) before it refreshes.
 */
export function revalidateResponse(request: Request): NextResponse {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return json({ error: "Revalidation is not configured" }, 503);
  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const parsed = parseTags(new URL(request.url).searchParams.get("tag"));
  if ("unknown" in parsed) {
    return json(
      {
        error: `Unknown tag: ${parsed.unknown.join(", ")}`,
        validTags: CACHE_TAGS,
      },
      400,
    );
  }

  // expire: 0 → no stale read; the next request is a blocking cache miss.
  for (const tag of parsed.tags) revalidateTag(tag, { expire: 0 });
  return json({ revalidated: parsed.tags, now: Date.now() }, 200);
}
