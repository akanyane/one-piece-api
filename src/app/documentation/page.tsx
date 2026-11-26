import { Terminal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AFFILIATION_DETAIL_FIELDS,
  AFFILIATION_FIELDS,
  type ApiFieldRow,
  BOUNTY_FIELDS,
  CHARACTER_FIELDS,
  CHARACTER_RELATION_FIELDS,
  DEVIL_FRUIT_FIELDS,
  DEVIL_FRUIT_RELATION_FIELDS,
  ISLAND_FIELDS,
  LINKED_AFFILIATION_FIELDS,
  LINKED_CHARACTER_FIELDS,
  LINKED_DEVIL_FRUIT_FIELDS,
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
      <PageBackdrop />

      <SiteHeader />

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
              {
                'curl -s "https://www.onepieceapi.com/api/characters?limit=3" | jq'
              }
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
            <p>
              CORS is open to every origin, so you can call the API straight
              from a browser app with <EndpointCode>fetch</EndpointCode>. A
              machine-readable OpenAPI 3.1 spec lives at{" "}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="/openapi.json"
              >
                /openapi.json
              </a>{" "}
              — import it into Postman, Insomnia or a client generator.
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
                <InlineCode>20</InlineCode>, max <InlineCode>100</InlineCode>).
                The body stays a plain array; every list response also carries{" "}
                <InlineCode>X-Total-Count</InlineCode> (items across all pages)
                and a <InlineCode>Link</InlineCode> header with{" "}
                <InlineCode>first</InlineCode>, <InlineCode>prev</InlineCode>,{" "}
                <InlineCode>next</InlineCode> and <InlineCode>last</InlineCode>{" "}
                URLs. Both are readable from browser code (CORS exposes them).
              </li>
              <li>
                <strong className="text-foreground">Search:</strong> every list
                endpoint accepts <EndpointCode>?q=</EndpointCode>, a
                case-insensitive name search across <InlineCode>en</InlineCode>,{" "}
                <InlineCode>jp</InlineCode> and <InlineCode>romaji</InlineCode>{" "}
                (max 120 characters).
              </li>
              <li>
                <strong className="text-foreground">Detail routes:</strong>{" "}
                every resource has{" "}
                <EndpointCode>{"GET /api/{resource}/{id}"}</EndpointCode>,
                returning one object with the same shape as a list item
                (affiliations also add their <InlineCode>members</InlineCode>).
              </li>
              <li>
                <strong className="text-foreground">Timestamps:</strong>{" "}
                <InlineCode>created_at</InlineCode> values are ISO 8601
                date-time strings (UTC).
              </li>
              <li>
                <strong className="text-foreground">Caching:</strong> the CDN
                serves a cached copy of each response for up to 60s, then
                revalidates it in the background (the response you receive says{" "}
                <InlineCode>Cache-Control: public</InlineCode>, and{" "}
                <InlineCode>X-Vercel-Cache</InlineCode> shows{" "}
                <InlineCode>HIT</InlineCode> or <InlineCode>MISS</InlineCode>).
                Expect near-instant responses, and data that can lag a fresh
                write by up to a minute.
              </li>
              <li>
                <strong className="text-foreground">Rate limit:</strong> 3,000
                requests per minute per IP. Above that you get{" "}
                <InlineCode>429 Too Many Requests</InlineCode> until the minute
                resets. Paging through a whole resource at{" "}
                <InlineCode>limit=100</InlineCode> takes about 15 requests, so
                cache what you fetch instead of polling in a loop.
              </li>
              <li>
                <strong className="text-foreground">Privacy:</strong> usage is
                counted anonymously (endpoint, client type, country, calling
                site and which query params are used). IPs and full user agents
                are never stored. Distinct callers per day are counted with a
                hash of the IP that changes daily and can&apos;t be reversed.
              </li>
              <li>
                <strong className="text-foreground">Errors:</strong> failed
                requests return JSON{" "}
                <InlineCode>{`{ "error": string }`}</InlineCode>. Detail routes
                return <InlineCode>400</InlineCode> for an id that is not a UUID
                and <InlineCode>404</InlineCode> when it doesn&apos;t exist;
                unexpected failures return <InlineCode>500</InlineCode>.
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
  "characters": "https://www.onepieceapi.com/api/characters",
  "devilFruits": "https://www.onepieceapi.com/api/devil-fruits",
  "bounties": "https://www.onepieceapi.com/api/bounties",
  "ships": "https://www.onepieceapi.com/api/ships",
  "islands": "https://www.onepieceapi.com/api/islands",
  "affiliations": "https://www.onepieceapi.com/api/affiliations",
  "openapi": "https://www.onepieceapi.com/openapi.json",
  "documentation": "https://www.onepieceapi.com/documentation"
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
              Paginated characters; each item includes their bounties, devil
              fruits and affiliations.
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
              plus three relation arrays: <InlineCode>bounties</InlineCode>,{" "}
              <InlineCode>devil_fruits</InlineCode> and{" "}
              <InlineCode>affiliations</InlineCode>. Relations carry{" "}
              <InlineCode>is_active</InlineCode> (<InlineCode>false</InlineCode>{" "}
              for a former user or member) and list current ones first.
            </p>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Character object
              </p>
              <FieldTable
                rows={[...CHARACTER_FIELDS, ...CHARACTER_RELATION_FIELDS]}
              />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">bounties[]</code>{" "}
                items
              </p>
              <FieldTable rows={BOUNTY_FIELDS} />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">
                  devil_fruits[]
                </code>{" "}
                items
              </p>
              <FieldTable rows={LINKED_DEVIL_FRUIT_FIELDS} />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">
                  affiliations[]
                </code>{" "}
                items
              </p>
              <FieldTable rows={LINKED_AFFILIATION_FIELDS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Character detail</CardTitle>
            <CardDescription>
              Fetch a single character by id, with bounties, devil fruits and
              affiliations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>{"GET /api/characters/{id}"}</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a single
              character object (same fields as list items),{" "}
              <InlineCode>400</InlineCode> for a malformed id, or{" "}
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
              applied (returns both active and inactive).{" "}
              <EndpointCode>?q=</EndpointCode> matches the bounty holder&apos;s
              name.
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
              <strong className="text-foreground">Detail:</strong>{" "}
              <EndpointCode>{"GET /api/bounties/{id}"}</EndpointCode> returns
              one bounty (same fields), or <InlineCode>404</InlineCode>.
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
            <CardDescription>
              Paginated devil fruits, each with the characters who ate it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              <EndpointCode>GET /api/devil-fruits</EndpointCode>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> pagination via{" "}
              <EndpointCode>?page=</EndpointCode> /{" "}
              <EndpointCode>?limit=</EndpointCode>, and{" "}
              <EndpointCode>?q=</EndpointCode> to search by name or Zoan model
              (e.g. <InlineCode>nika</InlineCode>).
            </p>
            <p>
              <strong className="text-foreground">Detail:</strong>{" "}
              <EndpointCode>{"GET /api/devil-fruits/{id}"}</EndpointCode>{" "}
              returns one object (same fields), or <InlineCode>404</InlineCode>.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of devil fruit objects (fields below). Most fruits have one
              user; a fruit that changed hands lists the current user first and
              former ones with <InlineCode>is_active: false</InlineCode>.
            </p>
            <FieldTable
              rows={[...DEVIL_FRUIT_FIELDS, ...DEVIL_FRUIT_RELATION_FIELDS]}
            />
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">users[]</code>{" "}
                items
              </p>
              <FieldTable rows={LINKED_CHARACTER_FIELDS} />
            </div>
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
              <EndpointCode>?limit=</EndpointCode>, and{" "}
              <EndpointCode>?q=</EndpointCode> to search by name.
            </p>
            <p>
              <strong className="text-foreground">Detail:</strong>{" "}
              <EndpointCode>{"GET /api/ships/{id}"}</EndpointCode> returns one
              object (same fields), or <InlineCode>404</InlineCode>.
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
              <EndpointCode>?limit=</EndpointCode>, and{" "}
              <EndpointCode>?q=</EndpointCode> to search by name.
            </p>
            <p>
              <strong className="text-foreground">Detail:</strong>{" "}
              <EndpointCode>{"GET /api/islands/{id}"}</EndpointCode> returns one
              object (same fields), or <InlineCode>404</InlineCode>.
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
              <EndpointCode>?limit=</EndpointCode>, and{" "}
              <EndpointCode>?q=</EndpointCode> to search by name.
            </p>
            <p>
              <strong className="text-foreground">Detail:</strong>{" "}
              <EndpointCode>{"GET /api/affiliations/{id}"}</EndpointCode>{" "}
              returns one object with the same fields plus{" "}
              <InlineCode>members</InlineCode>, every linked character (current
              members first), or <InlineCode>404</InlineCode>. The list keeps
              only <InlineCode>memberCount</InlineCode> to stay light.
            </p>
            <p>
              <strong className="text-foreground">Response:</strong> a JSON
              array of affiliation objects (fields below), sorted by member
              count, largest first.
            </p>
            <FieldTable rows={AFFILIATION_FIELDS} />
            <div>
              <p className="mb-2 font-medium text-foreground">Detail only</p>
              <FieldTable rows={AFFILIATION_DETAIL_FIELDS} />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">members[]</code>{" "}
                items
              </p>
              <FieldTable rows={LINKED_CHARACTER_FIELDS} />
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
