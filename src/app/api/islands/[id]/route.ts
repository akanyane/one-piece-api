import { detailResponse } from "@/lib/api-detail";
import { getIslandById } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return detailResponse(id, getIslandById);
}
