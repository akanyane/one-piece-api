"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Token = { type: keyof typeof TOKEN_CLASS; value: string };

const TOKEN_CLASS = {
  key: "text-[#7fd3dc]",
  string: "text-[#c9e59a]",
  number: "text-[#f0b26b]",
  literal: "text-[#d7a6ff]",
  plain: "text-[#8d8170]",
} as const;

const JSON_TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([^"\d\-tfn]+|.)/g;

/** Splits pretty-printed JSON into coloured spans. */
function tokenize(json: string): Token[] {
  const out: Token[] = [];
  for (const m of json.matchAll(JSON_TOKEN)) {
    if (m[1] !== undefined) {
      out.push({ type: m[2] ? "key" : "string", value: m[1] });
      if (m[2]) out.push({ type: "plain", value: m[2] });
    } else if (m[3] !== undefined) out.push({ type: "number", value: m[3] });
    else if (m[4] !== undefined) out.push({ type: "literal", value: m[4] });
    else out.push({ type: "plain", value: m[0] });
  }
  return out;
}

/**
 * A terminal that "types" a real request and then prints the real response
 * (fetched on the server and passed in), like a reactbits TextType demo.
 */
export function HeroTerminal({
  command,
  response,
  className,
}: {
  command: string;
  response: unknown;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (reduce) {
      setTyped(command.length);
      setShowResponse(true);
      return;
    }
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setTyped(i);
      if (i < command.length) {
        timeout = setTimeout(step, 28 + Math.random() * 40);
      } else {
        timeout = setTimeout(() => setShowResponse(true), 380);
      }
    };
    timeout = setTimeout(step, 700);
    return () => clearTimeout(timeout);
  }, [command, reduce]);

  const tokens = tokenize(JSON.stringify(response, null, 2));

  return (
    <div
      className={cn(
        "glow-border rounded-2xl bg-[#17120d] text-[#e9dfc9] shadow-[0_30px_80px_-30px_rgba(23,18,13,0.75)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.7rem] text-[#8d8170]">
          ~/grand-line
        </span>
        <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.14em] text-[#8d8170] uppercase">
          live data
        </span>
      </div>
      <div className="h-[19rem] overflow-hidden px-4 py-4 font-mono text-[0.75rem] leading-relaxed sm:h-[21rem] sm:text-[0.8rem]">
        <p className="break-all">
          <span className="text-[#28c840]">➜</span>{" "}
          <span className="text-[#7fd3dc]">~</span>{" "}
          <span className={cn(!showResponse && "caret")}>
            {command.slice(0, typed)}
          </span>
        </p>
        {showResponse ? (
          <pre className="mt-3 animate-in fade-in slide-in-from-bottom-1 whitespace-pre-wrap break-all duration-500">
            <span className="text-[#28c840]">HTTP/2 200</span>
            {"  "}
            <span className="text-[#8d8170]">application/json</span>
            {"\n"}
            {tokens.map((t, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static token stream
              <span className={TOKEN_CLASS[t.type]} key={i}>
                {t.value}
              </span>
            ))}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
