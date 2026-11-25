import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination, parseSearch } from "@/lib/api-params";
import { apiJson } from "@/lib/api-response";
import { getBounties } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);
  const q = parseSearch(url.searchParams);

  const isActiveParam = url.searchParams.get("isActive");
  const isActive =
    isActiveParam === null ? undefined : isActiveParam.toLowerCase() === "true";

  const sortParam = url.searchParams.get("sort");
  const sort =
    sortParam === "high" || sortParam === "low" ? sortParam : "newest";

  try {
    const { data } = await getBounties({ page, limit, isActive, sort, q });
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
