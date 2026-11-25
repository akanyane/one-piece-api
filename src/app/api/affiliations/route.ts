import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination, parseSearch } from "@/lib/api-params";
import { apiPage } from "@/lib/api-response";
import { getAffiliations } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);
  const q = parseSearch(url.searchParams);

  try {
    const { data, count } = await getAffiliations({ page, limit, q });
    return apiPage(request, data, { page, limit, total: count });
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
