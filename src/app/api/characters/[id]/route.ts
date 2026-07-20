import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { supabase } from "@/supabase/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const { data, error } = await supabase
    .from("characters")
    .select("*, bounties(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return errorResponse(error);
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
