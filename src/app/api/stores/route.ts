import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { store } from "@/db/schema";
export async function GET() {
  try {
    // Get database connection
    const db = getDb();
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
