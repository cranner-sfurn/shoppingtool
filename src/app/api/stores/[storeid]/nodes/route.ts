import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { node, store } from "@/db/schema";
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
    const cacheKey = `store:${storeId}:nodes`;

    // Check if nodes are already cached
    const cachedNodes = await cache.get(cacheKey, "json");

    if (cachedNodes) {
      // Return cached data
      return NextResponse.json(cachedNodes);
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

    // Fetch all nodes for the store
    const result = await db
      .select()
      .from(node)
      .where(eq(node.storeId, storeId));

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

    // Return all nodes for the store
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching store nodes:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store nodes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

