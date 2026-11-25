/**
 * Contract tests against a running deployment: real database, real CDN.
 *
 *   API_BASE_URL=https://www.onepieceapi.com pnpm test:e2e
 *   API_BASE_URL=http://localhost:3000 pnpm test:e2e   (after `pnpm build && pnpm start`)
 *
 * Every response body is validated against the schemas in /openapi.json, and
 * filters are checked against the data they return. Skipped when
 * API_BASE_URL is not set. Requests carry the e2e user agent, so the usage
 * tracker ignores them.
 */
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { beforeAll, describe, expect, it } from "vitest";

import { E2E_USER_AGENT } from "@/lib/api-usage";

const BASE = process.env.API_BASE_URL?.replace(/\/+$/, "");
const HEADERS = {
  "user-agent": `${E2E_USER_AGENT}/1.0`,
  accept: "application/json",
};

type Item = Record<string, unknown> & { id: string };
type Name = {
  en?: string | null;
  jp?: string | null;
  romaji?: string | null;
} | null;

async function get(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...HEADERS, ...init.headers },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {}
  return { res, body };
}

const nameMatches = (name: unknown, q: string) =>
  [(name as Name)?.en, (name as Name)?.jp, (name as Name)?.romaji].some((v) =>
    v?.toLowerCase().includes(q.toLowerCase()),
  );

const RESOURCES = [
  {
    path: "/api/characters",
    schema: "Character",
    hit: "luffy",
    matches: (i: Item, q: string) => nameMatches(i.name, q),
  },
  {
    path: "/api/devil-fruits",
    schema: "DevilFruit",
    hit: "nika",
    matches: (i: Item, q: string) =>
      nameMatches(i.name, q) || nameMatches(i.model, q),
  },
  {
    path: "/api/bounties",
    schema: "Bounty",
    hit: "luffy",
    matches: (i: Item, q: string) =>
      nameMatches((i.characters as { name: Name })?.name, q),
  },
  {
    path: "/api/ships",
    schema: "Ship",
    hit: "sunny",
    matches: (i: Item, q: string) => nameMatches(i.name, q),
  },
  {
    path: "/api/islands",
    schema: "Island",
    hit: "wano",
    matches: (i: Item, q: string) => nameMatches(i.name, q),
  },
  {
    path: "/api/affiliations",
    schema: "Affiliation",
    hit: "straw",
    matches: (i: Item, q: string) => nameMatches(i.name, q),
  },
] as const;

const validators = new Map<string, ValidateFunction>();
let spec: {
  paths: Record<string, unknown>;
  components: Record<string, unknown>;
};

/** Body is a valid array page and the pagination headers agree with it. */
function expectPage(
  res: Response,
  body: unknown,
  { schema, page, limit }: { schema: string; page: number; limit: number },
): { items: Item[]; total: number } {
  expect(res.status).toBe(200);
  expect(res.headers.get("access-control-allow-origin")).toBe("*");
  expect(Array.isArray(body)).toBe(true);
  const items = body as Item[];
  const validate = validators.get(schema);
  if (!validate) throw new Error(`no schema ${schema}`);
  for (const item of items) {
    expect(validate(item), JSON.stringify(validate.errors)).toBe(true);
  }

  const total = Number(res.headers.get("x-total-count"));
  expect(Number.isInteger(total) && total >= 0).toBe(true);
  const last = Math.max(1, Math.ceil(total / limit));
  const expectedLength =
    page < last ? limit : page === last ? total - (last - 1) * limit : 0;
  expect(items).toHaveLength(expectedLength);

  const links = Object.fromEntries(
    [
      ...(res.headers.get("link") ?? "").matchAll(
        /<([^>]+)>;\s*rel="([a-z]+)"/g,
      ),
    ].map(([, url, rel]) => [rel, new URL(url).searchParams]),
  );
  expect(links.first?.get("page")).toBe("1");
  expect(links.last?.get("page")).toBe(String(last));
  expect(links.next?.get("page")).toBe(
    page < last ? String(page + 1) : undefined,
  );
  expect(links.prev?.get("page")).toBe(
    page > 1 ? String(Math.min(page - 1, last)) : undefined,
  );
  for (const params of Object.values(links))
    expect(params.get("limit")).toBe(String(limit));
  return { items, total };
}

