import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination } from "@/lib/api-params";
import { apiPage } from "@/lib/api-response";
import { parseAgeBand, parseNameQuery } from "@/lib/characters-catalog-url";
import { getCharacters } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);

  const q = parseNameQuery(url.searchParams.get("q") ?? undefined);
  const ageBand = parseAgeBand(url.searchParams.get("ageBand") ?? undefined);

  try {
    const { data, count } = await getCharacters({ page, limit, q, ageBand });
    return apiPage(request, data, { page, limit, total: count });
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
