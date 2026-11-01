import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal loop (CSS only). Children are rendered twice so the
 * track can slide by exactly half its width; hovering pauses it.
 */
export function Marquee({
  children,
  className,
  /** Seconds per full loop. */
  duration = 60,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/marquee relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="marquee-track flex w-max shrink-0 py-6 group-hover/marquee:[animation-play-state:paused]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 gap-6 pr-6">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-6 pr-6" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
