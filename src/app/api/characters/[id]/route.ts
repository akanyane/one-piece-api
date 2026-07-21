import type { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { apiJson } from "@/lib/api-response";
import { getCharacterById } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const data = await getCharacterById(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return apiJson(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
