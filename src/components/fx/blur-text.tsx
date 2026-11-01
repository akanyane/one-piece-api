"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType } from "react";

import { cn } from "@/lib/utils";

type BlurTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
};

/** Word-by-word reveal out of a blur, in the spirit of reactbits' BlurText. */
export function BlurText({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.08,
}: BlurTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag aria-label={text} className={cn("inline", className)}>
      {words.map((word, i) => (
        <motion.span
          aria-hidden
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          className="inline-block will-change-[filter,transform]"
          initial={
            reduce
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(10px)", y: 18 }
          }
          // biome-ignore lint/suspicious/noArrayIndexKey: words can repeat; order is stable
          key={`${word}-${i}`}
          transition={{
            duration: 0.7,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
          {i < words.length - 1 ? " " : null}
        </motion.span>
      ))}
    </Tag>
  );
}
