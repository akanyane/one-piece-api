import { Cherry } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  displayCharacterName,
  subtitleCharacterName,
} from "@/lib/character-name";
import { cn } from "@/lib/utils";
import type { Tables } from "@/supabase/database.types";

export type ApiDevilFruitRow = Tables<"devil_fruits">;

function formatKindLabel(value: string | null): string | null {
  if (!value?.trim()) return null;
  return value
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function DevilFruitCard({
  fruit,
  className,
}: {
  fruit: ApiDevilFruitRow;
  className?: string;
}) {
  const title = displayCharacterName(fruit.name);
  const nameSubtitle = subtitleCharacterName(fruit.name, title);
  const modelPrimary = displayCharacterName(fruit.model);
  const modelSubtitle = subtitleCharacterName(fruit.model, modelPrimary);
  const typeLabel = formatKindLabel(fruit.type);
  const subTypeLabel = formatKindLabel(fruit.sub_type);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/10",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-primary/15 via-card to-accent/25">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grain-overlay opacity-50 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklch,var(--color-primary)_25%,transparent),transparent_55%)]" />
        {fruit.image_url ? (
          <Image
            alt=""
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
            src={fruit.image_url}
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {!fruit.image_url ? (
            <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-primary/25 bg-background/50 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Cherry
                aria-hidden
                className="size-9 text-primary/45"
                strokeWidth={1.35}
              />
            </div>
          ) : null}
          {!fruit.image_url ? (
            <p className="max-w-[12rem] text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Art coming soon
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border/60 p-4 md:p-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl leading-tight font-medium tracking-tight text-balance text-foreground md:text-[1.35rem]">
            {title}
          </h2>
          {nameSubtitle ? (
            <p className="text-sm text-muted-foreground">{nameSubtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {typeLabel ? (
            <Badge
              className="rounded-full border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
              variant="outline"
            >
              {typeLabel}
            </Badge>
          ) : null}
          {subTypeLabel ? (
            <Badge className="rounded-full px-2.5 py-0.5" variant="secondary">
              {subTypeLabel}
            </Badge>
          ) : null}
        </div>

        <div className="border-t border-border/50 pt-3 text-[0.8125rem]">
          <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Model
          </span>
          <p className="mt-1 font-medium text-foreground">{modelPrimary}</p>
          {modelSubtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {modelSubtitle}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
