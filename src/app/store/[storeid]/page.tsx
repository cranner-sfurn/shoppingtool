"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { StoreApiResponse } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// fetch the store data from the api
async function fetchStore(storeId: string): Promise<StoreApiResponse> {
  const response = await fetch(`/api/stores/${storeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch store");
  }
  return response.json();
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeid as string;

  // get the store data from the api
  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => fetchStore(storeId),
    enabled: !!storeId,
  });

  // show loading whilst we get the store data
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // show an error if the store data is not found
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            Back to Store Picker
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Error: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // show an error if the store data is not found
  if (!store) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            Back to Store Picker
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Store Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested store could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // show a back button to the store picker
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          Back to Store Picker
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {store.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm">Latitude: {store.latitude.toFixed(6)}</p>
              <p className="text-sm">Longitude: {store.longitude.toFixed(6)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Store ID</h3>
              <p className="text-sm">{store.id}</p>
            </div>
          </div>
          <h3 className="font-semibold mb-2">Raw Store Data</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(store, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
