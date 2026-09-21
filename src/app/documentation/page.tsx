import {
  ArrowLeft,
  BookOpen,
  Cherry,
  Coins,
  Flag,
  MapPin,
  Sailboat,
  Terminal,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AFFILIATION_FIELDS,
  type ApiFieldRow,
  BOUNTY_FIELDS,
  CHARACTER_FIELDS,
  DEVIL_FRUIT_FIELDS,
  ISLAND_FIELDS,
  SHIP_FIELDS,
} from "@/lib/api-fields";
import { cn } from "@/lib/utils";

const TITLE = "Documentation";
const DESCRIPTION = "How to use the One Piece API: REST basics and examples.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/documentation" },
  openGraph: {
    type: "website",
    siteName: "One Piece API",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

function FieldTable({ rows }: { rows: ApiFieldRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <table className="w-full min-w-md text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40">
            <th className="px-3 py-2 font-medium text-foreground">Field</th>
            <th className="px-3 py-2 font-medium text-foreground">Type</th>
            <th className="px-3 py-2 font-medium text-foreground">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.field}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-3 py-2 font-mono text-[0.8125rem] text-foreground">
                {row.field}
              </td>
              <td className="px-3 py-2 font-mono text-[0.8125rem] text-muted-foreground">
                {row.type}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {row.notes ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointCode({ children }: { children: string }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[0.6875rem] text-foreground">
      {children}
    </code>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1 py-0.5 text-[0.6875rem] text-foreground">
      {children}
    </code>
  );
}

const characterNameExample = `type CharacterNameJson = {
  en: string
  jp: string
  romaji: string
}

// Example
const name: CharacterNameJson = {
  en: "Monkey D. Luffy",
  jp: "モンキー・D・ルフィ",
  romaji: "Monkī Dī Rufi",
}`;

export default function DocumentationPage() {
  return (
    <div
      className={cn(
        "surface-story relative min-h-[calc(100dvh-theme(spacing.14))] overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 grain-overlay opacity-60 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 size-[min(100vw,640px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-primary)_20%,transparent),transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[min(80vw,420px)] translate-x-1/4 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.55_0.12_220)_22%,transparent),transparent_70%)] blur-3xl"
      />

      <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-4 md:gap-4 md:px-8">
          <Link
            className="flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
            href="/"
          >
            <LogoMark />
            <span className="hidden font-display text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              API
            </span>
          </Link>
          <CatalogNav>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/characters" />}
            >
              <Users data-icon="inline-start" />
              Characters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/devil-fruits" />}
            >
              <Cherry data-icon="inline-start" />
              Devil fruits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/bounties" />}
            >
              <Coins data-icon="inline-start" />
              Bounties
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/ships" />}
            >
              <Sailboat data-icon="inline-start" />
              Ships
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/islands" />}
            >
              <MapPin data-icon="inline-start" />
              Islands
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/affiliations" />}
            >
              <Flag data-icon="inline-start" />
              Affiliations
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/playground" />}
            >
              <Terminal data-icon="inline-start" />
              Playground
            </Button>
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={<Link href="/documentation" />}
            >
              <BookOpen data-icon="inline-start" />
              Docs
            </Button>
          </CatalogNav>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
              Grand Line · Reference
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
              API documentation
            </h1>
            <p className="text-pretty text-sm/relaxed text-muted-foreground md:text-base/relaxed">
              JSON over HTTP. Each endpoint returns plain objects you can model
              in any client; the field tables below describe the stable response
              shape. Where a resource embeds another (e.g. bounties on a
              character), that is called out explicitly.
            </p>
          </div>
          <Button
            className="shrink-0"
            nativeButton={false}
            render={<Link href="/playground" />}
          >
            <Terminal data-icon="inline-start" />
            Open Playground
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quickstart</CardTitle>
            <CardDescription>
              No API key, no auth header — copy, run, done.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-[0.75rem] leading-relaxed text-foreground">
              {'curl -s "https://onepieceapi.com/api/characters?limit=3" | jq'}
            </pre>
            <p>
              Prefer clicking over curl?{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="/playground"
              >
                Open the Playground
              </Link>{" "}
              to pick an endpoint, edit query params, and see the live response
              — including a card preview and ready-to-paste
              cURL/JavaScript/Python snippets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conventions</CardTitle>
            <CardDescription>
              Shared rules across list endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1.5">
              <li>
                <strong className="text-foreground">Base URL:</strong> your
                deployment origin, or{" "}
                <EndpointCode>http://localhost:3000</EndpointCode> locally.
              </li>
              <li>
                <strong className="text-foreground">Pagination:</strong>{" "}
                <EndpointCode>?page=</EndpointCode> (1-based, default{" "}
                <InlineCode>1</InlineCode>),{" "}
                <EndpointCode>?limit=</EndpointCode> (default{" "}
                <InlineCode>20</InlineCode>).
              </li>
              <li>
                <strong className="text-foreground">Timestamps:</strong>{" "}
                <InlineCode>created_at</InlineCode> values are ISO 8601
                date-time strings (UTC).
              </li>
              <li>
                <strong className="text-foreground">Caching:</strong> responses
                carry{" "}
                <InlineCode>
                  Cache-Control: public, s-maxage=60, stale-while-revalidate=300
                </InlineCode>{" "}
                — the CDN serves a cached copy for up to 60s, then revalidates
                in the background. Expect near-instant responses, and data that
                can lag a fresh write by up to a minute.
              </li>
              <li>
                <strong className="text-foreground">Errors:</strong> failed
                requests return JSON{" "}
                <InlineCode>{`{ "error": string }`}</InlineCode>. Most server
                errors return HTTP <InlineCode>500</InlineCode>; some detail
                routes return <InlineCode>404</InlineCode> when an id is
                missing.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discovery</CardTitle>
            <CardDescription>
              Canonical production URLs for routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api</EndpointCode> returns a small map of
              endpoint URLs (useful for clients and tooling).
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-[0.75rem] leading-relaxed text-foreground">
              {`{
  "characters": "https://onepieceapi.com/api/characters",
  "devilFruits": "https://onepieceapi.com/api/devil-fruits",
  "bounties": "https://onepieceapi.com/api/bounties",
  "ships": "https://onepieceapi.com/api/ships",
  "islands": "https://onepieceapi.com/api/islands",
  "affiliations": "https://onepieceapi.com/api/affiliations"
}`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localized JSON fields</CardTitle>
            <CardDescription>
              Some columns are stored as JSON and usually follow a shared shape.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              Columns like <InlineCode>characters.name</InlineCode>,{" "}
              <InlineCode>devil_fruits.name</InlineCode>, and{" "}
              <InlineCode>devil_fruits.model</InlineCode> may be{" "}
              <InlineCode>null</InlineCode> or a localized JSON object. When
              localized, the convention is:
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-[0.75rem] leading-relaxed text-foreground">
              {characterNameExample}
            </pre>
            <p>
              Clients typically pick a primary label in priority order{" "}
              <InlineCode>en</InlineCode> → <InlineCode>romaji</InlineCode> →{" "}
              <InlineCode>jp</InlineCode>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Characters</CardTitle>
            <CardDescription>
              Paginated characters; each item includes related bounties.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/characters</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1.5">
              <li>
                <EndpointCode>?page=</EndpointCode> /{" "}
                <EndpointCode>?limit=</EndpointCode> pagination.
              </li>
              <li>
                <EndpointCode>?q=</EndpointCode> searches localized name fields{" "}
                (<InlineCode>en</InlineCode>, <InlineCode>jp</InlineCode>,{" "}
                <InlineCode>romaji</InlineCode>) case-insensitively.
              </li>
              <li>
                <EndpointCode>?ageBand=</EndpointCode> filters numeric{" "}
                <InlineCode>age</InlineCode> with one of{" "}
                <InlineCode>0-12</InlineCode>, <InlineCode>13-17</InlineCode>,{" "}
                <InlineCode>18-29</InlineCode>, <InlineCode>30-59</InlineCode>,{" "}
                <InlineCode>60+</InlineCode>. When set, rows with{" "}
                <InlineCode>age = null</InlineCode> are excluded.
              </li>
            </ul>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of character objects. Each object includes the fields below,
              plus a <InlineCode>bounties</InlineCode> array of bounty objects
              (same shape as <EndpointCode>GET /api/bounties</EndpointCode>{" "}
              items).
            </p>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Character object
              </p>
              <FieldTable rows={CHARACTER_FIELDS} />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">bounties[]</code>{" "}
                items
              </p>
              <FieldTable rows={BOUNTY_FIELDS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Character detail</CardTitle>
            <CardDescription>
              Fetch a single character by id (includes related bounties).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/characters/[id]</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a single
              character object (same fields as list items), or{" "}
              <InlineCode>404</InlineCode> when not found.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bounties</CardTitle>
            <CardDescription>
              Paginated bounty rows; optional filters and sort order.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/bounties</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong>{" "}
              <EndpointCode>?isActive=true</EndpointCode> or{" "}
              <EndpointCode>?isActive=false</EndpointCode> filters{" "}
              <InlineCode>is_active</InlineCode>. If omitted, no filter is
              applied (returns both active and inactive).
            </p>
            <p>
              <strong className="text-foreground">Sort:</strong>{" "}
              <EndpointCode>?sort=high</EndpointCode> orders by{" "}
              <InlineCode>amount</InlineCode> descending (largest first);{" "}
              <EndpointCode>?sort=low</EndpointCode> ascending (smallest first).
              Omit <EndpointCode>sort</EndpointCode> for newest first by{" "}
              <InlineCode>created_at</InlineCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of bounty objects (fields below).
            </p>
            <FieldTable rows={BOUNTY_FIELDS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devil fruits</CardTitle>
            <CardDescription>Paginated devil fruit resources.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/devil-fruits</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> pagination via{" "}
              <EndpointCode>?page=</EndpointCode> /{" "}
              <EndpointCode>?limit=</EndpointCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of devil fruit objects (fields below).
            </p>
            <FieldTable rows={DEVIL_FRUIT_FIELDS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ships</CardTitle>
            <CardDescription>Paginated ship resources.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/ships</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> pagination via{" "}
              <EndpointCode>?page=</EndpointCode> /{" "}
              <EndpointCode>?limit=</EndpointCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of ship objects (fields below).
            </p>
            <FieldTable rows={SHIP_FIELDS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Islands</CardTitle>
            <CardDescription>Paginated island resources.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/islands</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> pagination via{" "}
              <EndpointCode>?page=</EndpointCode> /{" "}
              <EndpointCode>?limit=</EndpointCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of island objects (fields below).
            </p>
            <FieldTable rows={ISLAND_FIELDS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affiliations</CardTitle>
            <CardDescription>
              Paginated crew, family, and organization resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/affiliations</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> pagination via{" "}
              <EndpointCode>?page=</EndpointCode> /{" "}
              <EndpointCode>?limit=</EndpointCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of affiliation objects (fields below), sorted by member
              count, largest first.
            </p>
            <FieldTable rows={AFFILIATION_FIELDS} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
