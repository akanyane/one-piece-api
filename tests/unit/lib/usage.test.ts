import { describe, expect, it } from "vitest";

import {
  classifyClient,
  E2E_USER_AGENT,
  normalizeApiPath,
  originHost,
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
