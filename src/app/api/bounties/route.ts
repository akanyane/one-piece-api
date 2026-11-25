import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination, parseSearch } from "@/lib/api-params";
import { apiPage } from "@/lib/api-response";
import { parseIsActive } from "@/lib/bounties-catalog-url";
import { getBounties } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);
  const q = parseSearch(url.searchParams);

  const isActive = parseIsActive(url.searchParams.get("isActive"));

  const sortParam = url.searchParams.get("sort");
  const sort =
    sortParam === "high" || sortParam === "low" ? sortParam : "newest";

  try {
    const { data, count } = await getBounties({
      page,
      limit,
      isActive,
      sort,
      q,
    });
    return apiPage(request, data, { page, limit, total: count });
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
