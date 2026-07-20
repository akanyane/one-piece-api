import type { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** Postgres SQLSTATE class "22" (data exception) means the request input was malformed. */
function isClientError(error: PostgrestError): boolean {
  return error.code?.startsWith("22") ?? false;
}

/** Map a Supabase/Postgres error to a response without leaking internals to the client. */
export function errorResponse(error: PostgrestError): NextResponse {
  if (isClientError(error)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
