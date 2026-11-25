import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/characters/route";
import {
  expectListResponse,
  LIMIT_CASES,
  nameOr,
  PAGE_CASES,
  Q_CASES,
} from "../../helpers/cases";
import { apiUrl, combinations, label } from "../../helpers/combos";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

const ROWS = [{ id: "a" }, { id: "b" }];
const TOTAL = 1431;

/** [raw ageBand, expected gte, expected lte] (null = no filter). */
const AGE_BAND_CASES = [
  [undefined, null, null],
  ["all", null, null],
  ["0-12", 0, 12],
  ["13-17", 13, 17],
  ["18-29", 18, 29],
  ["30-59", 30, 59],
  ["60+", 60, null],
  ["60", null, null],
  ["ALL", null, null],
  ["bogus", null, null],
] as const;

beforeEach(() => {
  respond(() => ({ data: ROWS, count: TOTAL }));
});

describe("GET /api/characters: every combination of page × limit × q × ageBand", () => {
  const cases = combinations({
    page: PAGE_CASES,
    limit: LIMIT_CASES,
    q: Q_CASES,
    ageBand: AGE_BAND_CASES,
  });

  it.each(cases)("%#", async ({ page, limit, q, ageBand }) => {
    const [rawPage, expPage] = page;
    const [rawLimit, expLimit] = limit;
    const [rawQ, expQ] = q;
    const [rawBand, gte, lte] = ageBand;
    const params = {
      page: rawPage,
      limit: rawLimit,
      q: rawQ,
      ageBand: rawBand,
    };
    const url = apiUrl("/api/characters", params);

    const res = await GET(new Request(url));

    expect(recorded, label(params)).toHaveLength(1);
    const query = recorded[0];
    expect(query.table).toBe("characters");
    expect(call(query, "select")).toEqual([
      "*, bounties(*)",
      { count: "exact", head: false },
    ]);
    expect(calls(query, "order")).toEqual([
      ["created_at", { ascending: false }],
      ["id", { ascending: true }],
    ]);
    expect(calls(query, "or")).toEqual(
      expQ === undefined ? [] : [[nameOr(expQ)]],
    );
    expect(calls(query, "gte")).toEqual(gte === null ? [] : [["age", gte]]);
    expect(calls(query, "lte")).toEqual(lte === null ? [] : [["age", lte]]);
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

describe("GET /api/characters: edge cases", () => {
  it("returns [] with the real total when the page is past the end", async () => {
    respond((q) =>
      calls(q, "select")[0]?.[1] &&
      (calls(q, "select")[0][1] as { head: boolean }).head
        ? { count: 65 }
        : {
            error: {
              code: "PGRST103",
              message: "Requested range not satisfiable",
            },
          },
    );
    const url = apiUrl("/api/characters", { page: "99", ageBand: "60+" });
    const res = await GET(new Request(url));

    expect(recorded).toHaveLength(2);
    const [pageQuery, countQuery] = recorded;
    expect(call(pageQuery, "range")).toEqual([1960, 1979]);
    // Same filters, count only.
    expect(call(countQuery, "select")).toEqual([
      "*, bounties(*)",
      { count: "exact", head: true },
    ]);
    expect(calls(countQuery, "gte")).toEqual([["age", 60]]);
    expect(calls(countQuery, "range")).toEqual([]);

    await expectListResponse(res, {
      requestUrl: url,
      page: 99,
      limit: 20,
      total: 65,
      body: [],
    });
  });

  it("returns total 0 and a single page when nothing matches", async () => {
    respond(() => ({ data: [], count: 0 }));
    const url = apiUrl("/api/characters", { q: "zzzz" });
    await expectListResponse(await GET(new Request(url)), {
      requestUrl: url,
      page: 1,
      limit: 20,
      total: 0,
      body: [],
    });
  });

  it("treats a null count as 0", async () => {
    respond(() => ({ data: ROWS, count: null }));
    const res = await GET(new Request(apiUrl("/api/characters")));
    expect(res.headers.get("x-total-count")).toBe("0");
  });

  it("uses the first value when a param is repeated", async () => {
    const url =
      "https://www.onepieceapi.com/api/characters?page=2&page=5&q=zoro&q=nami";
    await GET(new Request(url));
    expect(call(recorded[0], "range")).toEqual([20, 39]);
    expect(calls(recorded[0], "or")).toEqual([[nameOr("zoro")]]);
  });

  it("answers 400 for a data exception (SQLSTATE class 22)", async () => {
    respond(() => ({ error: { code: "22P02", message: "invalid input" } }));
    const res = await GET(new Request(apiUrl("/api/characters")));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid request" });
  });

  it("answers 500 without leaking the database error", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    respond(() => ({ error: { code: "XX000", message: "secret internals" } }));
    const res = await GET(new Request(apiUrl("/api/characters")));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
    expect(log).toHaveBeenCalledOnce();
  });

  it("answers 500 when the past-the-end count query fails too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond((q) =>
      (calls(q, "select")[0][1] as { head: boolean }).head
        ? { error: { code: "XX000" } }
        : { error: { code: "PGRST103" } },
    );
    const res = await GET(
      new Request(apiUrl("/api/characters", { page: "50" })),
    );
    expect(res.status).toBe(500);
  });
});
