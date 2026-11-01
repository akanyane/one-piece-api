import Link from "next/link";
import type { CSSProperties } from "react";

import { headlineBounty } from "@/components/characters/character-card";
import { WantedPoster } from "@/components/characters/wanted-poster";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { Reveal } from "@/components/fx/reveal";
import { displayCharacterName } from "@/lib/character-name";

type MemberCharacter = {
  id: string;
  name: unknown;
  image_url: string | null;
  status: string;
  bounties?: { amount: number | null; is_active: boolean }[] | null;
};

export type MemberLink = {
  is_active: boolean | null;
  characters: MemberCharacter | null;
};

export type Member = MemberCharacter & {
  isActive: boolean;
  bounty: number | null;
};

/**
 * Normalises join rows into members: de-duplicated, current before former,
 * then highest bounty, then portraits before blanks.
 */
export function toMembers(links: MemberLink[] | null | undefined): Member[] {
  const byId = new Map<string, Member>();
  for (const link of links ?? []) {
    const c = link.characters;
    if (!c) continue;
    const prev = byId.get(c.id);
    const isActive = Boolean(link.is_active) || Boolean(prev?.isActive);
    byId.set(c.id, { ...c, isActive, bounty: headlineBounty(c.bounties) });
  }
  return [...byId.values()].sort(
    (a, b) =>
      Number(b.isActive) - Number(a.isActive) ||
      (b.bounty ?? -1) - (a.bounty ?? -1) ||
      Number(Boolean(b.image_url)) - Number(Boolean(a.image_url)),
  );
}

const REST = [-1, 0.8, -0.6, 1, -0.8, 0.6];

/** A grid of small wanted posters linking to each member's profile. */
export function MemberGrid({
  members,
  narrow = false,
}: {
  members: Member[];
  /** For side columns: tops out at three posters per row. */
  narrow?: boolean;
}) {
  return (
    <ul
      className={
        narrow
          ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6"
          : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5"
      }
    >
      {members.map((m, i) => (
        <li key={m.id}>
          <Reveal className="h-full" index={i}>
            <Link
              className="group block h-full transition-[rotate] duration-500 [rotate:var(--rest)] hover:[rotate:0deg]"
              href={`/characters/${m.id}`}
              style={
                { "--rest": `${REST[i % REST.length]}deg` } as CSSProperties
              }
            >
              <InteractiveCard spotlight={false} tilt={7}>
                <WantedPoster
                  bounty={m.bounty}
                  imageUrl={m.image_url}
                  name={displayCharacterName(m.name)}
                  size="sm"
                  status={m.status}
                />
              </InteractiveCard>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
