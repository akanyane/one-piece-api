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

  const isActiveParam = url.searchParams.get("isActive");
  const isActive =
    isActiveParam === null ? undefined : isActiveParam.toLowerCase() === "true";

  const sortParam = url.searchParams.get("sort");

  let query = supabase.from("bounties").select("*, characters(name)");

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  if (sortParam === "high") {
    query = query
      .order("amount", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sortParam === "low") {
    query = query
      .order("amount", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );

  if (error) {
    return errorResponse(error);
  }

  return NextResponse.json(data);
}
