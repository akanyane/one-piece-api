import { describe, expect, it, vi } from "vitest";

import { GET as getAffiliation } from "@/app/api/affiliations/[id]/route";
import { GET as getBounty } from "@/app/api/bounties/[id]/route";
import { GET as getCharacter } from "@/app/api/characters/[id]/route";
import { GET as getDevilFruit } from "@/app/api/devil-fruits/[id]/route";
import { GET as getIsland } from "@/app/api/islands/[id]/route";
import { GET as getShip } from "@/app/api/ships/[id]/route";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

type Handler = (
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) => Promise<Response>;

const RESOURCES: {
  path: string;
  table: string;
  select: string;
  GET: Handler;
  row: Record<string, unknown>;
  expected?: Record<string, unknown>;
}[] = [
  {
    path: "characters",
    table: "characters",
    select: "*, bounties(*)",
    GET: getCharacter,
    row: { id: "x", bounties: [] },
  },
  {
    path: "devil-fruits",
    table: "devil_fruits",
    select: "*",
    GET: getDevilFruit,
    row: { id: "x", type: "Zoan" },
  },
  {
    path: "bounties",
    table: "bounties",
    select: "*, characters(name, image_url, status)",
    GET: getBounty,
    row: { id: "x", amount: 1, characters: null },
  },
  {
    path: "ships",
    table: "ships",
    select: "*",
    GET: getShip,
    row: { id: "x", status: "Active" },
  },
  {
    path: "islands",
    table: "islands",
    select: "*",
    GET: getIsland,
    row: { id: "x", sea: "East Blue" },
  },
  {
    path: "affiliations",
    table: "affiliations",
    select: "*, character_affiliations(count)",
    GET: getAffiliation,
    row: {
      id: "x",
      name: { en: "Straw Hat Pirates" },
      character_affiliations: [{ count: 14 }],
    },
    // The aggregate is flattened into memberCount, as in the list.
    expected: { id: "x", name: { en: "Straw Hat Pirates" }, memberCount: 14 },
  },
];

const VALID_IDS = [
  "637dd95f-248c-42a8-9dc3-9ad4531c1801",
  "637DD95F-248C-42A8-9DC3-9AD4531C1801",
  "00000000-0000-0000-0000-000000000000",
];
const INVALID_IDS = [
  "not-a-uuid",
  "",
  " ",
  "123",
  "637dd95f-248c-42a8-9dc3-9ad4531c180",
  "637dd95f-248c-42a8-9dc3-9ad4531c18011",
  "637dd95f248c42a89dc39ad4531c1801",
  "g37dd95f-248c-42a8-9dc3-9ad4531c1801",
  "637dd95f-248c-42a8-9dc3-9ad4531c1801;drop",
  "' or 1=1 --",
  "%00",
];

const req = (path: string, id: string) =>
  new Request(
    `https://www.onepieceapi.com/api/${path}/${encodeURIComponent(id)}`,
  );
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe.each(RESOURCES)(
  "GET /api/$path/{id}",
  ({ path, table, select, GET, row, expected }) => {
    it.each(VALID_IDS)("200 with the row for %s", async (id) => {
      respond(() => ({ data: row }));
      const res = await GET(req(path, id), ctx(id));

      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe(
        "public, s-maxage=60, stale-while-revalidate=300",
      );
      expect(await res.json()).toEqual(expected ?? row);
      expect(recorded).toHaveLength(1);
      const query = recorded[0];
      expect(query.table).toBe(table);
      expect(call(query, "select")).toEqual([select]);
      expect(call(query, "eq")).toEqual(["id", id]);
      expect(calls(query, "maybeSingle")).toEqual([[]]);
    });

    it.each(VALID_IDS)("404 when %s does not exist", async (id) => {
      respond(() => ({ data: null }));
      const res = await GET(req(path, id), ctx(id));
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Not found" });
    });

    it.each(INVALID_IDS)(
      "400 for %j without querying the database",
      async (id) => {
        const res = await GET(req(path, id), ctx(id));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid id" });
        expect(recorded).toHaveLength(0);
      },
    );

    it("400 when Postgres reports a data exception", async () => {
      respond(() => ({ error: { code: "22P02" } }));
      const res = await GET(req(path, VALID_IDS[0]), ctx(VALID_IDS[0]));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid request" });
    });

    it("500 without leaking internals on other errors", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      respond(() => ({ error: { code: "XX000", message: "disk on fire" } }));
      const res = await GET(req(path, VALID_IDS[0]), ctx(VALID_IDS[0]));
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("disk");
      expect(log).toHaveBeenCalled();
    });
  },
);
