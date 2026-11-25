import { describe, expect, it } from "vitest";
import { openApiSpec } from "@/lib/openapi";
import {
  buildRequestUrl,
  endpointById,
  PLAYGROUND_ENDPOINTS,
} from "@/lib/playground-endpoints";

const BASE = "https://www.onepieceapi.com";

describe("playground endpoints", () => {
  it("only offers paths the API documents", () => {
    for (const ep of PLAYGROUND_ENDPOINTS) {
      expect(Object.keys(openApiSpec.paths), ep.path).toContain(ep.path);
    }
  });

  it("offers page, limit and q on every list endpoint", () => {
    for (const ep of PLAYGROUND_ENDPOINTS.filter(
      (e) => e.path !== "/api" && !e.path.includes("{id}"),
    )) {
      expect(
        ep.params.map((p) => p.name),
        ep.path,
      ).toEqual(expect.arrayContaining(["page", "limit", "q"]));
    }
  });

  it("falls back to the first endpoint for an unknown id", () => {
    expect(endpointById("nope")).toBe(PLAYGROUND_ENDPOINTS[0]);
    expect(endpointById("ships").path).toBe("/api/ships");
  });
});

describe("buildRequestUrl", () => {
  const ships = endpointById("ships");
  const character = endpointById("character");

  it.each([
    [{}, `${BASE}/api/ships`],
    [{ page: "2" }, `${BASE}/api/ships?page=2`],
    [{ page: " 2 ", limit: "", q: "  " }, `${BASE}/api/ships?page=2`],
    [{ q: "thousand sunny" }, `${BASE}/api/ships?q=thousand%20sunny`],
    [{ q: "a&b=c" }, `${BASE}/api/ships?q=a%26b%3Dc`],
    [{ unknown: "x" }, `${BASE}/api/ships`],
  ])("ships %j → %s", (values, url) => {
    expect(buildRequestUrl(BASE, ships, values)).toBe(url);
  });

  it("substitutes and encodes the path id, never as a query param", () => {
    expect(buildRequestUrl(BASE, character, { id: " abc/def " })).toBe(
      `${BASE}/api/characters/abc%2Fdef`,
    );
  });

  it("builds same-origin URLs with an empty base", () => {
    expect(buildRequestUrl("", ships, { limit: "5" })).toBe(
      "/api/ships?limit=5",
    );
  });
});
