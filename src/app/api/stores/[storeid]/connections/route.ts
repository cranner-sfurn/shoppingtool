import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nodeConnection, store } from "@/db/schema";
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
    const cacheKey = `store:${storeId}:connections`;

    // Check if connections are already cached
    const cachedConnections = await cache.get(cacheKey, "json");

    if (cachedConnections) {
      // Return cached data
      return NextResponse.json(cachedConnections);
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

    // Fetch all node connections for the store
    const result = await db
      .select()
      .from(nodeConnection)
      .where(eq(nodeConnection.storeId, storeId));

    // Cache the result with 1 hour TTL (3600 seconds)
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

    // Return all connections for the store
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching store connections:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch store connections: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