describe.skipIf(!BASE)(`API contract against ${BASE}`, () => {
  beforeAll(async () => {
    const { res, body } = await get("/openapi.json");
    expect(res.status).toBe(200);
    spec = body as typeof spec;
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    addFormats(ajv);
    ajv.addSchema({ $id: "spec", components: spec.components });
    for (const r of [...RESOURCES, { schema: "AffiliationDetail" }]) {
      const validate = ajv.getSchema(`spec#/components/schemas/${r.schema}`);
      if (!validate) throw new Error(`/openapi.json has no ${r.schema} schema`);
      validators.set(r.schema, validate);
    }
  });

  describe("GET /api", () => {
    it("lists every resource URL", async () => {
      const { res, body } = await get("/api");
      expect(res.status).toBe(200);
      expect(Object.keys(body as object).sort()).toEqual([
        "affiliations",
        "bounties",
        "characters",
        "devilFruits",
        "documentation",
        "islands",
        "openapi",
        "ships",
      ]);
    });
  });

  describe.each(RESOURCES)("$path", ({ path, schema, hit, matches }) => {
    const combos = [1, 2, 999].flatMap((page) =>
      [1, 7, 100].flatMap((limit) =>
        [undefined, hit, "zzzz-no-match"].map((q) => ({ page, limit, q })),
      ),
    );

    it.concurrent.each(combos)(
      "page=$page limit=$limit q=$q",
      async ({ page, limit, q }) => {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(q ? { q } : {}),
        });
        const { res, body } = await get(`${path}?${qs}`);
        const { items, total } = expectPage(res, body, { schema, page, limit });
        if (q)
          for (const item of items)
            expect(matches(item, q), JSON.stringify(item.name)).toBe(true);
        if (q === "zzzz-no-match") expect(total).toBe(0);
        if (q === hit && page === 1) expect(total).toBeGreaterThan(0);
      },
    );

    it("search narrows the total", async () => {
      const all = await get(`${path}?limit=1`);
      const some = await get(`${path}?limit=1&q=${hit}`);
      expect(Number(some.res.headers.get("x-total-count"))).toBeLessThanOrEqual(
        Number(all.res.headers.get("x-total-count")),
      );
    });

    it("walking every page with the Link header visits each item once", async () => {
      const seen = new Set<string>();
      let url: string | null =
        `${path}?limit=100${path.endsWith("characters") ? "&q=monkey" : ""}`;
      let total = -1;
      while (url) {
        const { res, body }: { res: Response; body: unknown } = await get(
          url.replace(BASE ?? "", ""),
        );
        total = Number(res.headers.get("x-total-count"));
        for (const item of body as Item[]) {
          expect(seen.has(item.id)).toBe(false);
          seen.add(item.id);
        }
        url =
          /<([^>]+)>; rel="next"/.exec(res.headers.get("link") ?? "")?.[1] ??
          null;
      }
      expect(seen.size).toBe(total);
    });

    it("detail returns the list item (affiliations add members)", async () => {
      const { body } = await get(`${path}?limit=3`);
      for (const item of body as Item[]) {
        const detail = await get(`${path}/${item.id}`);
        expect(detail.res.status).toBe(200);
        if (path !== "/api/affiliations") {
          expect(detail.body).toEqual(item);
          continue;
        }
        const { members, ...rest } = detail.body as Item & { members: Item[] };
        expect(rest).toEqual(item);
        expect(members).toHaveLength(item.memberCount as number);
        const validate = validators.get("AffiliationDetail");
        expect(validate?.(detail.body), JSON.stringify(validate?.errors)).toBe(
          true,
        );
      }
    });

    it("detail: 400 for a malformed id, 404 for a missing one", async () => {
      const bad = await get(`${path}/not-a-uuid`);
      expect(bad.res.status).toBe(400);
      expect(bad.body).toEqual({ error: "Invalid id" });
      const missing = await get(`${path}/00000000-0000-0000-0000-000000000000`);
      expect(missing.res.status).toBe(404);
      expect(missing.body).toEqual({ error: "Not found" });
    });
  });

  describe("filters", () => {
    it.concurrent.each([
      ["0-12", 0, 12],
      ["13-17", 13, 17],
      ["18-29", 18, 29],
      ["30-59", 30, 59],
      ["60+", 60, Number.POSITIVE_INFINITY],
    ])(
      "characters ageBand=%s only returns ages in range",
      async (band, min, max) => {
        const { res, body } = await get(
          `/api/characters?limit=100&ageBand=${encodeURIComponent(band)}`,
        );
        const { items } = expectPage(res, body, {
          schema: "Character",
          page: 1,
          limit: 100,
        });
        for (const c of items) {
          expect(c.age).not.toBeNull();
          expect(c.age as number).toBeGreaterThanOrEqual(min);
          expect(c.age as number).toBeLessThanOrEqual(max);
        }
      },
    );

    const bountyCombos = ["true", "false", undefined].flatMap((isActive) =>
      ["high", "low", "newest", undefined].map((sort) => ({ isActive, sort })),
    );

    it.concurrent.each(bountyCombos)(
      "bounties isActive=$isActive sort=$sort",
      async ({ isActive, sort }) => {
        const qs = new URLSearchParams({
          limit: "100",
          ...(isActive ? { isActive } : {}),
          ...(sort ? { sort } : {}),
        });
        const { res, body } = await get(`/api/bounties?${qs}`);
        const { items } = expectPage(res, body, {
          schema: "Bounty",
          page: 1,
          limit: 100,
        });
        if (isActive)
          for (const b of items) expect(b.is_active).toBe(isActive === "true");
        const amounts = items.map((b) => b.amount as number);
        if (sort === "high")
          expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
        if (sort === "low")
          expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
        if (!sort || sort === "newest") {
          const dates = items.map((b) => b.created_at as string);
          expect(dates).toEqual([...dates].sort().reverse());
        }
      },
    );

    it("bounties: active + superseded = all", async () => {
      const total = async (qs: string) =>
        Number(
          (await get(`/api/bounties?limit=1${qs}`)).res.headers.get(
            "x-total-count",
          ),
        );
      expect(
        (await total("&isActive=true")) + (await total("&isActive=false")),
      ).toBe(await total(""));
    });

    it("affiliations are sorted biggest first", async () => {
      const { body } = await get("/api/affiliations?limit=100");
      const counts = (body as Item[]).map((a) => a.memberCount as number);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    });
  });

  describe("relations", () => {
    const sortedCurrentFirst = (links: { is_active: boolean }[]) =>
      links.every((l, i) => i === 0 || links[i - 1].is_active || !l.is_active);

    it("links point both ways: fruit users ↔ character devil_fruits", async () => {
      const { body } = await get("/api/devil-fruits?limit=100");
      const fruits = (
        body as (Item & { users: (Item & { is_active: boolean })[] })[]
      ).filter((f) => f.users.length > 0);
      expect(fruits.length).toBeGreaterThan(0);
      for (const fruit of fruits.slice(0, 8)) {
        expect(sortedCurrentFirst(fruit.users)).toBe(true);
        for (const user of fruit.users) {
          const c = (await get(`/api/characters/${user.id}`)).body as Item & {
            devil_fruits: (Item & { is_active: boolean })[];
          };
          const link = c.devil_fruits.find((f) => f.id === fruit.id);
          expect(link, `${user.id} → ${fruit.id}`).toBeDefined();
          expect(link?.is_active).toBe(user.is_active);
        }
      }
    });

    it("links point both ways: affiliation members ↔ character affiliations", async () => {
      const { body } = await get(
        "/api/affiliations?q=straw%20hat%20pirates&limit=1",
      );
      const [crew] = body as Item[];
      const detail = (await get(`/api/affiliations/${crew.id}`))
        .body as Item & {
        members: (Item & { is_active: boolean })[];
      };
      expect(sortedCurrentFirst(detail.members)).toBe(true);
      for (const member of detail.members.slice(0, 6)) {
        const c = (await get(`/api/characters/${member.id}`)).body as Item & {
          affiliations: (Item & { is_active: boolean })[];
        };
        expect(c.affiliations.find((a) => a.id === crew.id)?.is_active).toBe(
          member.is_active,
        );
      }
    });

    it("Big Mom is the current Soul-Soul Fruit user", async () => {
      const { body } = await get(
        "/api/characters?q=charlotte%20linlin&limit=1",
      );
      const [linlin] = body as (Item & {
        devil_fruits: { name: Name; is_active: boolean }[];
      })[];
      expect(
        linlin.devil_fruits.map((f) => [f.name?.en, f.is_active]),
      ).toContainEqual(["Soul-Soul Fruit", true]);
    });
  });

  describe("HTTP behaviour", () => {
    it("allows cross-origin reads and exposes the pagination headers", async () => {
      const { res } = await get("/api/ships", {
        headers: { origin: "https://example.dev" },
      });
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
      expect(res.headers.get("access-control-expose-headers")).toBe(
        "X-Total-Count, Link",
      );
      // Vercel's CDN consumes s-maxage / stale-while-revalidate and hands
      // clients plain `public`; `next start` passes the full header through.
      expect(res.headers.get("cache-control")).toMatch(/^public\b/);
    });

    it("is cached by the CDN when deployed on Vercel", async (ctx) => {
      const first = await get("/api/islands?limit=3");
      if (!first.res.headers.has("x-vercel-cache")) ctx.skip();
      const second = await get("/api/islands?limit=3");
      expect(["HIT", "STALE", "PRERENDER"]).toContain(
        second.res.headers.get("x-vercel-cache"),
      );
      expect(second.body).toEqual(first.body);
    });

    it("answers CORS preflight", async () => {
      const res = await fetch(`${BASE}/api/ships`, {
        method: "OPTIONS",
        headers: {
          ...HEADERS,
          origin: "https://example.dev",
          "access-control-request-method": "GET",
        },
      });
      expect(res.status).toBeLessThan(300);
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
      expect(res.headers.get("access-control-allow-methods")).toContain("GET");
    });

    it("serves the OpenAPI spec with every documented path answering", async () => {
      for (const path of Object.keys(spec.paths)) {
        const concrete = path.replace(
          "{id}",
          "00000000-0000-0000-0000-000000000000",
        );
        const { res } = await get(concrete);
        expect([200, 404], path).toContain(res.status);
      }
    });
  });
});
