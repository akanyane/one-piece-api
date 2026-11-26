import { describe, expect, it } from "vitest";

import {
  agentName,
  classifyClient,
  clientIp,
  E2E_USER_AGENT,
  normalizeApiPath,
  originHost,
  trackedParams,
  visitorId,
} from "@/lib/api-usage";

const ID = "637dd95f-248c-42a8-9dc3-9ad4531c1801";

describe("normalizeApiPath", () => {
  it.each([
    ["/api", "/api"],
    ["/api/", "/api"],
    ["/openapi.json", "/openapi.json"],
    ...[
      "characters",
      "devil-fruits",
      "bounties",
      "ships",
      "islands",
      "affiliations",
    ].flatMap((r) => [
      [`/api/${r}`, `/api/${r}`],
      [`/api/${r}/`, `/api/${r}`],
      [`/api/${r}/${ID}`, `/api/${r}/{id}`],
      [`/api/${r}/${ID.toUpperCase()}`, `/api/${r}/{id}`],
      [`/api/${r}/not-a-uuid`, `/api/${r}/{invalid}`],
    ]),
    ["/api/images/luffy.png", "other"],
    ["/api/characters/x/y", "other"],
    [`/api/unknown/${ID}`, "other"],
    ["/wp-admin", "other"],
    ["/", "other"],
  ])("%s → %s", (path, out) => expect(normalizeApiPath(path)).toBe(out));
});

describe("classifyClient", () => {
  it.each([
    [null, "none"],
    ["", "none"],
    ["curl/8.5.0", "curl"],
    ["Wget/1.21", "wget"],
    ["python-requests/2.32.3", "python"],
    ["Python/3.12 aiohttp/3.9", "python"],
    ["python-httpx/0.27", "python"],
    ["PostmanRuntime/7.39.0", "postman"],
    ["insomnia/2023.5.8", "insomnia"],
    ["Go-http-client/2.0", "go"],
    ["axios/1.7.2", "node"],
    ["node", "node"],
    ["undici", "node"],
    ["Bun/1.1.0", "node"],
    ["okhttp/4.12.0", "java"],
    ["Java/21", "java"],
    ["Dart/3.4 (dart:io)", "dart"],
    ["Ruby", "ruby"],
    ["GuzzleHttp/7", "php"],
    ["reqwest/0.12", "rust"],
    ["Dalvik/2.1.0 (Linux; Android 14)", "mobile"],
    ["MyApp/1 CFNetwork/1490 Darwin/23.2.0", "mobile"],
    ["Mozilla/5.0 (Windows NT 10.0) Chrome/131", "browser"],
    ["Mozilla/5.0 (compatible; Googlebot/2.1)", "bot"],
    ["Mozilla/5.0 HeadlessChrome/120", "bot"],
    ["AnimeArchive-Scraper/1.0", "bot"],
    ["Mozilla/5.0 (compatible; Lighthouse)", "bot"],
    ["SomethingElse/1.0", "other"],
  ])("%j → %s", (ua, out) => expect(classifyClient(ua)).toBe(out));

  it("has a stable e2e user agent prefix", () => {
    expect(E2E_USER_AGENT).toBe("one-piece-api-e2e");
  });
});

describe("originHost", () => {
  it.each([
    [null, ""],
    ["", ""],
    ["null", ""],
    ["https://example.dev", "example.dev"],
    ["https://Example.DEV:8443", "example.dev:8443"],
    ["http://localhost:5173", "localhost:5173"],
    ["not a url", ""],
  ])("%j → %j", (origin, out) => expect(originHost(origin)).toBe(out));
});

describe("agentName", () => {
  it.each([
    ["Dataview/2.1 (+https://x.example)", "other", "Dataview"],
    ["PostmanRuntime/7.39.0", "other", "PostmanRuntime"],
    ["  weird agent ", "other", "weird"],
    ["(no product)", "other", ""],
    [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com/bot.html)",
      "bot",
      "Googlebot",
    ],
    ["Mozilla/5.0 (compatible; bingbot/2.0)", "bot", "bingbot"],
    ["Mozilla/5.0 HeadlessChrome/120.0", "bot", "HeadlessChrome"],
    ["Mozilla/5.0 Chrome-Lighthouse", "bot", "Chrome-Lighthouse"],
    ["Mozilla/5.0 (Windows NT 10.0)", "browser", ""],
    ["curl/8.4.0", "curl", ""],
    [null, "none", ""],
    ["x".repeat(80), "other", "x".repeat(40)],
  ])("%j (%s) → %j", (ua, client, expected) => {
    expect(agentName(ua, client)).toBe(expected);
  });
});

