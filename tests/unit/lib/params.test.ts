import { describe, expect, it } from "vitest";

import {
  clampLimit,
  clampPage,
  MAX_LIMIT,
  MAX_PAGE,
  parsePagination,
  parseSearch,
} from "@/lib/api-params";
import {
  buildBountiesListHref,
  parseBountyFilter,
  parseBountySort,
  parseIsActive,
} from "@/lib/bounties-catalog-url";
import {
  ageRangeForBand,
  buildCharactersListHref,
  parseAgeBand,
  parseNameQuery,
} from "@/lib/characters-catalog-url";
import { isUuid } from "@/lib/uuid";
import { LIMIT_CASES, PAGE_CASES, Q_CASES } from "../../helpers/cases";

describe("clampPage / clampLimit", () => {
  it.each([
    [Number.NaN, 1],
    [0, 1],
    [-1, 1],
    [1, 1],
    [1.99, 1],
    [42, 42],
    [MAX_PAGE, MAX_PAGE],
    [MAX_PAGE + 1, MAX_PAGE],
    [Number.POSITIVE_INFINITY, MAX_PAGE],
  ])("clampPage(%d) = %d", (input, out) => expect(clampPage(input)).toBe(out));

  it.each([
    [Number.NaN, 20],
    [0, 20],
    [-1, 1],
    [1, 1],
    [99.9, 99],
    [MAX_LIMIT, MAX_LIMIT],
    [MAX_LIMIT + 1, MAX_LIMIT],
    [Number.POSITIVE_INFINITY, MAX_LIMIT],
  ])("clampLimit(%d) = %d", (input, out) =>
    expect(clampLimit(input)).toBe(out),
  );

  it("keeps the largest offset inside Postgres' int range", () => {
    expect((MAX_PAGE - 1) * MAX_LIMIT).toBeLessThan(2 ** 31 - 1);
  });
});

describe("parsePagination", () => {
  it.each(PAGE_CASES.flatMap((p) => LIMIT_CASES.map((l) => [p, l] as const)))(
    "page=%j limit=%j",
    ([rawPage, page], [rawLimit, limit]) => {
      const params = new URLSearchParams();
      if (rawPage !== undefined) params.set("page", rawPage);
      if (rawLimit !== undefined) params.set("limit", rawLimit);
      expect(parsePagination(params)).toEqual({ page, limit });
    },
  );
});

describe("parseSearch / parseNameQuery", () => {
  it.each(Q_CASES)("q=%j → %j", (raw, out) => {
    const params = new URLSearchParams();
    if (raw !== undefined) params.set("q", raw);
    expect(parseSearch(params)).toBe(out);
    expect(parseNameQuery(raw)).toBe(out ?? "");
  });

  it("takes the first value of an array (Next.js searchParams)", () => {
    expect(parseNameQuery(["zoro", "nami"])).toBe("zoro");
    expect(parseNameQuery([])).toBe("");
  });

  it("keeps % and _ (escaped later for ILIKE)", () => {
    expect(parseNameQuery("50%_off")).toBe("50%_off");
  });
});

describe("ageBand", () => {
  it.each([
    ["all", "all", null, null],
    ["0-12", "0-12", 0, 12],
    ["13-17", "13-17", 13, 17],
    ["18-29", "18-29", 18, 29],
    ["30-59", "30-59", 30, 59],
    ["60+", "60+", 60, null],
    ["60", "all", null, null],
    ["", "all", null, null],
    [undefined, "all", null, null],
  ] as const)("%j → %j (min %j, max %j)", (raw, band, min, max) => {
    expect(parseAgeBand(raw)).toBe(band);
    expect(ageRangeForBand(band)).toEqual({ min, max });
  });

  it("takes the first value of an array", () => {
    expect(parseAgeBand(["13-17", "60+"])).toBe("13-17");
  });
});

describe("bounty params", () => {
  it.each([
    ["true", true],
    ["TRUE", true],
    [" true ", true],
    ["false", false],
    ["False", false],
    ["", undefined],
    ["1", undefined],
    ["0", undefined],
    ["yes", undefined],
    [null, undefined],
  ] as const)("parseIsActive(%j) = %j", (raw, out) =>
    expect(parseIsActive(raw)).toBe(out),
  );

  it.each([
    ["true", "active"],
    ["false", "inactive"],
    ["TRUE", "all"],
    [undefined, "all"],
    [["false", "true"], "inactive"],
  ] as const)("parseBountyFilter(%j) = %j", (raw, out) =>
    expect(parseBountyFilter(raw as string | string[] | undefined)).toBe(out),
  );

  it.each([
    ["high", "high"],
    ["low", "low"],
    ["newest", "newest"],
    ["HIGH", "newest"],
    [undefined, "newest"],
    [["low"], "low"],
  ] as const)("parseBountySort(%j) = %j", (raw, out) =>
    expect(parseBountySort(raw as string | string[] | undefined)).toBe(out),
  );
});

describe("site catalog hrefs", () => {
  it("builds character list links, omitting defaults", () => {
    expect(
      buildCharactersListHref({ page: 1, limit: 20, q: "", ageBand: "all" }),
    ).toBe("/characters?page=1&limit=20");
    expect(
      buildCharactersListHref({
        page: 3,
        limit: 12,
        q: "monkey d",
        ageBand: "60+",
      }),
    ).toBe("/characters?page=3&limit=12&q=monkey+d&ageBand=60%2B");
  });

  it.each([
    ["all", "newest", "/bounties?page=2&limit=20"],
    ["active", "high", "/bounties?page=2&limit=20&isActive=true&sort=high"],
    ["inactive", "low", "/bounties?page=2&limit=20&isActive=false&sort=low"],
  ] as const)("builds bounty list links (%s, %s)", (filter, sort, href) => {
    expect(buildBountiesListHref({ page: 2, limit: 20, filter, sort })).toBe(
      href,
    );
  });
});

describe("isUuid", () => {
  it.each([
    ["637dd95f-248c-42a8-9dc3-9ad4531c1801", true],
    ["637DD95F-248C-42A8-9DC3-9AD4531C1801", true],
    ["00000000-0000-0000-0000-000000000000", true],
    ["637dd95f248c42a89dc39ad4531c1801", false],
    ["637dd95f-248c-42a8-9dc3-9ad4531c180", false],
    [" 637dd95f-248c-42a8-9dc3-9ad4531c1801", false],
    ["637dd95f-248c-42a8-9dc3-9ad4531c1801\n", false],
    ["z37dd95f-248c-42a8-9dc3-9ad4531c1801", false],
    ["", false],
  ])("%j → %s", (value, out) => expect(isUuid(value)).toBe(out));
});
