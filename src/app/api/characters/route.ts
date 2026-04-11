import { NextResponse } from "next/server";

import {
  ageRangeForBand,
  parseAgeBand,
  parseNameQuery,
} from "@/lib/characters-catalog-url";
import { supabase } from "@/supabase/client";

const MAX_LIMIT = 100;

/** Escape `%` and `_` so user input is literal in SQL `ILIKE`. */
function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Math.floor(Number(url.searchParams.get("page")) || 1));
  const rawLimit = Number(url.searchParams.get("limit")) || 20;
  const limit = Math.min(Math.max(1, Math.floor(rawLimit)), MAX_LIMIT);

  const qRaw = parseNameQuery(url.searchParams.get("q") ?? undefined);
  const ageBand = parseAgeBand(url.searchParams.get("ageBand") ?? undefined);

  let query = supabase
    .from("characters")
    .select("*, bounties(*)")
    .order("created_at", { ascending: false });

  if (qRaw) {
    const pattern = `%${escapeIlike(qRaw)}%`;
    query = query.or(
      `name->>en.ilike.${pattern},name->>jp.ilike.${pattern},name->>romaji.ilike.${pattern}`,
    );
  }

  const { min, max } = ageRangeForBand(ageBand);
  if (min !== null) query = query.gte("age", min);
  if (max !== null) query = query.lte("age", max);

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