describe("trackedParams", () => {
  const p = (qs: string) => new URLSearchParams(qs);

  it("ignores non-list paths", () => {
    expect(trackedParams("/api", p("page=2"))).toEqual([]);
    expect(trackedParams("/api/ships/{id}", p("q=x"))).toEqual([]);
    expect(trackedParams("other", p("q=x"))).toEqual([]);
  });

  it.each([
    ["1", "1"],
    ["2", "2-5"],
    ["5", "2-5"],
    ["6", "6-20"],
    ["20", "6-20"],
    ["21", "21+"],
    ["0", "invalid"],
    ["-3", "invalid"],
    ["1.5", "invalid"],
    ["abc", "invalid"],
  ])("page=%s → %s", (raw, value) => {
    expect(trackedParams("/api/ships", p(`page=${raw}`))).toEqual([
      { param: "page", value },
    ]);
  });

  it.each([
    ["1", "1"],
    ["100", "100"],
    ["101", ">100"],
    ["0", "invalid"],
    ["ten", "invalid"],
  ])("limit=%s → %s", (raw, value) => {
    expect(trackedParams("/api/islands", p(`limit=${raw}`))).toEqual([
      { param: "limit", value },
    ]);
  });

  it("normalizes the search text and enum values", () => {
    expect(
      trackedParams(
        "/api/bounties",
        p(`q=${encodeURIComponent("  Big   MOM ")}&isActive=TRUE&sort=High`),
      ),
    ).toEqual([
      { param: "q", value: "big mom" },
      { param: "isActive", value: "true" },
      { param: "sort", value: "high" },
    ]);
    expect(
      trackedParams("/api/characters", p(`ageBand=Adult&q=${"z".repeat(60)}`)),
    ).toEqual([
      { param: "q", value: "z".repeat(40) },
      { param: "ageBand", value: "adult" },
    ]);
  });

  it("skips empty values and records unsupported params once by name", () => {
    expect(
      trackedParams(
        "/api/devil-fruits",
        p("q=%20&page=&Type=logia&type=x&TYPE=y&fields=name"),
      ),
    ).toEqual([
      { param: "other", value: "type" },
      { param: "other", value: "fields" },
    ]);
  });

  it("caps the list at 8 entries", () => {
    const qs = Array.from({ length: 12 }, (_, i) => `x${i}=1`).join("&");
    expect(trackedParams("/api/affiliations", p(qs))).toHaveLength(8);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip, then the first x-forwarded-for hop", () => {
    expect(
      clientIp(
        new Headers({ "x-real-ip": " 1.1.1.1 ", "x-forwarded-for": "2.2.2.2" }),
      ),
    ).toBe("1.1.1.1");
    expect(
      clientIp(new Headers({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" })),
    ).toBe("2.2.2.2");
    expect(clientIp(new Headers())).toBe("");
  });
});

describe("visitorId", () => {
  it("is a stable 16-hex id per secret, day and IP", async () => {
    const id = await visitorId("1.1.1.1", "k", "2026-11-26");
    expect(id).toMatch(/^[0-9a-f]{16}$/);
    expect(await visitorId("1.1.1.1", "k", "2026-11-26")).toBe(id);
    expect(await visitorId("1.1.1.1", "k", "2026-11-27")).not.toBe(id);
    expect(await visitorId("1.1.1.1", "other", "2026-11-26")).not.toBe(id);
    expect(await visitorId("1.1.1.2", "k", "2026-11-26")).not.toBe(id);
  });

  it("is empty without an IP", async () => {
    expect(await visitorId("", "k", "2026-11-26")).toBe("");
  });
});
