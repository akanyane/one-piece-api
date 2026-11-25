import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import { GET as getIndex } from "@/app/api/route";
import { GET as getSpec } from "@/app/openapi.json/route";
import { MAX_LIMIT, MAX_PAGE } from "@/lib/api-params";
import { openApiSpec } from "@/lib/openapi";

const API_DIR = join(process.cwd(), "src/app/api");

/** Every route.ts under src/app/api as an OpenAPI path, e.g. "/api/ships/{id}". */
function routePaths(dir = API_DIR): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return routePaths(full);
    if (entry !== "route.ts") return [];
    const rel = relative(API_DIR, dir).split(sep).filter(Boolean);
    return [
      `/api${rel.map((s) => `/${s.replace(/^\[(.+)\]$/, "{$1}")}`).join("")}`,
    ];
  });
}

type Op = {
  operationId: string;
  parameters?: ({ $ref: string } | { name: string; in: string })[];
  responses: Record<string, { headers?: Record<string, unknown> }>;
};
const paths = openApiSpec.paths as unknown as Record<string, { get: Op }>;
const paramNames = (op: Op) =>
  (op.parameters ?? []).map((p) =>
    "$ref" in p ? p.$ref.split("/").pop() : p.name,
  );

describe("GET /api", () => {
  it("maps every resource to its absolute www URL", async () => {
    const res = await getIndex();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("s-maxage=60");
    expect(await res.json()).toEqual({
      characters: "https://www.onepieceapi.com/api/characters",
      devilFruits: "https://www.onepieceapi.com/api/devil-fruits",
      bounties: "https://www.onepieceapi.com/api/bounties",
      ships: "https://www.onepieceapi.com/api/ships",
      islands: "https://www.onepieceapi.com/api/islands",
      affiliations: "https://www.onepieceapi.com/api/affiliations",
      openapi: "https://www.onepieceapi.com/openapi.json",
      documentation: "https://www.onepieceapi.com/documentation",
    });
  });
});

describe("GET /openapi.json", () => {
  it("serves the spec as JSON", async () => {
    const res = getSpec();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(JSON.parse(JSON.stringify(openApiSpec)));
  });
});

describe("OpenAPI spec ↔ route handlers", () => {
  it("documents exactly the routes that exist", () => {
    expect(Object.keys(paths).sort()).toEqual(routePaths().sort());
  });

  it("has unique operationIds", () => {
    const ids = Object.values(paths).map((p) => p.get.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  const lists = Object.entries(paths).filter(
    ([p]) => p !== "/api" && !p.endsWith("{id}"),
  );
  const details = Object.entries(paths).filter(([p]) => p.endsWith("{id}"));

  it.each(lists)(
    "%s takes page, limit and q and documents the pagination headers",
    (_p, { get }) => {
      expect(paramNames(get)).toEqual(
        expect.arrayContaining(["page", "limit", "q"]),
      );
      expect(Object.keys(get.responses["200"].headers ?? {}).sort()).toEqual([
        "Link",
        "X-Total-Count",
      ]);
    },
  );

  it.each(details)("%s documents 200, 400, 404 and 500", (_p, { get }) => {
    expect(paramNames(get)).toEqual(["id"]);
    expect(Object.keys(get.responses).sort()).toEqual([
      "200",
      "400",
      "404",
      "500",
    ]);
  });

  it("matches the real pagination bounds", () => {
    const { page, limit } = openApiSpec.components.parameters;
    expect(page.schema).toMatchObject({
      minimum: 1,
      maximum: MAX_PAGE,
      default: 1,
    });
    expect(limit.schema).toMatchObject({
      minimum: 1,
      maximum: MAX_LIMIT,
      default: 20,
    });
  });

  it("resolves every $ref", () => {
    const refs = JSON.stringify(openApiSpec).match(/"\$ref":"#\/[^"]+"/g) ?? [];
    expect(refs.length).toBeGreaterThan(0);
    for (const raw of refs) {
      const pointer = raw.slice(9, -1).split("/").slice(1);
      let node: unknown = openApiSpec;
      for (const key of pointer)
        node = (node as Record<string, unknown>)?.[key];
      expect(node, raw).toBeDefined();
    }
  });

  it("has component schemas that compile as JSON Schema 2020-12", () => {
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    ajv.addSchema({ $id: "spec", components: openApiSpec.components });
    for (const name of Object.keys(openApiSpec.components.schemas)) {
      expect(
        ajv.getSchema(`spec#/components/schemas/${name}`),
        name,
      ).toBeTypeOf("function");
    }
  });
});
