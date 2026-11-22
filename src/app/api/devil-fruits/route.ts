import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { parsePagination } from "@/lib/api-params";
import { apiJson } from "@/lib/api-response";
import { getDevilFruits } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url.searchParams);

  try {
    const { data } = await getDevilFruits({ page, limit });
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
