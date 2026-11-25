import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/affiliations/route";
import { expectListResponse, nameOr, Q_CASES } from "../../helpers/cases";
import { apiUrl, combinations, label } from "../../helpers/combos";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

const row = (id: string, en: string | null, members: number | null) => ({
  id,
  created_at: "2026-01-01T00:00:00+00:00",
  updated_at: null,
  name: en === null ? null : { en, jp: null, romaji: null },
  character_affiliations: members === null ? null : [{ count: members }],
});

// Deliberately unsorted. Ties on memberCount break by English name.
const DB_ROWS = [
  row("navy", "Marines", 120),
  row("bwp", "Big Mom Pirates", 40),
  row("shp", "Straw Hat Pirates", 14),
  row("bbp", "Blackbeard Pirates", 40),
  row("solo", "Lonely Crew", 0),
  row("ghost", null, null),
  row("rev", "Revolutionary Army", 14),
];
// Expected API order: most members first, then name (missing name sorts as "").
const SORTED = [
  ["navy", 120],
  ["bwp", 40],
  ["bbp", 40],
  ["rev", 14],
  ["shp", 14],
  ["ghost", 0],
  ["solo", 0],
] as const;

const PAGE_CASES = [
  [undefined, 1],
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["0", 1],
  ["50", 50],
] as const;
const LIMIT_CASES = [
  [undefined, 20],
  ["1", 1],
  ["2", 2],
  ["3", 3],
  ["5", 5],
  ["101", 100],
] as const;

beforeEach(() => {
  respond(() => ({ data: DB_ROWS }));
});

describe("GET /api/affiliations: every combination of page × limit × q", () => {
  it.each(combinations({ page: PAGE_CASES, limit: LIMIT_CASES, q: Q_CASES }))(
    "%#",
    async ({ page, limit, q }) => {
      const [rawPage, expPage] = page;
      const [rawLimit, expLimit] = limit;
      const [rawQ, expQ] = q;
      const params = { page: rawPage, limit: rawLimit, q: rawQ };
      const url = apiUrl("/api/affiliations", params);

      const res = await GET(new Request(url));

      expect(recorded, label(params)).toHaveLength(1);
      const query = recorded[0];
      expect(query.table).toBe("affiliations");
      // One query for every row (small table), sorted and paginated in memory.
      expect(call(query, "select")).toEqual([
        "*, character_affiliations(count)",
      ]);
      expect(calls(query, "or")).toEqual(
        expQ === undefined ? [] : [[nameOr(expQ)]],
      );
      expect(calls(query, "range")).toEqual([]);

      const start = (expPage - 1) * expLimit;
      const body = SORTED.slice(start, start + expLimit).map(
        ([id, memberCount]) => {
          const found = DB_ROWS.find((r) => r.id === id);
          if (!found) throw new Error(id);
          const { character_affiliations: _, ...rest } = found;
          return { ...rest, memberCount };
        },
      );
      await expectListResponse(res, {
        requestUrl: url,
        page: expPage,
        limit: expLimit,
        total: DB_ROWS.length,
        body,
      });
    },
  );
});

describe("GET /api/affiliations: edge cases", () => {
  it("never exposes the raw character_affiliations aggregate", async () => {
    const body = await (
      await GET(new Request(apiUrl("/api/affiliations")))
    ).json();
    for (const item of body) {
      expect(item).not.toHaveProperty("character_affiliations");
      expect(typeof item.memberCount).toBe("number");
    }
  });

  it("handles an empty table", async () => {
    respond(() => ({ data: [] }));
    const url = apiUrl("/api/affiliations");
    await expectListResponse(await GET(new Request(url)), {
      requestUrl: url,
      page: 1,
      limit: 20,
      total: 0,
      body: [],
    });
  });

  it("handles a null data payload", async () => {
    respond(() => ({ data: null }));
    const res = await GET(new Request(apiUrl("/api/affiliations")));
    expect(await res.json()).toEqual([]);
    expect(res.headers.get("x-total-count")).toBe("0");
  });

  it("answers 400 / 500 on database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond(() => ({ error: { code: "22023" } }));
    expect((await GET(new Request(apiUrl("/api/affiliations")))).status).toBe(
      400,
    );
    respond(() => ({ error: { code: "42P01" } }));
    expect((await GET(new Request(apiUrl("/api/affiliations")))).status).toBe(
      500,
    );
  });
});
