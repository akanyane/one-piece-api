import { apiJson } from "@/lib/api-response";

export async function GET() {
  return apiJson({
    characters: "https://onepieceapi.com/api/characters",
    devilFruits: "https://onepieceapi.com/api/devil-fruits",
    bounties: "https://onepieceapi.com/api/bounties",
  });
}
