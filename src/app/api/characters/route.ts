import type { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { parsePagination, parseSearch } from "@/lib/api-params";
import { apiPage } from "@/lib/api-response";
import {
  parseAgeBand,
  parseCharacterFilters,
} from "@/lib/characters-catalog-url";
import { getCharacters } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);

  const q = parseSearch(url.searchParams);
  const ageBand = parseAgeBand(url.searchParams.get("ageBand") ?? undefined);
  const parsed = parseCharacterFilters(url.searchParams);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const { data, count } = await getCharacters({
      page,
      limit,
      q,
      ageBand,
      ...parsed.filters,
    });
    return apiPage(request, data, { page, limit, total: count });
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
