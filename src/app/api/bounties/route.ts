import type { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { getBounties } from "@/lib/data";

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
  const sort =
    sortParam === "high" || sortParam === "low" ? sortParam : "newest";

  try {
    const data = await getBounties({ page, limit, isActive, sort });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error as PostgrestError);
  }
}
