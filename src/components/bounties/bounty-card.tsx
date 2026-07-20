import { Coins, UserRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { displayCharacterName } from "@/lib/character-name";
import { cn } from "@/lib/utils";

export type ApiBountyRow = {
  id: string;
  amount: number | null;
  is_active: boolean;
  character_id: string | null;
  created_at: string;
  characters?: { name: unknown } | null;
};

function formatBerry(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

export function BountyCard({
  bounty,
  className,
}: {
  bounty: ApiBountyRow;
  className?: string;
}) {
  const nameJson = bounty.characters?.name ?? null;
  const characterTitle = bounty.character_id
    ? displayCharacterName(nameJson)
    : null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/10",
        className,
      )}
    >
      <div className="relative border-b border-amber-500/15 bg-gradient-to-br from-amber-500/12 via-card to-primary/10 px-5 py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grain-overlay opacity-40 mix-blend-multiply"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900/90 dark:text-amber-100/90">
            <Coins aria-hidden className="size-5 shrink-0 opacity-80" />
            <span className="font-display text-[0.65rem] font-medium tracking-[0.2em] uppercase">
              Bounty
            </span>
          </div>
          <Badge
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium",
              bounty.is_active
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : "border-border/60 bg-muted/80 text-muted-foreground",
            )}
            variant="outline"
          >
            {bounty.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="relative mt-4 font-display text-3xl font-medium tracking-tight text-balance text-foreground tabular-nums md:text-[2rem]">
          <span className="text-amber-700/90 dark:text-amber-200/90">฿</span>{" "}
          {formatBerry(bounty.amount)}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1.5 text-[0.8125rem] text-muted-foreground">
          <div>
            <span className="flex items-center gap-1.5 text-[0.65rem] font-medium tracking-wide uppercase">
              <UserRound aria-hidden className="size-3 opacity-60" />
              Character
            </span>
            {bounty.character_id ? (
              <div className="mt-1 space-y-0.5">
                <p className="font-display text-base font-medium leading-snug text-foreground">
                  {characterTitle}
                </p>
              </div>
            ) : (
              <p className="mt-1 italic text-foreground/80">Not linked</p>
            )}
          </div>
        </div>
        <div className="mt-auto border-t border-border/50 pt-3">
          <Link
            className="mt-2 inline-flex text-[0.8125rem] font-medium text-primary underline-offset-4 hover:underline"
            href={`/characters/${bounty.character_id}`}
          >
            Browse character
          </Link>
        </div>
      </div>
    </article>
  );
}
