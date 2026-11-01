"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/** Copies `value` to the clipboard and flashes a check mark. */
export function CopyButton({
  value,
  className,
  label = "Copy to clipboard",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions); nothing to do.
    }
  };

  return (
    <button
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10",
        className,
      )}
      onClick={copy}
      type="button"
    >
      {copied ? (
        <Check
          aria-hidden
          className="size-4 animate-in zoom-in-50 text-[#28c840]"
        />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
    </button>
  );
}
