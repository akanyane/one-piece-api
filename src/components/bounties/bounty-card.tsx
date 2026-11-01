import Link from "next/link";
import type { CSSProperties } from "react";

import { WantedPoster } from "@/components/characters/wanted-poster";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { displayCharacterName } from "@/lib/character-name";
import { cn } from "@/lib/utils";

export type ApiBountyRow = {
  id: string;
  amount: number | null;
  is_active: boolean;
  character_id: string | null;
  created_at: string;
  characters?: {
    name: unknown;
    image_url?: string | null;
    status?: string | null;
  } | null;
};

function japaneseName(name: unknown): string | undefined {
  if (!name || typeof name !== "object") return undefined;
  const jp = (name as Record<string, unknown>).jp;
  return typeof jp === "string" && jp.trim() ? jp : undefined;
}

const REST = [0.9, -1.1, 0.5, -0.8, 1.1, -0.6];

export function BountyCard({
  bounty,
  className,
  index = 0,
  priority = false,
}: {
  bounty: ApiBountyRow;
  className?: string;
  index?: number;
  priority?: boolean;
}) {
  const character = bounty.characters ?? null;
  const name = bounty.character_id
    ? displayCharacterName(character?.name)
    : "Unknown";

  const poster = (
    <InteractiveCard spotlight={false} tilt={7}>
      <WantedPoster
        bounty={bounty.amount}
        footnote={bounty.is_active ? "Current bounty" : "Former bounty"}
        imageUrl={character?.image_url ?? null}
        name={name}
        nameJp={japaneseName(character?.name)}
        priority={priority}
        status={character?.status}
      />
      {!bounty.is_active ? (
        <span className="font-wanted pointer-events-none absolute top-[22%] right-[10%] z-10 rotate-6 rounded-[2px] border-2 border-[#5e4630] bg-[#f3e5c4]/80 px-1.5 py-0.5 text-[0.6rem] tracking-[0.18em] text-[#5e4630]">
          REVOKED
        </span>
      ) : null}
    </InteractiveCard>
  );

  const shared = {
    className: cn(
      "group block h-full rounded-[3px] outline-offset-4 transition-[rotate] duration-500 [rotate:var(--rest)] hover:[rotate:0deg] focus-visible:[rotate:0deg]",
      className,
    ),
    style: { "--rest": `${REST[index % REST.length]}deg` } as CSSProperties,
  };

  return bounty.character_id ? (
    <Link
      aria-label={`${name} — open profile`}
      href={`/characters/${bounty.character_id}`}
      {...shared}
    >
      {poster}
    </Link>
  ) : (
    <div {...shared}>{poster}</div>
  );
}
