import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { storeItem, store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeid: string; itemid: string }> }
) {
  try {
    // Get the parameters from the request and check they are valid
    const { storeid: storeId, itemid: itemId } = await params;
    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }
    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get Cloudflare context to access KV
    const cloudflareContext = getCloudflareContext();
    const cache = cloudflareContext.env.CACHE;
    const cacheKey = `store:${storeId}:item:${itemId}`;

    // Check if store item is already cached
    const cachedItem = await cache.get(cacheKey, "json");

    if (cachedItem) {
      // Return cached data
      return NextResponse.json(cachedItem);
    }

    // If not cached, fetch from database
    const db = getDb();

    // First verify the store exists
    const storeResult = await db
      .select()
      .from(store)
      .where(eq(store.id, storeId));
    if (storeResult.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Fetch the specific item for the store
    const result = await db
      .select()
      .from(storeItem)
      .where(and(eq(storeItem.storeId, storeId), eq(storeItem.id, itemId)));

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const itemData = result[0];

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(itemData), {
      expirationTtl: 3600,
    });

    // Return the specific item
    return NextResponse.json(itemData);
  } catch (error) {
    console.error("Error fetching store item:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
