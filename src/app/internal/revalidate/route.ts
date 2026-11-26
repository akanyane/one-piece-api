import { revalidateResponse } from "@/lib/api-revalidate";

/** Not part of the public API: purges cached data after a direct DB edit. */
export async function POST(request: Request) {
  return revalidateResponse(request);
}
