import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { store } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const cacheKey = "store:all";
export async function GET() {
  try {
    // Get Cloudflare context to access KV
    const cloudflareContext = getCloudflareContext();
    const cache = cloudflareContext.env.CACHE;

    // Check if stores are already cached
    const cachedStores = await cache.get(cacheKey, "json");

    if (cachedStores) {
      // Return cached data
      return NextResponse.json(cachedStores);
    }

    // If not cached, fetch from database
    const db = getDb();
    const result = await db.select().from(store);

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

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
