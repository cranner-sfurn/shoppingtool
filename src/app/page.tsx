"use client";

import { useQuery } from "@tanstack/react-query";
import { Store } from "@lib/types";

async function fetchStores(): Promise<Store[]> {
  const response = await fetch("/api/stores");
  if (!response.ok) {
    throw new Error("Failed to fetch stores");
  }
  return response.json();
}

export default function Home() {
  const {
    data: stores,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Stores</h1>
        <p>Loading stores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Stores</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Stores (JSON Output)</h1>
      <pre>{JSON.stringify(stores, null, 2)}</pre>
    </div>
  );
}
