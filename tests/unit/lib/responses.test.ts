import { describe, expect, it } from "vitest";

import { apiJson, apiPage } from "@/lib/api-response";
import { parseLinkPages } from "@/lib/link-header";
import { parseLink } from "../../helpers/cases";
import { combinations } from "../../helpers/combos";

describe("apiJson", () => {
  it("adds the CDN cache header and keeps the caller's headers and status", async () => {
    const res = apiJson(
      { ok: true },
      { status: 201, headers: { "X-Test": "1" } },
    );
    expect(res.status).toBe(201);
    expect(res.headers.get("x-test")).toBe("1");
    expect(res.headers.get("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe("apiPage: every page position × total × limit", () => {
  const cases = combinations({
    page: [1, 2, 3, 5, 6, 50],
    limit: [1, 10, 20, 100],
    total: [0, 1, 19, 20, 21, 100, 101, 1431],
  });

  it.each(cases)(
    "page=$page limit=$limit total=$total",
    ({ page, limit, total }) => {
      const res = apiPage(
        new Request(
          "https://www.onepieceapi.com/api/ships?q=sunny&page=9&limit=999",
        ),
        [],
        { page, limit, total },
      );
      const last = Math.max(1, Math.ceil(total / limit));
      const links = parseLink(res.headers.get("link"));

      expect(res.headers.get("x-total-count")).toBe(String(total));
      expect(links.first.searchParams.get("page")).toBe("1");
      expect(links.last.searchParams.get("page")).toBe(String(last));
      expect(links.prev?.searchParams.get("page")).toBe(
        page > 1 ? String(Math.min(page - 1, last)) : undefined,
      );
      expect(links.next?.searchParams.get("page")).toBe(
        page < last ? String(page + 1) : undefined,
      );
      for (const url of Object.values(links)) {
        // Clamped limit replaces the raw one; other params survive.
        expect(url.searchParams.get("limit")).toBe(String(limit));
        expect(url.searchParams.get("q")).toBe("sunny");
        expect(url.origin + url.pathname).toBe(
          "https://www.onepieceapi.com/api/ships",
        );
      }
    },
  );

  it("round-trips through the playground's Link parser", () => {
    const res = apiPage(
      new Request("https://www.onepieceapi.com/api/islands"),
      [],
      {
        page: 2,
        limit: 20,
        total: 86,
      },
    );
    expect(parseLinkPages(res.headers.get("link"))).toEqual({
      first: 1,
      prev: 1,
      next: 3,
      last: 5,
    });
  });

  it("uses the request origin (preview/localhost) in links", () => {
    const res = apiPage(new Request("http://localhost:3000/api/ships"), [], {
      page: 1,
      limit: 20,
      total: 50,
    });
    expect(parseLink(res.headers.get("link")).next.origin).toBe(
      "http://localhost:3000",
    );
  });
});

describe("parseLinkPages", () => {
  it.each([
    [null, {}],
    ["", {}],
    ['<https://x/api?page=4&limit=2>; rel="next"', { next: 4 }],
    [
      '</api/ships?page=2>;rel="prev", </api/ships?page=9>;  rel="last"',
      { prev: 2, last: 9 },
    ],
    ['<https://x/api?page=3>; rel="self"', {}],
    ['<https://x/api?limit=2>; rel="next"', {}],
    [
      '<https://x/api?page=0>; rel="first", <https://x/api?page=-1>; rel="last"',
      {},
    ],
    ['<https://x/api?page=2.5>; rel="next"', {}],
    ["garbage", {}],
  ])("%j → %j", (header, out) => expect(parseLinkPages(header)).toEqual(out));
});

describe("errorResponse", async () => {
  const { errorResponse } = await import("@/lib/api-error");
  const { vi } = await import("vitest");

  it.each([
    ["22P02", 400],
    ["22003", 400],
    ["23505", 500],
    ["PGRST116", 500],
    [undefined, 500],
  ])("code %j → %i", async (code, status) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse({
      code,
      message: "m",
      details: "",
      hint: "",
      name: "PostgrestError",
    } as never);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({
      error: status === 400 ? "Invalid request" : "Internal server error",
    });
  });
});
