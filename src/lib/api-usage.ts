/**
 * Anonymous API usage counting, used by `src/proxy.ts`.
 * Only coarse, non-identifying dimensions are recorded (see the
 * `api_usage_daily` migration): never IPs or full user agents.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KNOWN_PATHS = new Set([
  "/api",
  "/api/characters",
  "/api/devil-fruits",
  "/api/bounties",
  "/api/ships",
  "/api/islands",
  "/api/affiliations",
  "/openapi.json",
]);

/**
 * Collapses ids into a template and buckets unknown paths, so scrapers probing
 * random URLs can't blow up the number of rows.
 */
export function normalizeApiPath(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (KNOWN_PATHS.has(path)) return path;
  const id = path.match(/^\/api\/characters\/([^/]+)$/);
  if (id)
    return UUID.test(id[1])
      ? "/api/characters/{id}"
      : "/api/characters/{invalid}";
  return "other";
}

/** Ordered: the first match wins (e.g. bots often also say "Mozilla"). */
const CLIENTS: [RegExp, string][] = [
  [/bot|crawl|spider|slurp|scrap|headless|lighthouse/i, "bot"],
  [/^curl\//i, "curl"],
  [/^wget\//i, "wget"],
  [/python|aiohttp|httpx/i, "python"],
  [/postman/i, "postman"],
  [/insomnia/i, "insomnia"],
  [/^go-http-client|^go\b/i, "go"],
  [/axios|node|undici|got\b|bun\//i, "node"],
  [/okhttp|java|kotlin/i, "java"],
  [/dart|flutter/i, "dart"],
  [/ruby|faraday/i, "ruby"],
  [/php|guzzle/i, "php"],
  [/rust|reqwest/i, "rust"],
  [/dalvik|cfnetwork|darwin/i, "mobile"],
  [/^mozilla\//i, "browser"],
];

export function classifyClient(userAgent: string | null): string {
  if (!userAgent) return "none";
  for (const [pattern, name] of CLIENTS) {
    if (pattern.test(userAgent)) return name;
  }
  return "other";
}

/** Host of the calling site for cross-origin browser requests, else "". */
export function originHost(origin: string | null): string {
  if (!origin || origin === "null") return "";
  try {
    return new URL(origin).host.toLowerCase();
  } catch {
    return "";
  }
}

export type ApiHit = {
  path: string;
  client: string;
  country: string;
  origin: string;
};

/** Increments today's counter. Never throws: tracking must not break the API. */
export async function recordApiHit(hit: ApiHit): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/track_api_hit`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_path: hit.path,
        p_client: hit.client,
        p_country: hit.country,
        p_origin: hit.origin,
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error("api usage: track failed", res.status);
  } catch (error) {
    console.error("api usage: track failed", error);
  }
}
