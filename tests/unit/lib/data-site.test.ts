import { describe, expect, it } from "vitest";

import {
  getAffiliationProfile,
  getAllAffiliationIds,
  getAllCharacterIds,
  getAllDevilFruitIds,
  getCharacterProfile,
  getCharacters,
  getCrewmates,
  getDevilFruitProfile,
  getMostWanted,
  getRelatedFruits,
  getSiteStats,
} from "@/lib/data";
import { call, calls, recorded, respond } from "../../helpers/supabase-mock";

/** Data functions used by the website pages (not the public API). */

const DB_ERROR = { code: "XX000", message: "boom" };

describe("getCharacters (site catalog)", () => {
  it("puts characters with a portrait first when asked", async () => {
    respond(() => ({ data: [], count: 0 }));
    await getCharacters({ page: 1, limit: 12, portraitsFirst: true });
    expect(calls(recorded[0], "order")).toEqual([
      ["image_url", { ascending: true, nullsFirst: false }],
      ["created_at", { ascending: false }],
      ["id", { ascending: true }],
    ]);
  });
});

describe("getAllCharacterIds / getAllDevilFruitIds / getAllAffiliationIds (sitemap)", () => {
  it("returns every character id, newest first", async () => {
    respond(() => ({ data: [{ id: "a", created_at: "t" }] }));
    expect(await getAllCharacterIds()).toEqual([{ id: "a", created_at: "t" }]);
    expect(call(recorded[0], "select")).toEqual(["id, created_at"]);
    expect(call(recorded[0], "limit")).toEqual([10000]);
  });

  it.each([
    ["devil_fruits", getAllDevilFruitIds],
    ["affiliations", getAllAffiliationIds],
  ] as const)("returns every %s id", async (table, fn) => {
    respond(() => ({ data: [{ id: "x" }] }));
    expect(await fn()).toEqual([{ id: "x" }]);
    expect(recorded[0].table).toBe(table);
  });

  it.each([getAllCharacterIds, getAllDevilFruitIds, getAllAffiliationIds])(
    "throws on error (%#)",
    async (fn) => {
      respond(() => ({ error: DB_ERROR }));
      await expect(fn()).rejects.toEqual(DB_ERROR);
    },
  );
});

describe("getSiteStats", () => {
  it("counts every resource table with HEAD queries", async () => {
    const counts: Record<string, number | null> = {
      characters: 1431,
      devil_fruits: 210,
      bounties: 412,
      ships: 50,
      islands: 86,
      affiliations: null,
    };
    respond((q) => ({ count: counts[q.table] }));
    expect(await getSiteStats()).toEqual({ ...counts, affiliations: 0 });
    for (const q of recorded)
      expect(call(q, "select")).toEqual(["*", { count: "exact", head: true }]);
  });

  it("throws if any count fails", async () => {
    respond((q) => (q.table === "ships" ? { error: DB_ERROR } : { count: 1 }));
    await expect(getSiteStats()).rejects.toEqual(DB_ERROR);
  });
});

describe("getMostWanted", () => {
  const c = (id: string) => ({
    id,
    name: { en: id },
    image_url: `${id}.webp`,
    status: "Alive",
  });

  it("returns the highest active bounties, one per character", async () => {
    respond(() => ({
      data: [
        { amount: 5_000, characters: c("luffy") },
        { amount: 4_000, characters: c("luffy") },
        { amount: 3_000, characters: null },
        { amount: null, characters: c("ghost") },
        { amount: 2_000, characters: c("zoro") },
        { amount: 1_000, characters: c("sanji") },
      ],
    }));
    expect(await getMostWanted(2)).toEqual([
      { ...c("luffy"), amount: 5_000 },
      { ...c("zoro"), amount: 2_000 },
    ]);
    const q = recorded[0];
    expect(call(q, "eq")).toEqual(["is_active", true]);
    expect(calls(q, "not")).toEqual([
      ["amount", "is", null],
      ["characters.image_url", "is", null],
    ]);
    expect(call(q, "order")).toEqual(["amount", { ascending: false }]);
    // Over-fetches to survive duplicates.
    expect(call(q, "limit")).toEqual([6]);
  });

  it("returns fewer when there aren't enough", async () => {
    respond(() => ({ data: null }));
    expect(await getMostWanted(5)).toEqual([]);
  });

  it("throws on error", async () => {
    respond(() => ({ error: DB_ERROR }));
    await expect(getMostWanted(3)).rejects.toEqual(DB_ERROR);
  });
});

