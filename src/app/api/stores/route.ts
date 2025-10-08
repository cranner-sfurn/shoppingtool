import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Type definition for Store
interface Store {
  id: number;
  name: string;
  description: string;
}

export async function GET() {
  try {
    // Get Cloudflare context to access D1 database
    const cloudflareContext = getCloudflareContext();

    if (!cloudflareContext) {
      console.error("Cloudflare context not available");
      return NextResponse.json(
        { error: "Cloudflare context not available" },
        { status: 500 }
      );
    }

    const db = cloudflareContext.env.DB;

    if (!db) {
      console.error("D1 database not available in Cloudflare context");
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    console.log("Attempting to query D1 database...");

    // Query all stores from the Store table
    const result = await db.prepare("SELECT * FROM Store").all<Store>();

    if (!result.success) {
      console.error("Database query failed:", result.error);
      return NextResponse.json(
        { error: `Database query failed: ${result.error}` },
        { status: 500 }
      );
    }

    console.log(
      `Successfully fetched ${result.results.length} stores from database`
    );

    // Return all stores from the database
    return NextResponse.json(result.results);
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
