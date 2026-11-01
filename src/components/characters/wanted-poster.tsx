import Image from "next/image";

import { cn } from "@/lib/utils";

export type WantedPosterProps = {
  name: string;
  /** Japanese name; drawn vertically when there is no portrait. */
  nameJp?: string;
  imageUrl: string | null;
  /** Berries; `null` prints "no bounty on record". */
  bounty: number | null;
  status?: string | null;
  /** Small line under the bounty (e.g. "Age 19 · 174 cm"). */
  footnote?: string;
  /** "sm" is used by the homepage marquee. */
  size?: "sm" | "md";
  /** Preload the portrait (first row of a grid). */
  priority?: boolean;
  className?: string;
};

export function formatBerries(n: number) {
  return n.toLocaleString("en-US");
}

/**
 * A Marine-issue WANTED poster: aged parchment, ink frame, sepia portrait
 * multiplied into the paper, and a DECEASED stamp when it applies. Looks the
 * same in light and dark mode on purpose — it's a physical object.
 * Reads `--mx` / `--my` / `--h` from an ancestor for its lantern glare.
 */
export function WantedPoster({
  name,
  nameJp,
  imageUrl,
  bounty,
  status,
  footnote,
  size = "md",
  priority = false,
  className,
}: WantedPosterProps) {
  const sm = size === "sm";
  const deceased = status?.toLowerCase() === "deceased";

  return (
    <article
      className={cn(
        "wanted-poster relative flex h-full flex-col items-center text-center text-[#2a1a0e] [container-type:inline-size]",
        sm ? "gap-1.5 p-3 pb-2.5" : "gap-2 p-4 pb-3.5",
        className,
      )}
    >
      <p
        className={cn(
          "font-wanted leading-none tracking-[0.06em]",
          "text-[clamp(1.4rem,17cqw,2.7rem)]",
        )}
      >
        WANTED
      </p>

      <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-[#2a1a0e] bg-[#e9d8b4]">
        {imageUrl ? (
          <Image
            alt={`Wanted poster portrait of ${name}`}
            className="wanted-img object-cover object-[50%_18%] transition-transform duration-500 group-hover:scale-[1.04]"
            fill
            priority={priority}
            sizes={
              sm
                ? "200px"
                : "(min-width: 1280px) 340px, (min-width: 640px) 45vw, 92vw"
            }
            src={imageUrl}
          />
        ) : (
          <div
            className="wanted-empty absolute inset-0 flex flex-row-reverse items-center justify-center gap-3 px-2 py-3"
            role="img"
            aria-label={`No portrait available for ${name}`}
          >
            <span
              className={cn(
                "font-kana max-h-full overflow-hidden leading-none tracking-[0.12em] [text-orientation:upright] [writing-mode:vertical-rl]",
                "text-[clamp(1rem,10cqw,1.8rem)]",
              )}
            >
              {nameJp || name.slice(0, 8)}
            </span>
            <span className="font-mono text-[0.55rem] tracking-[0.24em] text-[#5e4630] [writing-mode:vertical-rl]">
              NO PORTRAIT
            </span>
          </div>
        )}
        {deceased ? (
          <span
            className={cn(
              "font-wanted pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] border-[3px] border-[#b3261e] px-2.5 py-0.5 tracking-[0.06em] whitespace-nowrap text-[#b3261e] opacity-90 mix-blend-multiply",
              "text-[clamp(0.9rem,8.5cqw,1.4rem)]",
            )}
          >
            DECEASED
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "font-wanted leading-none tracking-[0.2em] text-[#5e4630]",
          "text-[clamp(0.5rem,4cqw,0.75rem)]",
        )}
      >
        DEAD OR ALIVE
      </p>

      <h2
        className={cn(
          "font-wanted line-clamp-2 leading-[1.05] tracking-[0.02em] text-balance uppercase",
          "text-[clamp(0.8rem,7.2cqw,1.25rem)]",
        )}
      >
        {name}
      </h2>

      <p
        className={cn(
          "font-wanted mt-auto flex items-baseline gap-1 leading-none tabular-nums",
          "text-[clamp(0.9rem,8.4cqw,1.45rem)]",
        )}
      >
        {bounty === null ? (
          <span
            className={cn(
              "tracking-[0.12em] text-[#5e4630]",
              "text-[clamp(0.55rem,4.4cqw,0.8rem)]",
            )}
          >
            NO BOUNTY ON RECORD
          </span>
        ) : (
          <>
            <span className="text-[0.8em]">฿</span>
            {formatBerries(bounty)}
            <span className="text-[0.8em]">—</span>
          </>
        )}
      </p>

      {footnote ? (
        <p className="font-mono text-[clamp(0.5rem,3.6cqw,0.65rem)] tracking-[0.12em] text-[#5e4630] uppercase">
          {footnote}
        </p>
      ) : null}

      <p
        className={cn(
          "font-wanted w-full border-t border-[#2a1a0e]/30 pt-1 tracking-[0.5em] text-[#2a1a0e]/70",
          "text-[clamp(0.45rem,3.6cqw,0.65rem)]",
        )}
      >
        MARINE
      </p>

      {/* Lantern glare that follows the cursor. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[var(--h,0)] mix-blend-soft-light transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,226,160,.95) 0%, rgba(255,200,120,.4) 25%, transparent 55%)",
        }}
      />
    </article>
  );
}
