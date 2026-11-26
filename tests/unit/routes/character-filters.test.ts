import { beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/characters/route";
import { parseCharacterFilters } from "@/lib/characters-catalog-url";
import { CHARACTER_SELECT, expectListResponse } from "../../helpers/cases";
import { apiUrl, combinations, label } from "../../helpers/combos";
import {
  call,
  calls,
  isHeadQuery,
  recorded,
  respond,
} from "../../helpers/supabase-mock";

const AFF = "f7715d6d-cc3f-4290-824c-9a3e6ae2d4a0";
const FRUIT = "87512161-c1cd-42a1-85cd-9904b23d31c5";
const AFF_JOIN = ", aff_filter:character_affiliations!inner(affiliation_id)";
const FRUIT_INNER =
  ", fruit_filter:character_devil_fruits!inner(devil_fruit_id)";
const FRUIT_LEFT = ", fruit_filter:character_devil_fruits(devil_fruit_id)";

type Case<T> = readonly [raw: string | undefined, expected: T | "error"];

const STATUS_CASES: Case<string | undefined>[] = [
  [undefined, undefined],
  ["", undefined],
  ["alive", "Alive"],
  ["DECEASED", "Deceased"],
  [" unknown ", "Unknown"],
  ["zombie", "error"],
];
const AFFILIATION_CASES: Case<string | undefined>[] = [
  [undefined, undefined],
  [AFF, AFF],
  [AFF.toUpperCase(), AFF],
  ["straw-hats", "error"],
];
const FRUIT_CASES: Case<string | undefined>[] = [
  [undefined, undefined],
  [FRUIT, FRUIT],
  ["mera", "error"],
];
const HAS_FRUIT_CASES: Case<boolean | undefined>[] = [
  [undefined, undefined],
  [" ", undefined],
  ["true", true],
  ["FALSE", false],
  ["yes", "error"],
];

const ROWS = [
  {
    id: "a",
    character_devil_fruits: [],
    character_affiliations: [],
    aff_filter: [{ affiliation_id: AFF }],
    fruit_filter: [{ devil_fruit_id: FRUIT }],
  },
];

beforeEach(() => {
  respond(() => ({ data: ROWS, count: 1 }));
});

describe("GET /api/characters: every combination of status × affiliation × devilFruit × hasDevilFruit", () => {
  const cases = combinations({
    status: STATUS_CASES,
    affiliation: AFFILIATION_CASES,
    devilFruit: FRUIT_CASES,
    hasDevilFruit: HAS_FRUIT_CASES,
  });

  it.each(cases)("%#", async (c) => {
    const params = {
      status: c.status[0],
      affiliation: c.affiliation[0],
      devilFruit: c.devilFruit[0],
      hasDevilFruit: c.hasDevilFruit[0],
    };
    const url = apiUrl("/api/characters", params);
    const res = await GET(new Request(url));

    const status = c.status[1];
    const affiliation = c.affiliation[1];
    const devilFruit = c.devilFruit[1];
    const hasFruit = c.hasDevilFruit[1];

    // Checked in this order, so the first invalid param names the error.
    const firstError =
      status === "error"
        ? "Invalid status: use alive, deceased or unknown"
        : affiliation === "error"
          ? "Invalid affiliation: expected a UUID"
          : devilFruit === "error"
            ? "Invalid devilFruit: expected a UUID"
            : hasFruit === "error"
              ? "Invalid hasDevilFruit: use true or false"
              : devilFruit && hasFruit === false
                ? "devilFruit can't be combined with hasDevilFruit=false"
                : null;
    if (firstError) {
      expect(res.status, label(params)).toBe(400);
      expect(await res.json()).toEqual({ error: firstError });
      expect(recorded).toHaveLength(0);
      return;
    }

    expect(res.status, label(params)).toBe(200);
    expect(recorded).toHaveLength(1);
    const query = recorded[0];

    const fruitJoin =
      devilFruit || hasFruit === true
        ? FRUIT_INNER
        : hasFruit === false
          ? FRUIT_LEFT
          : "";
    expect(call(query, "select")).toEqual([
      CHARACTER_SELECT + (affiliation ? AFF_JOIN : "") + fruitJoin,
      { count: "exact", head: false },
    ]);

    const eq: unknown[][] = [];
    if (status) eq.push(["status", status]);
    if (affiliation) {
      eq.push(["aff_filter.affiliation_id", affiliation]);
      eq.push(["aff_filter.is_active", true]);
    }
    if (devilFruit) eq.push(["fruit_filter.devil_fruit_id", devilFruit]);
    if (devilFruit || hasFruit !== undefined) {
      eq.push(["fruit_filter.is_active", true]);
    }
    expect(calls(query, "eq")).toEqual(eq);
    expect(calls(query, "is")).toEqual(
      hasFruit === false ? [["fruit_filter", null]] : [],
    );

    // The filter-only embeds never reach the response.
    await expectListResponse(res, {
      requestUrl: url,
      page: 1,
      limit: 20,
      total: 1,
      body: [{ id: "a", devil_fruits: [], affiliations: [] }],
    });
  });
});

describe("GET /api/characters: filters on the past-the-end count query", () => {
  it("re-applies every filter to the count-only query", async () => {
    respond((q) =>
      isHeadQuery(q)
        ? { data: null, count: 3 }
        : { error: { code: "PGRST103" } },
    );
    const url = apiUrl("/api/characters", {
      page: "9",
      status: "alive",
      affiliation: AFF,
      hasDevilFruit: "false",
    });
    const res = await GET(new Request(url));

    expect(res.status).toBe(200);
    expect(res.headers.get("x-total-count")).toBe("3");
    const head = recorded.find(isHeadQuery);
    expect(head).toBeDefined();
    if (!head) return;
    expect(call(head, "select")).toEqual([
      CHARACTER_SELECT + AFF_JOIN + FRUIT_LEFT,
      { count: "exact", head: true },
    ]);
    expect(calls(head, "eq")).toEqual([
      ["status", "Alive"],
      ["aff_filter.affiliation_id", AFF],
      ["aff_filter.is_active", true],
      ["fruit_filter.is_active", true],
    ]);
    expect(calls(head, "is")).toEqual([["fruit_filter", null]]);
  });
});

describe("parseCharacterFilters", () => {
  it("returns no filters for an empty query string", () => {
    expect(parseCharacterFilters(new URLSearchParams())).toEqual({
      filters: {},
    });
  });

  it("uses the first value of a repeated param", () => {
    expect(
      parseCharacterFilters(new URLSearchParams("status=alive&status=zombie")),
    ).toEqual({ filters: { status: "Alive" } });
  });
});
