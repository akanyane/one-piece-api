import { apiJson } from "@/lib/api-response";
import { openApiSpec } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return apiJson(openApiSpec);
}
