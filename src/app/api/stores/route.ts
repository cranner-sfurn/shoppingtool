import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPrismaClient } from "@lib/db";

// Cache configuration
const CACHE_KEY = "stores:all";
const CACHE_TTL = 60 * 60 * 1; // 1 hour in seconds

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    // Check KV cache first
    if (env.CACHE) {
      try {
        const cachedStores = await env.CACHE.get(CACHE_KEY);
        if (cachedStores) {
          console.log("Cache hit: returning cached stores");
          return NextResponse.json(JSON.parse(cachedStores));
        }
      } catch (kvError) {
        console.warn("KV cache read error:", kvError);
      }
    }

    const prisma = createPrismaClient(env);
    const stores = await prisma.store.findMany();

    // Store in KV cache with TTL
    if (env.CACHE) {
      try {
        await env.CACHE.put(CACHE_KEY, JSON.stringify(stores), {
          expirationTtl: CACHE_TTL,
        });
        console.log(`Stored stores in cache with TTL: ${CACHE_TTL}s`);
      } catch (kvError) {
        console.warn("KV cache write error:", kvError);
        // Continue without failing the request
      }
    }

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
