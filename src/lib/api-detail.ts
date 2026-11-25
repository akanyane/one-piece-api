import type { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { apiJson } from "@/lib/api-response";
import { isUuid } from "@/lib/uuid";

/**
 * Shared body of the `GET /api/{resource}/{id}` handlers: 400 for a malformed
 * id (checked here, so it never reaches Postgres), 404 when missing, else the row.
 */
export async function detailResponse<T>(
  id: string,
  fetchById: (id: string) => Promise<T | null>,
): Promise<NextResponse> {
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const data = await fetchById(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
