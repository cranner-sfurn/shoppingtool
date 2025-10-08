import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { store } from "@/db/schema";
export async function GET() {
  try {
    // Get Cloudflare context to access D1 database
    const cloudflareContext = getCloudflareContext();

    const db = drizzle(cloudflareContext.env.DB);
    const result = await db.select().from(store);

    // Return all stores from the database
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch stores: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
