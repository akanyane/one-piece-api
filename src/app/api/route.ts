import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    characters: "https://onepieceapi.com/api/characters",
    devilFruits: "https://onepieceapi.com/api/devil-fruits",
    bounties: "https://onepieceapi.com/api/bounties",
  });
}