describe("profiles", () => {
  it.each([
    [
      getCharacterProfile,
      "characters",
      "character_affiliations(is_active, affiliations(id, name))",
    ],
    [
      getDevilFruitProfile,
      "devil_fruits",
      "character_devil_fruits(is_active, characters(",
    ],
    [
      getAffiliationProfile,
      "affiliations",
      "character_affiliations(is_active, characters(",
    ],
  ] as const)("%#: loads %s with its relations", async (fn, table, embed) => {
    respond(() => ({ data: { id: "p1" } }));
    expect(await fn("p1")).toEqual({ id: "p1" });
    expect(recorded[0].table).toBe(table);
    expect(String(call(recorded[0], "select")[0])).toContain(embed);
    expect(call(recorded[0], "eq")).toEqual(["id", "p1"]);
  });

  it.each([getCharacterProfile, getDevilFruitProfile, getAffiliationProfile])(
    "%#: null when missing, throws on error",
    async (fn) => {
      respond(() => ({ data: null }));
      expect(await fn("p1")).toBeNull();
      respond(() => ({ error: DB_ERROR }));
      await expect(fn("p1")).rejects.toEqual(DB_ERROR);
    },
  );
});

describe("getCrewmates", () => {
  const member = (id: string, amounts: (number | null)[]) => ({
    characters: {
      id,
      name: { en: id },
      image_url: `${id}.webp`,
      status: "Alive",
      bounties: amounts.map((amount) => ({ amount, is_active: true })),
    },
  });

  it("returns up to 8 other members, highest bounty first", async () => {
    respond(() => ({
      data: [
        member("usopp", [500]),
        member("chopper", [1000]),
        { characters: null },
        member("luffy", [3_000, 5_000]),
        member("nobounty", []),
        member("nulls", [null]),
        ...["a", "b", "c", "d", "e"].map((id) => member(id, [1])),
      ],
    }));
    const out = await getCrewmates("shp", "zoro");
    expect(out).toHaveLength(8);
    expect(out.slice(0, 3).map((c) => c.id)).toEqual([
      "luffy",
      "chopper",
      "usopp",
    ]);
    const q = recorded[0];
    expect(call(q, "eq")).toEqual(["affiliation_id", "shp"]);
    expect(call(q, "neq")).toEqual(["character_id", "zoro"]);
    expect(call(q, "limit")).toEqual([40]);
  });

  it("handles null data and throws on error", async () => {
    respond(() => ({ data: null }));
    expect(await getCrewmates("a", "b")).toEqual([]);
    respond(() => ({ error: DB_ERROR }));
    await expect(getCrewmates("a", "b")).rejects.toEqual(DB_ERROR);
  });
});

describe("getRelatedFruits", () => {
  const fruits = Array.from({ length: 6 }, (_, i) => ({ id: `f${i}` }));

  it("returns 4 other fruits of the type, rotated by the excluded id", async () => {
    respond(() => ({ data: fruits }));
    // "b".charCodeAt(0) = 98, 98 % 6 = 2 → starts at f2.
    expect((await getRelatedFruits("Zoan", "b-id")).map((f) => f.id)).toEqual([
      "f2",
      "f3",
      "f4",
      "f5",
    ]);
    const q = recorded[0];
    expect(call(q, "eq")).toEqual(["type", "Zoan"]);
    expect(call(q, "neq")).toEqual(["id", "b-id"]);
    expect(call(q, "not")).toEqual(["image_url", "is", null]);
  });

  it("wraps around and copes with no rows", async () => {
    respond(() => ({ data: fruits }));
    // "e" = 101, 101 % 6 = 5 → f5, f0, f1, f2.
    expect((await getRelatedFruits("Zoan", "e")).map((f) => f.id)).toEqual([
      "f5",
      "f0",
      "f1",
      "f2",
    ]);
    respond(() => ({ data: null }));
    expect(await getRelatedFruits("Logia", "x")).toEqual([]);
    respond(() => ({ error: DB_ERROR }));
    await expect(getRelatedFruits("Logia", "x")).rejects.toEqual(DB_ERROR);
  });
});
