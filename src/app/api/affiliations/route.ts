import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination, parseSearch } from "@/lib/api-params";
import { apiJson } from "@/lib/api-response";
import { getAffiliations } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);
  const q = parseSearch(url.searchParams);

  try {
    const { data } = await getAffiliations({ page, limit, q });
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
