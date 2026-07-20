import { headers } from "next/headers";
import { cache } from "react";

import type { ApiCharacter } from "@/components/characters/character-card";

export type CharacterDetailResult =
  | { ok: true; data: ApiCharacter }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false };

export const getCharacterDetail = cache(
  async (id: string): Promise<CharacterDetailResult> => {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const url = `${proto}://${host}/api/characters/${encodeURIComponent(id)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };

    const data = (await res.json()) as ApiCharacter;
    return { ok: true, data };
  },
);
