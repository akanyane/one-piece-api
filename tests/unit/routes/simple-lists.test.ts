import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getDevilFruits } from "@/app/api/devil-fruits/route";
import { GET as getIslands } from "@/app/api/islands/route";
import { GET as getShips } from "@/app/api/ships/route";
import {
  DEVIL_FRUIT_SELECT,
  expectListResponse,
  LIMIT_CASES,
  nameOr,
  PAGE_CASES,
  Q_CASES,
} from "../../helpers/cases";
import { apiUrl, combinations, label } from "../../helpers/combos";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

/** Endpoints that are a plain table list: newest first, optional name search. */
const ENDPOINTS = [
  {
    path: "/api/devil-fruits",
    table: "devil_fruits",
    GET: getDevilFruits,
    searchColumns: ["name", "model"],
    select: DEVIL_FRUIT_SELECT,
    // Each fruit lists who ate it.
    extra: { users: [] },
  },
  {
    path: "/api/ships",
    table: "ships",
    GET: getShips,
    searchColumns: ["name"],
    select: "*",
    extra: {},
  },
  {
    path: "/api/islands",
    table: "islands",
    GET: getIslands,
    searchColumns: ["name"],
    select: "*",
    extra: {},
  },
] as const;

const ROWS = [{ id: "row-1" }];
const TOTAL = 86;

beforeEach(() => {
  respond(() => ({ data: ROWS, count: TOTAL }));
});

describe.each(ENDPOINTS)(
  "GET $path",
  ({ path, table, GET, searchColumns, select, extra }) => {
    const cases = combinations({
      page: PAGE_CASES,
      limit: LIMIT_CASES,
      q: Q_CASES,
    });

    it.each(cases)(
      `every combination of page × limit × q: %#`,
      async ({ page, limit, q }) => {
        const [rawPage, expPage] = page;
        const [rawLimit, expLimit] = limit;
        const [rawQ, expQ] = q;
        const params = { page: rawPage, limit: rawLimit, q: rawQ };
        const url = apiUrl(path, params);

        const res = await GET(new Request(url));

        expect(recorded, label(params)).toHaveLength(1);
        const query = recorded[0];
        expect(query.table).toBe(table);
        expect(call(query, "select")).toEqual([
          select,
          { count: "exact", head: false },
        ]);
        expect(calls(query, "order")).toEqual([
          ["created_at", { ascending: false }],
          ["id", { ascending: true }],
        ]);
        expect(calls(query, "or")).toEqual(
          expQ === undefined ? [] : [[nameOr(expQ, [...searchColumns])]],
        );
        expect(call(query, "range")).toEqual([
          (expPage - 1) * expLimit,
          expPage * expLimit - 1,
        ]);

        await expectListResponse(res, {
          requestUrl: url,
          page: expPage,
          limit: expLimit,
          total: TOTAL,
          body: ROWS.map((r) => ({ ...r, ...extra })),
        });
      },
    );

    it("ignores unknown params", async () => {
      const url = apiUrl(path, {
        sort: "high",
        ageBand: "60+",
        isActive: "true",
        foo: "bar",
      });
      await GET(new Request(url));
      const query = recorded[0];
      expect(query.ops.map((o) => o.method)).toEqual([
        "select",
        "order",
        "order",
        "range",
      ]);
    });

    it("returns [] with the real total past the last page", async () => {
      respond((q) =>
        (calls(q, "select")[0][1] as { head: boolean }).head
          ? { count: 50 }
          : { error: { code: "PGRST103" } },
      );
      const url = apiUrl(path, { page: "99", q: "a" });
      const res = await GET(new Request(url));
      expect(recorded).toHaveLength(2);
      expect(call(recorded[1], "select")).toEqual([
        select,
        { count: "exact", head: true },
      ]);
      expect(calls(recorded[1], "or")).toEqual([
        [nameOr("a", [...searchColumns])],
      ]);
      await expectListResponse(res, {
        requestUrl: url,
        page: 99,
        limit: 20,
        total: 50,
        body: [],
      });
    });

    it("answers 400 on a data exception and 500 on other errors", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      respond(() => ({ error: { code: "22003" } }));
      expect((await GET(new Request(apiUrl(path)))).status).toBe(400);
      respond(() => ({
        error: { code: "57014", message: "statement timeout" },
      }));
      const res = await GET(new Request(apiUrl(path)));
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Internal server error" });
    });
  },
);
