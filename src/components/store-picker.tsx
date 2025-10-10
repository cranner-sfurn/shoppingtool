"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StoresApiResponse } from "@/lib/api-types";
import { useLocation } from "@/lib/location-context";
import { calculateDistanceInMiles } from "@/lib/coordinates";

// fetch the stores to show after location is found
async function fetchStores(): Promise<StoresApiResponse> {
  const response = await fetch("/api/stores");
  if (!response.ok) {
    throw new Error("Failed to fetch stores");
  }
  return response.json();
}

export default function StorePicker() {
  const router = useRouter();
  const { location } = useLocation();

  // get store data from the api
  const {
    data: stores,
    isLoading: storesLoading,
    error: storesError,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });

  // when s atore is selected go to that stores specific handler page
  const handleStoreSelect = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  // Show loading whilst we get store/location data
  if (storesLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle any errors related to stores api or location access
  if (storesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load stores</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show the stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores?.map((store) => {
          const distance = location
            ? calculateDistanceInMiles(
                location.latitude,
                location.longitude,
                store.latitude,
                store.longitude
              )
            : null;

          return (
            <Card key={store.id}>
              <CardHeader>
                <CardTitle>{store.name}</CardTitle>
                {distance !== null && (
                  <p className="text-sm text-gray-600">
                    {distance.toFixed(2)} miles away
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleStoreSelect(store.id)}
                  className="w-full"
                >
                  Select Store
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
