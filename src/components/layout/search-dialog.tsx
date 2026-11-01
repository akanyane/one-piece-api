"use client";

import { ArrowRight, CornerDownLeft, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { displayCharacterName } from "@/lib/character-name";
import { CATALOG_NAV, DEV_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  name: unknown;
  image_url: string | null;
  status: string;
};

/**
 * ⌘K palette: live character search against the public API (debounced),
 * plus quick jumps to every section. Built on the native <dialog>.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/characters?q=${encodeURIComponent(q)}&limit=6`,
          { signal: ctrl.signal },
        );
        const data = res.ok ? ((await res.json()) as Hit[]) : [];
        setHits(Array.isArray(data) ? data : []);
        setCursor(0);
      } catch {
        // aborted or offline — keep the previous hits
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const sections = [...CATALOG_NAV, ...DEV_NAV].filter((s) =>
    s.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  // One flat list for keyboard navigation: character hits, then sections.
  const options = [
    ...hits.map((h) => ({ key: h.id, href: `/characters/${h.id}` })),
    ...sections.map((s) => ({ key: s.href, href: s.href })),
  ];

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(options.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = options[cursor];
      if (picked) go(picked.href);
      else if (query.trim())
        go(`/characters?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <dialog
      aria-label="Search"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-4 backdrop:bg-foreground/30 backdrop:backdrop-blur-sm open:flex open:items-start open:justify-center sm:pt-[12vh]"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
      onClose={() => onOpenChange(false)}
      onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
      ref={ref}
    >
      <div className="surface-story w-full max-w-xl animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl duration-200 slide-in-from-top-2">
        <div className="flex items-center gap-3 border-b border-border px-4">
          {loading ? (
            <Loader2
              aria-hidden
              className="size-4 animate-spin text-muted-foreground"
            />
          ) : (
            <Search aria-hidden className="size-4 text-muted-foreground" />
          )}
          <input
            aria-activedescendant={
              options[cursor] ? `${listId}-${cursor}` : undefined
            }
            aria-controls={listId}
            aria-expanded
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search characters — Luffy, ゾロ, Rufi…"
            ref={inputRef}
            role="combobox"
            value={query}
          />
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div
          className="max-h-[60vh] overflow-y-auto p-2"
          id={listId}
          role="listbox"
        >
          {hits.length > 0 ? (
            <p className="px-3 pt-2 pb-1 text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Characters
            </p>
          ) : null}
          {hits.map((h, i) => (
            <button
              aria-selected={cursor === i}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left",
                cursor === i && "bg-accent",
              )}
              id={`${listId}-${i}`}
              key={h.id}
              onClick={() => go(`/characters/${h.id}`)}
              onPointerMove={() => setCursor(i)}
              role="option"
              type="button"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {h.image_url ? (
                  <Image
                    alt=""
                    className="object-cover object-top"
                    fill
                    sizes="40px"
                    src={h.image_url}
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {displayCharacterName(h.name)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {h.status}
                </span>
              </span>
              {cursor === i ? (
                <CornerDownLeft
                  aria-hidden
                  className="size-4 text-muted-foreground"
                />
              ) : null}
            </button>
          ))}

          {query.trim().length >= 2 && !loading && hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No characters match “{query.trim()}”.
            </p>
          ) : null}

          {sections.length > 0 ? (
            <p className="px-3 pt-3 pb-1 text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Jump to
            </p>
          ) : null}
          {sections.map(({ href, label, icon: Icon }, j) => {
            const i = hits.length + j;
            return (
              <button
                aria-selected={cursor === i}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
                  cursor === i && "bg-accent",
                )}
                id={`${listId}-${i}`}
                key={href}
                onClick={() => go(href)}
                onPointerMove={() => setCursor(i)}
                role="option"
                type="button"
              >
                <Icon aria-hidden className="size-4 text-primary" />
                <span className="flex-1">{label}</span>
                <ArrowRight
                  aria-hidden
                  className={cn(
                    "size-4 text-muted-foreground transition-opacity",
                    cursor === i ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
