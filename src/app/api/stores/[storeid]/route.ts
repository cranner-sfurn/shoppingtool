import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeid: string }> }
) {
  try {
    // Get the parameters from the request and check the storeid is valid
    const { storeid: storeId } = await params;
    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Get Cloudflare context to access KV
    const cloudflareContext = getCloudflareContext();
    const cache = cloudflareContext.env.CACHE;
    const cacheKey = `store:${storeId}`;

    // Check if store is already cached
    const cachedStore = await cache.get(cacheKey, "json");

    if (cachedStore) {
      // Return cached data
      return NextResponse.json(cachedStore);
    }

    // If not cached, fetch from database
    const db = getDb();
    const result = await db.select().from(store).where(eq(store.id, storeId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const storeData = result[0];

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(storeData), {
      expirationTtl: 3600,
    });

    // Return the store data
    return NextResponse.json(storeData);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
