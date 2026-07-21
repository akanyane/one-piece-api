import type { PostgrestError } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api-error";
import { apiJson } from "@/lib/api-response";
import { getDevilFruits } from "@/lib/data";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(
    1,
    Math.floor(Number(url.searchParams.get("page")) || 1),
  );
  const rawLimit = Number(url.searchParams.get("limit")) || 20;
  const limit = Math.min(Math.max(1, Math.floor(rawLimit)), MAX_LIMIT);

  try {
    const data = await getDevilFruits({ page, limit });
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
