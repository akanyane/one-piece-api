"use client";

import { type PointerEvent, type ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

type InteractiveCardProps = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. 0 disables the 3D tilt. */
  tilt?: number;
  /** Paint a soft light under the cursor (reads --mx / --my / --h). */
  spotlight?: boolean;
  /** Colour of the spotlight; any CSS colour. */
  spotlightColor?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pointer-reactive wrapper: a perspective tilt plus a cursor-following
 * spotlight. Children can read `--mx`, `--my` (percent) and `--h` (0/1)
 * for their own glare layers. Touch and reduced motion get no tilt.
 */
export function InteractiveCard({
  children,
  className,
  tilt = 8,
  spotlight = true,
  spotlightColor = "color-mix(in oklch, var(--primary) 22%, transparent)",
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (tilt && !prefersReducedMotion()) {
      el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * tilt * 2).toFixed(2)}deg) rotateY(${((x - 0.5) * tilt * 2).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
    }
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--h", "1");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 500ms cubic-bezier(.2,.8,.2,1)";
    el.style.transform = "";
    el.style.setProperty("--h", "0");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      el.style.transition = "";
    }, 520);
  };

  return (
    <div
      className={cn(
        "relative h-full transition-transform duration-150 ease-out will-change-transform [transform-style:preserve-3d]",
        className,
      )}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      ref={ref}
    >
      {children}
      {spotlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-[var(--h,0)] transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at var(--mx,50%) var(--my,50%), ${spotlightColor}, transparent 45%)`,
          }}
        />
      ) : null}
    </div>
  );
}
