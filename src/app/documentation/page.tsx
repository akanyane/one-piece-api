import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/supabase/database.types";

export const metadata: Metadata = {
  title: "Documentation",
  description: "How to use the One Piece API: REST basics and examples.",
};

type ColumnRow = { field: string; type: string; notes?: string };

const CHARACTER_ROW_FIELDS: {
  key: keyof Tables<"characters">;
  type: string;
  notes?: string;
}[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes: "Localized name; see CharacterNameJson when present",
  },
  { key: "age", type: "number | null" },
  {
    key: "birthday",
    type: "object | null",
    notes: "Structured birthday payload when present",
  },
  { key: "blood_type", type: "string" },
  { key: "height", type: "number | null" },
  { key: "status", type: "string" },
];

const BOUNTY_ROW_FIELDS: {
  key: keyof Tables<"bounties">;
  type: string;
  notes?: string;
}[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  { key: "amount", type: "number | null" },
  { key: "character_id", type: "string | null", notes: "FK → characters.id" },
  { key: "is_active", type: "boolean" },
];

const DEVIL_FRUIT_ROW_FIELDS: {
  key: keyof Tables<"devil_fruits">;
  type: string;
  notes?: string;
}[] = [
  { key: "id", type: "string", notes: "UUID primary key" },
  { key: "created_at", type: "string", notes: "ISO 8601 timestamp" },
  {
    key: "name",
    type: "object | null",
    notes:
      "Localized fruit name; CharacterNameJson when present (en, jp, romaji)",
  },
  {
    key: "model",
    type: "object | null",
    notes: "Localized model name; same CharacterNameJson shape when present",
  },
  { key: "type", type: "string | null", notes: "e.g. Paramecia, Zoan, Logia" },
  { key: "sub_type", type: "string | null" },
  { key: "image_url", type: "string | null" },
];

function toRows(
  fields: { key: string; type: string; notes?: string }[],
): ColumnRow[] {
  return fields.map(({ key, type, notes }) => ({
    field: key,
    type,
    notes,
  }));
}

function FieldTable({ rows }: { rows: ColumnRow[] }) {
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
    <div className="min-h-[calc(100dvh-theme(spacing.14))] bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Logo />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-5" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wide">
              Docs
            </span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            API documentation
          </h1>
          <p className="max-w-3xl text-sm/relaxed text-muted-foreground md:text-base/relaxed">
            JSON over HTTP. Each endpoint returns plain objects you can model in
            any client; the field tables below describe the stable response
            shape. Where a resource embeds another (e.g. bounties on a
            character), that is called out explicitly.
          </p>
        </div>

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
  "bounties": "https://onepieceapi.com/api/bounties"
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
              <FieldTable rows={toRows(CHARACTER_ROW_FIELDS)} />
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">
                Nested{" "}
                <code className="font-mono text-[0.8125rem]">bounties[]</code>{" "}
                items
              </p>
              <FieldTable rows={toRows(BOUNTY_ROW_FIELDS)} />
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
            <FieldTable rows={toRows(BOUNTY_ROW_FIELDS)} />
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
            <FieldTable rows={toRows(DEVIL_FRUIT_ROW_FIELDS)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources not exposed yet</CardTitle>
            <CardDescription>
              Planned or internal data not available as HTTP endpoints today.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Affiliations, islands, and ships are part of the broader dataset
              but do not have public routes in this API yet. When they ship,
              they will be documented here with the same field-table style.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
