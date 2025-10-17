import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { storeItem, store, category } from "@/db/schema";
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

    // Get Cloudflare context to access KV
    const cloudflareContext = getCloudflareContext();
    const cache = cloudflareContext.env.CACHE;
    const cacheKey = `store:${storeId}:items`;

    // Check if store items are already cached
    const cachedItems = await cache.get(cacheKey, "json");

    if (cachedItems) {
      // Return cached data
      return NextResponse.json(cachedItems);
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

    // Fetch all items for the store with category information
    const result = await db
      .select({
        id: storeItem.id,
        storeId: storeItem.storeId,
        categoryId: storeItem.categoryId,
        categoryName: category.name,
        name: storeItem.name,
        description: storeItem.description,
      })
      .from(storeItem)
      .innerJoin(category, eq(storeItem.categoryId, category.id))
      .where(eq(storeItem.storeId, storeId));

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

    // Return all items for the store
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching store items:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
