"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { JsonViewer } from "@/components/playground/json-viewer";
import { ResponseCards } from "@/components/playground/response-cards";
import { cardsFor, listFromResponse } from "@/lib/playground-cards";
import {
  buildRequestUrl,
  endpointById,
  PLAYGROUND_DEFAULT_VALUES,
  PLAYGROUND_ENDPOINTS,
} from "@/lib/playground-endpoints";
import { buildSnippet, type SnippetLang } from "@/lib/playground-snippets";
import { cn } from "@/lib/utils";

type Tab = "params" | "fields" | "code";
type ResponseTab = "json" | "cards";
type CopiedKey = "" | "url" | "snip" | "resp";

type HistoryEntry = {
  id: number;
  status: number | "error";
  ms: number;
  url: string;
  endpointId: string;
  values: Record<string, string>;
};

type ResponseMeta = { status: number; ok: boolean; ms: number; bytes: number };

const HISTORY_LIMIT = 12;
const COPY_FLASH_MS = 1400;
const MONO = "font-[family-name:var(--font-pg-mono)]";
const EYEBROW = `${MONO} text-[9.5px] uppercase tracking-[0.28em] text-[var(--pg-muted)]`;

function formatBytes(bytes: number): string {
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

export function PlaygroundClient({ siteUrl }: { siteUrl: string }) {
  const [endpointId, setEndpointId] = useState("characters");
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    PLAYGROUND_DEFAULT_VALUES,
  );
  const [tab, setTab] = useState<Tab>("params");
  const [respTab, setRespTab] = useState<ResponseTab>("json");
  const [snippetLang, setSnippetLang] = useState<SnippetLang>("curl");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<unknown>(null);
  const [meta, setMeta] = useState<ResponseMeta | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState<CopiedKey>("");
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const historyIdRef = useRef(0);

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  const endpoint = endpointById(endpointId);
  const currentValues = values[endpointId] ?? {};
  const requestUrl = buildRequestUrl(siteUrl, endpoint, currentValues);
  const list = listFromResponse(data);
  const cards = cardsFor(endpointId, list);
  const snippet = buildSnippet(snippetLang, requestUrl);
  const idle = !loading && !error && data === null;

  function flash(key: CopiedKey) {
    setCopied(key);
    clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(""), COPY_FLASH_MS);
  }

  async function copy(text: string, key: CopiedKey) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be denied (permissions, insecure context); the flash
      // still confirms the click without surfacing a scary error for a copy button.
    }
    flash(key);
  }

  function selectEndpoint(id: string) {
    setEndpointId(id);
    setData(null);
    setMeta(null);
    setError("");
  }

  function setParamValue(name: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [endpointId]: { ...(prev[endpointId] ?? {}), [name]: value },
    }));
  }

  async function send(id: string, vals: Record<string, string>) {
    const ep = endpointById(id);
    // A blank path param (e.g. {id}) would collapse to a trailing slash that
    // Next.js resolves to the *list* route instead of 404ing — silently
    // returning the wrong resource. Refuse client-side instead.
    if (ep.path.includes("{id}") && !(vals.id ?? "").trim()) {
      setData(null);
      setMeta(null);
      setError("Enter an id first — copy one from /api/characters.");
      return;
    }
    const displayUrl = buildRequestUrl(siteUrl, ep, vals);
    // Fetched relative to the current origin (not `siteUrl`) so the call stays same-origin
    // — and CORS-free — on localhost and preview deployments too.
    const fetchUrl = buildRequestUrl("", ep, vals);
    setLoading(true);
    setError("");
    const t0 = performance.now();
    try {
      const res = await fetch(fetchUrl, {
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      const ms = Math.round(performance.now() - t0);
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
      setData(parsed);
      setMeta({
        status: res.status,
        ok: res.ok,
        ms,
        bytes: new Blob([text]).size,
      });
      historyIdRef.current += 1;
      setHistory((prev) =>
        [
          {
            id: historyIdRef.current,
            status: res.status,
            ms,
            url: displayUrl,
            endpointId: id,
            values: vals,
          },
          ...prev,
        ].slice(0, HISTORY_LIMIT),
      );
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      setData(null);
      setMeta(null);
      setError(
        err instanceof Error
          ? err.message
          : "Network error — the request could not be sent.",
      );
      historyIdRef.current += 1;
      setHistory((prev) =>
        [
          {
            id: historyIdRef.current,
            status: "error" as const,
            ms,
            url: displayUrl,
            endpointId: id,
            values: vals,
          },
          ...prev,
        ].slice(0, HISTORY_LIMIT),
      );
    } finally {
      setLoading(false);
    }
  }

  function replay(entry: HistoryEntry) {
    setEndpointId(entry.endpointId);
    setValues((prev) => ({ ...prev, [entry.endpointId]: entry.values }));
    send(entry.endpointId, entry.values);
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-end gap-5 border-b-[3px] border-double border-[var(--pg-ink)] bg-[var(--pg-paper)] px-4 pt-[18px] pb-3 sm:px-7">
        <div className="flex flex-col gap-px">
          <span className={EYEBROW}>Grand Line Registry</span>
          <h1 className="m-0 font-display text-[22px] leading-none font-semibold tracking-[-0.015em] sm:text-[27px]">
            One Piece API{" "}
            <span className="font-normal text-[var(--pg-sea)] italic">
              Playground
            </span>
          </h1>
        </div>
        <div className="flex-1" />
        <div className={cn(MONO, "hidden items-center gap-5 pb-1 sm:flex")}>
          <Link
            className="text-[10.5px] tracking-[0.12em] text-[var(--pg-sea)] uppercase underline decoration-[color:var(--pg-sea)]/30 underline-offset-4 hover:text-[var(--pg-sea-hover)] hover:decoration-[color:var(--pg-sea-hover)]"
            href="/documentation"
          >
            Docs
          </Link>
          <a
            className="text-[10.5px] tracking-[0.12em] text-[var(--pg-sea)] uppercase underline decoration-[color:var(--pg-sea)]/30 underline-offset-4 hover:text-[var(--pg-sea-hover)] hover:decoration-[color:var(--pg-sea-hover)]"
            href="/api"
            rel="noreferrer"
            target="_blank"
          >
            Index
          </a>
          <span className="border border-[var(--pg-hairline-4)] px-[9px] py-1 text-[var(--pg-muted)]">
            No key · No auth
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(210px,258px)_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto border-b border-[var(--pg-hairline)] px-3 py-2 md:hidden">
          {PLAYGROUND_ENDPOINTS.map((ep) => (
            <button
              className={cn(
                MONO,
                "shrink-0 border px-3 py-1.5 text-[11px]",
                ep.id === endpointId
                  ? "border-[var(--pg-ink)] bg-[var(--pg-sunken)] font-bold text-[var(--pg-ink)]"
                  : "border-transparent text-[var(--pg-body)]",
              )}
              key={ep.id}
              onClick={() => selectEndpoint(ep.id)}
              type="button"
            >
              {ep.label}
            </button>
          ))}
        </nav>

        <aside className="hidden min-h-0 flex-col gap-[26px] border-r border-[var(--pg-hairline)] py-[22px] md:flex">
          <nav className="flex flex-col">
            <span className={cn(EYEBROW, "px-6 pb-2.5")}>Endpoints</span>
            {PLAYGROUND_ENDPOINTS.map((ep, i) => (
              <button
                className={cn(
                  "grid grid-cols-[22px_1fr] items-baseline gap-2.5 border-l-[3px] py-[9px] pr-6 pl-[21px] text-left hover:bg-[var(--pg-sunken)]",
                  ep.id === endpointId
                    ? "border-l-[var(--pg-ink)] bg-[var(--pg-sunken)]"
                    : "border-l-transparent",
                )}
                key={ep.id}
                onClick={() => selectEndpoint(ep.id)}
                type="button"
              >
                <span
                  className={cn(MONO, "text-[10px] text-[var(--pg-muted-2)]")}
                >
                  {String(i).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    MONO,
                    "truncate text-[12.5px]",
                    ep.id === endpointId
                      ? "font-bold text-[var(--pg-ink)]"
                      : "text-[var(--pg-body)]",
                  )}
                >
                  {ep.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex min-h-0 flex-col">
            <span className={cn(EYEBROW, "px-6 pb-2")}>Log</span>
            {history.length === 0 ? (
              <p className="m-0 px-6 font-display text-[12px] text-[var(--pg-muted-2)] italic leading-[1.6]">
                Nothing recorded yet.
              </p>
            ) : (
              <div className="flex max-h-[300px] flex-col overflow-auto">
                {history.map((h) => (
                  <button
                    className="flex items-baseline gap-[9px] border-t border-[var(--pg-hairline-2)] px-6 py-[7px] text-left hover:bg-[var(--pg-sunken)]"
                    key={h.id}
                    onClick={() => replay(h)}
                    type="button"
                  >
                    <span
                      className={cn(
                        MONO,
                        "min-w-[42px] text-[9.5px] font-bold tracking-[0.06em]",
                        h.status === "error"
                          ? "text-[var(--pg-error)]"
                          : h.status === 200
                            ? "text-[var(--pg-success)]"
                            : "text-[var(--pg-warning)]",
                      )}
                    >
                      {h.status === "error" ? "ERR" : h.status}
                    </span>
                    <span
                      className={cn(
                        MONO,
                        "flex-1 truncate text-[11px] text-[var(--pg-body)]",
                      )}
                    >
                      {h.url.replace(`${siteUrl}/api`, "")}
                    </span>
                    <span
                      className={cn(
                        MONO,
                        "text-[9.5px] text-[var(--pg-muted-2)]",
                      )}
                    >
                      {h.ms}ms
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />
          <p className="m-0 px-6 font-display text-[12px] text-[var(--pg-muted)] italic leading-[1.65]">
            Requests are sent live to this API from your browser — open the
            Network tab to see exactly what a client receives.
          </p>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col">
          <section className="flex flex-col gap-[18px] px-4 pt-[26px] sm:px-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-[var(--pg-hairline)] pb-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 className="m-0 font-display text-[24px] leading-[1.05] font-semibold tracking-[-0.02em] sm:text-[30px]">
                  {endpoint.title}
                </h2>
                <p className="m-0 max-w-[62ch] text-[13.5px] text-[var(--pg-body)] leading-[1.6] text-pretty">
                  {endpoint.description}
                </p>
              </div>
              <span
                className={cn(
                  MONO,
                  "whitespace-nowrap text-[10px] tracking-[0.2em] text-[var(--pg-muted-2)] uppercase",
                )}
              >
                Fig. {endpoint.figure}
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-3.5">
              <div className="flex min-w-[280px] flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    MONO,
                    "text-[9.5px] tracking-[0.24em] text-[var(--pg-muted)] uppercase",
                  )}
                >
                  Request
                </span>
                <div className="flex min-w-0 items-baseline gap-[11px] border-b-2 border-[var(--pg-ink)] pb-[7px]">
                  <span
                    className={cn(
                      MONO,
                      "text-[10px] font-bold tracking-[0.14em] text-[var(--pg-sea)]",
                    )}
                  >
                    GET
                  </span>
                  <span className={cn(MONO, "truncate text-[13.5px]")}>
                    {requestUrl}
                  </span>
                </div>
              </div>
              <button
                className={cn(
                  MONO,
                  "h-[38px] border border-[var(--pg-ink)] px-[15px] text-[10.5px] uppercase tracking-[0.14em] hover:bg-[var(--pg-sunken-2)]",
                )}
                onClick={() => copy(requestUrl, "url")}
                type="button"
              >
                {copied === "url" ? "Copied" : "Copy URL"}
              </button>
              <button
                className={cn(
                  MONO,
                  "h-[38px] border border-[var(--pg-ink)] bg-[var(--pg-ink)] px-[26px] text-[10.5px] tracking-[0.18em] text-[var(--pg-ink-on-dark)] uppercase shadow-[4px_4px_0_var(--pg-hairline-4)] transition-[box-shadow,transform] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--pg-hairline-4)] disabled:pointer-events-none disabled:opacity-70",
                )}
                disabled={loading}
                onClick={() => send(endpointId, currentValues)}
                type="button"
              >
                {loading ? "Sending" : "Send"}
              </button>
            </div>

            <div className="flex gap-[26px] overflow-x-auto border-b border-[var(--pg-hairline)]">
              {(
                [
                  ["params", "Parameters"],
                  ["fields", "Response fields"],
                  ["code", "Code"],
                ] as const
              ).map(([id, label]) => (
                <button
                  className={cn(
                    MONO,
                    "-mb-px shrink-0 border-b-2 pb-[10px] text-[10.5px] uppercase tracking-[0.18em]",
                    tab === id
                      ? "border-[var(--pg-ink)] font-bold text-[var(--pg-ink)]"
                      : "border-transparent text-[var(--pg-muted-3)]",
                  )}
                  key={id}
                  onClick={() => setTab(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-5 pb-6 sm:px-7">
            {tab === "params" &&
              (endpoint.params.length === 0 ? (
                <div className="flex flex-col gap-1">
                  <span
                    className={cn(MONO, "text-[11px] text-[var(--pg-ink)]")}
                  >
                    —
                  </span>
                  <span className="font-display text-[11.5px] text-[var(--pg-muted-2)] italic">
                    no parameters on this endpoint
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-[26px] gap-y-[18px]">
                  {endpoint.params.map((p) => (
                    <label className="flex flex-col gap-1" key={p.name}>
                      <span
                        className={cn(
                          MONO,
                          "flex items-baseline gap-[7px] text-[11px] text-[var(--pg-ink)]",
                        )}
                      >
                        {p.name}
                        <span className="font-display text-[11.5px] text-[var(--pg-muted-2)] italic">
                          {p.hint}
                        </span>
                      </span>
                      <input
                        className={cn(
                          MONO,
                          "h-8 border-0 border-b border-[var(--pg-hairline-4)] bg-transparent text-[13.5px] text-[var(--pg-ink)] outline-none focus:border-b-[var(--pg-sea)]",
                        )}
                        onChange={(e) => setParamValue(p.name, e.target.value)}
                        placeholder={p.placeholder}
                        value={currentValues[p.name] ?? ""}
                      />
                    </label>
                  ))}
                </div>
              ))}

            {tab === "fields" && (
              <div className="flex flex-col border-t border-[var(--pg-ink)]">
                <div
                  className={cn(
                    MONO,
                    "grid grid-cols-[minmax(120px,1fr)_minmax(90px,0.6fr)_minmax(180px,2fr)] border-b border-[var(--pg-hairline)] text-[9.5px] tracking-[0.2em] text-[var(--pg-muted)] uppercase",
                  )}
                >
                  <span className="py-2 pr-3.5">Field</span>
                  <span className="px-3.5 py-2">Type</span>
                  <span className="px-3.5 py-2">Notes</span>
                </div>
                {endpoint.fields.map((f) => (
                  <div
                    className="grid grid-cols-[minmax(120px,1fr)_minmax(90px,0.6fr)_minmax(180px,2fr)] border-b border-[var(--pg-hairline-2)] text-[13px]"
                    key={f.field}
                  >
                    <span
                      className={cn(MONO, "py-2.5 pr-3.5 text-[var(--pg-ink)]")}
                    >
                      {f.field}
                    </span>
                    <span
                      className={cn(
                        MONO,
                        "px-3.5 py-2.5 text-[12px] text-[var(--pg-sea)]",
                      )}
                    >
                      {f.type}
                    </span>
                    <span className="px-3.5 py-2.5 font-display text-[var(--pg-body)] leading-[1.55]">
                      {f.notes ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "code" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-[18px]">
                  {(
                    [
                      ["curl", "cURL"],
                      ["fetch", "JavaScript"],
                      ["python", "Python"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      className={cn(
                        MONO,
                        "border-b pb-[3px] text-[10.5px] uppercase tracking-[0.14em]",
                        snippetLang === id
                          ? "border-[var(--pg-ink)] font-bold text-[var(--pg-ink)]"
                          : "border-transparent text-[var(--pg-muted-3)]",
                      )}
                      key={id}
                      onClick={() => setSnippetLang(id)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    className={cn(
                      MONO,
                      "border border-[var(--pg-hairline-4)] px-[11px] py-[5px] text-[10px] uppercase tracking-[0.14em] text-[var(--pg-body)] hover:bg-[var(--pg-sunken-2)]",
                    )}
                    onClick={() => copy(snippet, "snip")}
                    type="button"
                  >
                    {copied === "snip" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre
                  className={cn(
                    MONO,
                    "m-0 overflow-auto bg-[var(--pg-ink)] p-5 text-[12.5px] whitespace-pre-wrap break-all text-[var(--pg-snippet-text)] shadow-[6px_6px_0_var(--pg-hairline-3)] leading-[1.8]",
                  )}
                >
                  {snippet}
                </pre>
              </div>
            )}
          </section>

          <section className="flex min-h-0 flex-1 flex-col border-t-[3px] border-double border-[var(--pg-ink)]">
            <div className="flex flex-wrap items-baseline gap-3.5 px-4 pt-3.5 pb-3 sm:px-7">
              <span className={EYEBROW}>Response</span>
              {meta && (
                <div
                  className={cn(MONO, "flex items-baseline gap-3 text-[11px]")}
                >
                  <span
                    className={cn(
                      "border-b-2 font-bold tracking-[0.08em]",
                      meta.ok
                        ? "border-[var(--pg-success)] text-[var(--pg-success)]"
                        : "border-[var(--pg-error)] text-[var(--pg-error)]",
                    )}
                  >
                    {meta.status}
                  </span>
                  <span className="text-[var(--pg-body)]">{meta.ms} ms</span>
                  <span className="text-[var(--pg-body)]">
                    {formatBytes(meta.bytes)}
                  </span>
                  <span className="text-[var(--pg-body)]">
                    {list.length} {list.length === 1 ? "record" : "records"}
                  </span>
                </div>
              )}
              <div className="flex-1" />
              {(
                [
                  ["json", "JSON"],
                  ["cards", "Preview"],
                ] as const
              ).map(([id, label]) => (
                <button
                  className={cn(
                    MONO,
                    "border-b pb-[3px] text-[10.5px] uppercase tracking-[0.14em]",
                    respTab === id
                      ? "border-[var(--pg-ink)] font-bold text-[var(--pg-ink)]"
                      : "border-transparent text-[var(--pg-muted-3)]",
                  )}
                  key={id}
                  onClick={() => setRespTab(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
              <button
                className={cn(
                  MONO,
                  "ml-2 border border-[var(--pg-hairline-4)] px-[11px] py-[5px] text-[10px] uppercase tracking-[0.14em] text-[var(--pg-body)] hover:bg-[var(--pg-sunken-2)]",
                )}
                disabled={data === null}
                onClick={() => copy(JSON.stringify(data, null, 2), "resp")}
                type="button"
              >
                {copied === "resp" ? "Copied" : "Copy response"}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 pb-7 sm:px-7">
              {idle && (
                <div className="border border-[var(--pg-hairline)] px-7 py-[52px] text-center font-display text-[15px] text-[var(--pg-muted)] italic">
                  The log is empty. Send the request to record a response.
                </div>
              )}
              {error && (
                <div className="mb-3.5 border-l-[3px] border-[var(--pg-error)] bg-[var(--pg-error-bg)] px-4 py-3.5 font-display text-[13px] text-[var(--pg-error-text)] leading-[1.6]">
                  {error}
                </div>
              )}
              {!error && data !== null && respTab === "json" && (
                <JsonViewer data={data} />
              )}
              {!error && data !== null && respTab === "cards" && (
                <ResponseCards cards={cards} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
