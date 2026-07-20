import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { supabase } from "@/supabase/client";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(
    1,
    Math.floor(Number(url.searchParams.get("page")) || 1),
  );
  const rawLimit = Number(url.searchParams.get("limit")) || 20;
  const limit = Math.min(Math.max(1, Math.floor(rawLimit)), MAX_LIMIT);

  const { data, error } = await supabase
    .from("devil_fruits")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return errorResponse(error);
  }

  return NextResponse.json(data);
}
