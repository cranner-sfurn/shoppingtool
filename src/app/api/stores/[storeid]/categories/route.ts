import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { category, store } from "@/db/schema";
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
    const cacheKey = `store:${storeId}:categories`;

    // Check if categories are already cached
    const cachedCategories = await cache.get(cacheKey, "json");

    if (cachedCategories) {
      // Return cached data
      return NextResponse.json(cachedCategories);
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

    // Fetch all categories for the store
    const result = await db.select().from(category);

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

    // Return all categories
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching store categories:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
