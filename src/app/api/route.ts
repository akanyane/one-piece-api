import { apiJson } from "@/lib/api-response";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  return apiJson({
    characters: `${SITE_URL}/api/characters`,
    devilFruits: `${SITE_URL}/api/devil-fruits`,
    bounties: `${SITE_URL}/api/bounties`,
    ships: `${SITE_URL}/api/ships`,
    islands: `${SITE_URL}/api/islands`,
    affiliations: `${SITE_URL}/api/affiliations`,
    openapi: `${SITE_URL}/openapi.json`,
    documentation: `${SITE_URL}/documentation`,
  });
}
