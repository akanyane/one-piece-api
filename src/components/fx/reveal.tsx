"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Position in a list; staggers the entry (wraps every 12 items). */
  index?: number;
  /** Extra delay in seconds. */
  delay?: number;
};

/** Fades and lifts its content in the first time it enters the viewport. */
export function Reveal({
  children,
  className,
  index = 0,
  delay = 0,
}: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      transition={{
        duration: 0.6,
        delay: delay + (index % 12) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      {children}
    </motion.div>
  );
}
