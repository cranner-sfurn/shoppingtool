import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPrismaClient } from "@lib/db";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const prisma = createPrismaClient(env);
    const stores = await prisma.store.findMany();

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
