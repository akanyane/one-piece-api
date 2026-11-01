import { cache } from "react";

import { getCharacterProfile } from "@/lib/data";

export type CharacterProfile = NonNullable<
  Awaited<ReturnType<typeof getCharacterProfile>>
>;

export type CharacterDetailResult =
  | { ok: true; data: CharacterProfile }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false };

/** Request-deduped profile lookup (metadata + page share one fetch). */
export const getCharacterDetail = cache(
  async (id: string): Promise<CharacterDetailResult> => {
    try {
      const data = await getCharacterProfile(id);
      if (!data) return { ok: false, notFound: true };
      return { ok: true, data };
    } catch {
      return { ok: false, notFound: false };
    }
  },
);

const DOSSIER_FIELDS = [
  ["origin", "Origin"],
  ["occupation", "Occupation"],
  ["first_appearance", "First appearance"],
] as const;

function extraString(extra: unknown, key: string): string | null {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return null;
  const v = (extra as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Epithet without the wiki's wrapping quotes. */
export function characterEpithet(extra: unknown): string | null {
  return extraString(extra, "epithet")?.replace(/^"+|"+$/g, "") ?? null;
}

/** Labelled wiki facts from `extra_data` that have a value. */
export function characterDossier(
  extra: unknown,
): { label: string; value: string }[] {
  return DOSSIER_FIELDS.flatMap(([key, label]) => {
    const value = extraString(extra, key);
    return value ? [{ label, value }] : [];
  });
}
