import { isUuid } from "@/lib/uuid";

/**
 * Anonymous API usage counting, used by `src/proxy.ts`.
 * Only coarse, non-identifying dimensions are recorded (see the
 * `api_usage_*` migrations): never IPs or full user agents. Distinct callers
 * are counted through a daily-rotating HMAC of the IP (see {@link visitorId}).
 */

/** User-agent prefix of the e2e test suite; its requests are never counted. */
export const E2E_USER_AGENT = "one-piece-api-e2e";

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
  // Detail routes: /api/{resource}/{id} → one template per resource.
  const detail = path.match(/^(\/api\/[a-z-]+)\/([^/]+)$/);
  if (detail && KNOWN_PATHS.has(detail[1])) {
    return `${detail[1]}/${isUuid(detail[2]) ? "{id}" : "{invalid}"}`;
  }
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

/** Bot names inside UAs like "Mozilla/5.0 (compatible; Googlebot/2.1; …)". */
const BOT_NAME =
  /\b[\w-]*?(?:bot|crawl|spider|slurp|scrap|headless|lighthouse)[\w-]*/i;

/**
 * The program's name, kept only for clients {@link classifyClient} can't
 * place ("other") and for bots, so those buckets can be told apart.
 * Never the full user agent: no versions, OS or device details.
 */
export function agentName(userAgent: string | null, client: string): string {
  if (!userAgent || (client !== "other" && client !== "bot")) return "";
  const name =
    (client === "bot" && userAgent.match(BOT_NAME)?.[0]) ||
    userAgent.trim().match(/^[^\s/;()]+/)?.[0] ||
    "";
  return name.replace(/[^\w.-]/g, "").slice(0, 40);
}

/** Query params each list endpoint understands, in the order they're recorded. */
const LIST_PARAMS: Record<string, readonly string[]> = {
  "/api/characters": [
    "page",
    "limit",
    "q",
    "ageBand",
    "status",
    "affiliation",
    "devilFruit",
    "hasDevilFruit",
  ],
  "/api/devil-fruits": ["page", "limit", "q"],
  "/api/bounties": ["page", "limit", "q", "isActive", "sort"],
  "/api/ships": ["page", "limit", "q"],
  "/api/islands": ["page", "limit", "q"],
  "/api/affiliations": ["page", "limit", "q"],
};
const MAX_PARAMS = 8;
const ID_PARAMS = new Set(["affiliation", "devilFruit"]);

export type ParamUse = { param: string; value: string };

function pageBucket(raw: string): string {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return "invalid";
  if (n === 1) return "1";
  if (n <= 5) return "2-5";
  if (n <= 20) return "6-20";
  return "21+";
}

function limitBucket(raw: string): string {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return "invalid";
  return n > 100 ? ">100" : String(n);
}

/**
 * Which params a list call used, with values bucketed so they stay coarse:
 * page ranges, the limit, the search text (lowercased, 40 chars) and enum
 * values. Unsupported params are recorded as `other` with the param's name,
 * which shows which filters people try that don't exist yet.
 *
 * Detail calls record the requested `id` instead (from `pathname`), so the
 * most viewed items can be ranked. Only valid UUIDs: `path` is already
 * `{invalid}` for anything else, which keeps junk ids out.
 */
export function trackedParams(
  path: string,
  params: URLSearchParams,
  pathname = "",
): ParamUse[] {
  if (path.endsWith("/{id}")) {
    const id = pathname.replace(/\/+$/, "").split("/").pop()?.toLowerCase();
    return id && isUuid(id) ? [{ param: "id", value: id }] : [];
  }
  const known = LIST_PARAMS[path];
  if (!known) return [];
  const out: ParamUse[] = [];
  for (const param of known) {
    const raw = params.get(param)?.trim();
    if (!raw) continue;
    const value =
      param === "page"
        ? pageBucket(raw)
        : param === "limit"
          ? limitBucket(raw)
          : param === "q"
            ? raw.toLowerCase().replace(/\s+/g, " ").slice(0, 40)
            : // Ids are kept whole (36 chars) so they can be joined to names.
              raw.toLowerCase().slice(0, ID_PARAMS.has(param) ? 40 : 24);
    out.push({ param, value });
  }
  const unknown = new Set<string>();
  for (const key of params.keys()) {
    if (!known.includes(key)) unknown.add(key.toLowerCase().slice(0, 24));
  }
  for (const key of unknown) out.push({ param: "other", value: key });
  return out.slice(0, MAX_PARAMS);
}

/** The caller's IP as Vercel reports it, or "". */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0] ??
    ""
  ).trim();
}

/**
 * HMAC-SHA256 of the IP, keyed with a server secret and salted with the UTC
 * date: the same caller maps to the same id within a day, but the id can't be
 * reversed to the IP or linked across days. 64 bits, hex.
 */
export async function visitorId(
  ip: string,
  secret: string,
  day: string,
): Promise<string> {
  if (!ip) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${day}|${ip}`),
  );
  return Array.from(new Uint8Array(mac).slice(0, 8), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
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
  agent: string;
  /** Only hashed into the visitor id; never sent or stored. */
  ip: string;
  params: ParamUse[];
};

/** Increments today's counter. Never throws: tracking must not break the API. */
export async function recordApiHit(hit: ApiHit): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return;
  try {
    const day = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${url}/rest/v1/rpc/track_api_hit`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_path: hit.path,
        p_client: hit.client,
        p_country: hit.country,
        p_origin: hit.origin,
        p_agent: hit.agent,
        p_visitor: await visitorId(hit.ip, key, day),
        p_params: hit.params,
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error("api usage: track failed", res.status);
  } catch (error) {
    console.error("api usage: track failed", error);
  }
}
