import { describe, expect, it } from "vitest";

import { GET as getAffiliation } from "@/app/api/affiliations/[id]/route";
import { GET as getCharacter } from "@/app/api/characters/[id]/route";
import { GET as listCharacters } from "@/app/api/characters/route";
import { GET as getDevilFruit } from "@/app/api/devil-fruits/[id]/route";
import { GET as listDevilFruits } from "@/app/api/devil-fruits/route";
import { respond } from "../../helpers/supabase-mock";

/** How junction-table embeds are flattened into relation arrays. */

const ID = "637dd95f-248c-42a8-9dc3-9ad4531c1801";
const ctx = { params: Promise.resolve({ id: ID }) };
const url = (path: string) => new Request(`https://www.onepieceapi.com${path}`);

const fruit = (id: string, en: string) => ({
  id,
  name: { en, jp: null, romaji: null },
  type: "Paramecia",
  sub_type: null,
  image_url: `${id}.webp`,
});
const aff = (id: string, en: string | null) => ({
  id,
  name: en === null ? null : { en, jp: null, romaji: null },
});
const person = (id: string, en: string, status = "Alive") => ({
  id,
  name: { en, jp: null, romaji: null },
  image_url: null,
  status,
});

/** Big Mom, as the database returns her: unsorted links, one null target, one null is_active. */
const LINLIN = {
  id: ID,
  name: { en: "Charlotte Linlin" },
  bounties: [{ id: "b1", amount: 4_388_000_000, is_active: true }],
  character_devil_fruits: [
    { is_active: false, devil_fruits: fruit("f2", "Zeta Fruit") },
    { is_active: null, devil_fruits: fruit("f1", "Soul-Soul Fruit") },
    { is_active: true, devil_fruits: null },
  ],
  character_affiliations: [
    { is_active: false, affiliations: aff("a9", "Rocks Pirates") },
    { is_active: true, affiliations: aff("a3", "Four Emperors") },
    { is_active: true, affiliations: aff("a1", "Big Mom Pirates") },
    { is_active: true, affiliations: aff("a0", null) },
    { is_active: true, affiliations: aff("a2", "Big Mom Pirates") },
  ],
};

const LINLIN_API = {
  id: ID,
  name: { en: "Charlotte Linlin" },
  bounties: LINLIN.bounties,
  devil_fruits: [
    // null is_active counts as current; current first.
    { ...fruit("f1", "Soul-Soul Fruit"), is_active: true },
    { ...fruit("f2", "Zeta Fruit"), is_active: false },
  ],
  affiliations: [
    // Current first, then English name (missing name sorts first), then id.
    { ...aff("a0", null), is_active: true },
    { ...aff("a1", "Big Mom Pirates"), is_active: true },
    { ...aff("a2", "Big Mom Pirates"), is_active: true },
    { ...aff("a3", "Four Emperors"), is_active: true },
    { ...aff("a9", "Rocks Pirates"), is_active: false },
  ],
};

describe("characters embed devil_fruits and affiliations", () => {
  it("GET /api/characters/{id} flattens and sorts the links", async () => {
    respond(() => ({ data: LINLIN }));
    const body = await (
      await getCharacter(url(`/api/characters/${ID}`), ctx)
    ).json();
    expect(body).toEqual(LINLIN_API);
    expect(body).not.toHaveProperty("character_devil_fruits");
    expect(body).not.toHaveProperty("character_affiliations");
  });

  it("GET /api/characters shapes every item the same way", async () => {
    respond(() => ({ data: [LINLIN, { ...LINLIN, id: "other" }], count: 2 }));
    const body = await (await listCharacters(url("/api/characters"))).json();
    expect(body).toEqual([LINLIN_API, { ...LINLIN_API, id: "other" }]);
  });

  it("copes with missing junction arrays", async () => {
    respond(() => ({
      data: {
        id: ID,
        character_devil_fruits: null,
        character_affiliations: null,
      },
    }));
    const body = await (
      await getCharacter(url(`/api/characters/${ID}`), ctx)
    ).json();
    expect(body).toEqual({ id: ID, devil_fruits: [], affiliations: [] });
  });
});

describe("devil fruits embed users", () => {
  const SOUL = {
    id: ID,
    name: { en: "Soul-Soul Fruit" },
    character_devil_fruits: [
      {
        is_active: false,
        characters: person("c-carmel", "Carmel", "Deceased"),
      },
      { is_active: true, characters: person("c-linlin", "Charlotte Linlin") },
      { is_active: true, characters: null },
    ],
  };
  const SOUL_API = {
    id: ID,
    name: { en: "Soul-Soul Fruit" },
    users: [
      { ...person("c-linlin", "Charlotte Linlin"), is_active: true },
      { ...person("c-carmel", "Carmel", "Deceased"), is_active: false },
    ],
  };

  it("GET /api/devil-fruits/{id}", async () => {
    respond(() => ({ data: SOUL }));
    expect(
      await (await getDevilFruit(url(`/api/devil-fruits/${ID}`), ctx)).json(),
    ).toEqual(SOUL_API);
  });

  it("GET /api/devil-fruits", async () => {
    respond(() => ({ data: [SOUL], count: 1 }));
    expect(
      await (await listDevilFruits(url("/api/devil-fruits"))).json(),
    ).toEqual([SOUL_API]);
  });
});

describe("affiliation detail embeds members", () => {
  it("lists every member, current first, with a matching memberCount", async () => {
    respond(() => ({
      data: {
        id: ID,
        name: { en: "Straw Hat Pirates" },
        character_affiliations: [
          { is_active: true, characters: person("z", "Roronoa Zoro") },
          { is_active: false, characters: person("c", "Carrot") },
          { is_active: true, characters: person("l", "Monkey D. Luffy") },
          { is_active: true, characters: null },
        ],
      },
    }));
    const body = await (
      await getAffiliation(url(`/api/affiliations/${ID}`), ctx)
    ).json();
    expect(body).toEqual({
      id: ID,
      name: { en: "Straw Hat Pirates" },
      memberCount: 3,
      members: [
        { ...person("l", "Monkey D. Luffy"), is_active: true },
        { ...person("z", "Roronoa Zoro"), is_active: true },
        { ...person("c", "Carrot"), is_active: false },
      ],
    });
  });

  it("handles an affiliation with no members", async () => {
    respond(() => ({
      data: { id: ID, name: null, character_affiliations: null },
    }));
    const body = await (
      await getAffiliation(url(`/api/affiliations/${ID}`), ctx)
    ).json();
    expect(body).toEqual({ id: ID, name: null, memberCount: 0, members: [] });
  });
});
