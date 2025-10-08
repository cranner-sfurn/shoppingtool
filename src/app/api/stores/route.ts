import { NextResponse } from "next/server";

// Mock store data since Prisma has been removed
const mockStores = [
  {
    id: 1,
    name: "Sample Store 1",
    description: "A sample store for testing",
  },
  {
    id: 2,
    name: "Sample Store 2",
    description: "Another sample store for testing",
  },
];

export async function GET() {
  try {
    // Return mock data instead of database query
    return NextResponse.json(mockStores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
