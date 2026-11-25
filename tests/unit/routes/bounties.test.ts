import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/bounties/route";
import {
  expectListResponse,
  LIMIT_CASES_CORE,
  nameOr,
  PAGE_CASES_CORE,
  Q_CASES,
} from "../../helpers/cases";
import { apiUrl, combinations, label } from "../../helpers/combos";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

const ROWS = [{ id: "b1", amount: 3_000_000_000 }];
const TOTAL = 412;

/** [raw isActive, expected `.eq("is_active", …)` value or null for no filter]. */
const IS_ACTIVE_CASES = [
  [undefined, null],
  ["true", true],
  ["false", false],
  ["TRUE", true],
  [" False ", false],
  ["", null],
  ["1", null],
  ["yes", null],
] as const;

/** [raw sort, expected `.order()` calls]. */
const BY_ID = ["id", { ascending: true }];
const NEWEST = [["created_at", { ascending: false }], BY_ID];
const SORT_CASES = [
  [undefined, NEWEST],
  ["newest", NEWEST],
  [
    "high",
    [
      ["amount", { ascending: false, nullsFirst: false }],
      ["created_at", { ascending: false }],
      BY_ID,
    ],
  ],
  [
    "low",
    [
      ["amount", { ascending: true }],
      ["created_at", { ascending: false }],
      BY_ID,
    ],
  ],
  ["HIGH", NEWEST],
  ["bogus", NEWEST],
] as const;

beforeEach(() => {
  respond(() => ({ data: ROWS, count: TOTAL }));
});

describe("GET /api/bounties: every combination of page × limit × q × isActive × sort", () => {
  const cases = combinations({
    page: PAGE_CASES_CORE,
    limit: LIMIT_CASES_CORE,
    q: Q_CASES,
    isActive: IS_ACTIVE_CASES,
    sort: SORT_CASES,
  });

  it.each(cases)("%#", async ({ page, limit, q, isActive, sort }) => {
    const [rawPage, expPage] = page;
    const [rawLimit, expLimit] = limit;
    const [rawQ, expQ] = q;
    const [rawActive, expActive] = isActive;
    const [rawSort, expOrder] = sort;
    const params = {
      page: rawPage,
      limit: rawLimit,
      q: rawQ,
      isActive: rawActive,
      sort: rawSort,
    };
    const url = apiUrl("/api/bounties", params);

    const res = await GET(new Request(url));

    expect(recorded, label(params)).toHaveLength(1);
    const query = recorded[0];
    expect(query.table).toBe("bounties");
    if (expQ === undefined) {
      expect(call(query, "select")).toEqual([
        "*, characters(name, image_url, status)",
        { count: "exact", head: false },
      ]);
      expect(calls(query, "or")).toEqual([]);
    } else {
      // Name search: inner join, filter on the embedded character.
      expect(call(query, "select")).toEqual([
        "*, characters!inner(name, image_url, status)",
        { count: "exact", head: false },
      ]);
      expect(calls(query, "or")).toEqual([
        [nameOr(expQ), { referencedTable: "characters" }],
      ]);
    }
    expect(calls(query, "eq")).toEqual(
      expActive === null ? [] : [["is_active", expActive]],
    );
    expect(calls(query, "order")).toEqual(expOrder);
    expect(call(query, "range")).toEqual([
      (expPage - 1) * expLimit,
      expPage * expLimit - 1,
    ]);

    await expectListResponse(res, {
      requestUrl: url,
      page: expPage,
      limit: expLimit,
      total: TOTAL,
      body: ROWS,
    });
  });
});

describe("GET /api/bounties: edge cases", () => {
  it("re-runs the same filters as a count-only query past the last page", async () => {
    respond((q) =>
      (calls(q, "select")[0][1] as { head: boolean }).head
        ? { count: 7 }
        : { error: { code: "PGRST103" } },
    );
    const url = apiUrl("/api/bounties", {
      page: "3",
      q: "luffy",
      isActive: "true",
      sort: "high",
    });
    const res = await GET(new Request(url));
    expect(recorded).toHaveLength(2);
    const countQuery = recorded[1];
    expect(call(countQuery, "select")).toEqual([
      "*, characters!inner(name, image_url, status)",
      { count: "exact", head: true },
    ]);
    expect(calls(countQuery, "or")).toEqual([
      [nameOr("luffy"), { referencedTable: "characters" }],
    ]);
    expect(calls(countQuery, "eq")).toEqual([["is_active", true]]);
    await expectListResponse(res, {
      requestUrl: url,
      page: 3,
      limit: 20,
      total: 7,
      body: [],
    });
  });

  it("answers 400 / 500 on database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond(() => ({ error: { code: "22P02" } }));
    expect((await GET(new Request(apiUrl("/api/bounties")))).status).toBe(400);
    respond(() => ({ error: { code: "PGRST000" } }));
    expect((await GET(new Request(apiUrl("/api/bounties")))).status).toBe(500);
  });
});
