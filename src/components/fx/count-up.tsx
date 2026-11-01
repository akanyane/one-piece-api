"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  /** Seconds. */
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/** Counts from 0 to `to` the first time it scrolls into view. */
export function CountUp({
  to,
  duration = 1.6,
  className,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // easeOutExpo: quick start, long settle — numbers feel like they "land".
      const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, to, duration]);

  return (
    <span className={className} ref={ref}>
      <span className="sr-only">
        {prefix}
        {format(to)}
        {suffix}
      </span>
      <span aria-hidden className="tabular-nums">
        {prefix}
        {format(value)}
        {suffix}
      </span>
    </span>
  );
}
