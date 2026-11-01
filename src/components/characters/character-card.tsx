import Link from "next/link";
import type { CSSProperties } from "react";

import { WantedPoster } from "@/components/characters/wanted-poster";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { displayCharacterName } from "@/lib/character-name";
import { cn } from "@/lib/utils";

export type ApiBounty = {
  id: string;
  amount: number | null;
  is_active: boolean;
  character_id: string | null;
  created_at: string;
};

export type ApiCharacter = {
  id: string;
  name: unknown;
  status: string;
  age: number | null;
  blood_type: string;
  height: number | null;
  birthday: unknown;
  created_at: string;
  image_url: string | null;
  bounties?: ApiBounty[] | null;
};

/** The highest active bounty, or the highest overall when none is active. */
export function headlineBounty(
  bounties: Pick<ApiBounty, "amount" | "is_active">[] | null | undefined,
): number | null {
  const withAmount = (bounties ?? []).filter(
    (b): b is { amount: number; is_active: boolean } => b.amount != null,
  );
  const active = withAmount.filter((b) => b.is_active);
  const pool = active.length ? active : withAmount;
  return pool.length ? Math.max(...pool.map((b) => b.amount)) : null;
}

/** Japanese name only (never romaji) — the poster's vertical fallback. */
function japaneseName(name: unknown): string | undefined {
  if (!name || typeof name !== "object") return undefined;
  const jp = (name as Record<string, unknown>).jp;
  return typeof jp === "string" && jp.trim() ? jp : undefined;
}

// Posters hang slightly askew, like they were pinned up by hand.
const REST = [-1.2, 0.8, -0.5, 1, -0.9, 0.6];

export function CharacterCard({
  character,
  className,
  index = 0,
  priority = false,
}: {
  character: ApiCharacter;
  className?: string;
  index?: number;
  priority?: boolean;
}) {
  const title = displayCharacterName(character.name);
  const facts = [
    character.age != null ? `Age ${character.age}` : null,
    character.height != null ? `${character.height} cm` : null,
    character.blood_type && character.blood_type.toLowerCase() !== "unknown"
      ? `Type ${character.blood_type}`
      : null,
  ].filter(Boolean);

  return (
    <Link
      aria-label={`${title} — open profile`}
      className={cn(
        "group block h-full rounded-[3px] outline-offset-4 transition-[rotate] duration-500 [rotate:var(--rest)] hover:[rotate:0deg] focus-visible:[rotate:0deg]",
        className,
      )}
      href={`/characters/${character.id}`}
      style={{ "--rest": `${REST[index % REST.length]}deg` } as CSSProperties}
    >
      <InteractiveCard spotlight={false} tilt={7}>
        <WantedPoster
          bounty={headlineBounty(character.bounties)}
          footnote={facts.join(" · ") || undefined}
          imageUrl={character.image_url}
          name={title}
          nameJp={japaneseName(character.name)}
          priority={priority}
          status={character.status}
        />
      </InteractiveCard>
    </Link>
  );
}
