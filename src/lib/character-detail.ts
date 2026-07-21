import { cache } from "react";

import type { ApiCharacter } from "@/components/characters/character-card";
import { getCharacterById } from "@/lib/data";

export type CharacterDetailResult =
  | { ok: true; data: ApiCharacter }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false };

export const getCharacterDetail = cache(
  async (id: string): Promise<CharacterDetailResult> => {
    try {
      const data = await getCharacterById(id);
      if (!data) return { ok: false, notFound: true };
      return { ok: true, data: data as ApiCharacter };
    } catch {
      return { ok: false, notFound: false };
    }
  },
);
