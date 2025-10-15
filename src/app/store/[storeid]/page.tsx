"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { StoreApiResponse } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "../../../components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types for store items
interface StoreItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description?: string;
}

// fetch the store data from the api
async function fetchStore(storeId: string): Promise<StoreApiResponse> {
  const response = await fetch(`/api/stores/${storeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch store");
  }
  return response.json();
}

// fetch the store items from the api
async function fetchStoreItems(storeId: string): Promise<StoreItem[]> {
  const response = await fetch(`/api/stores/${storeId}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch store items");
  }
  return response.json();
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeid as string;

  // State for shopping list and search
  const [shoppingList, setShoppingList] = useState<StoreItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // get the store data from the api
  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => fetchStore(storeId),
    enabled: !!storeId,
  });

  // get the store items from the api
  const {
    data: storeItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuery({
    queryKey: ["storeItems", storeId],
    queryFn: () => fetchStoreItems(storeId),
    enabled: !!storeId,
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!storeItems) return [];
    if (!searchQuery) return storeItems;
    return storeItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [storeItems, searchQuery]);

  // Add item to shopping list
  const addToShoppingList = (item: StoreItem) => {
    if (!shoppingList.find(listItem => listItem.id === item.id)) {
      setShoppingList(prev => [...prev, item]);
    }
  };

  // Remove item from shopping list
  const removeFromShoppingList = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  // Generate route by grouping items by category
  const generateRoute = () => {
    const groupedByCategory = shoppingList.reduce((acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = [];
      }
      acc[item.categoryId].push(item);
      return acc;
    }, {} as Record<string, StoreItem[]>);

    console.log("Route generated - Items grouped by category:", groupedByCategory);
    // For now, just log the grouped items. In the future, this could navigate to a route page
  };

  // show loading whilst we get the store data and items
  if (storeLoading || itemsLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // show an error if there's an error with store or items
  if (storeError || itemsError) {
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
            <p className="text-red-600">
              Error: {storeError?.message || itemsError?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // show an error if the store data is not found
  if (!store || !storeItems) {
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
    <div className="container mx-auto max-w-6xl p-6">
      {/* Header with back button and store name */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          Back to Store Picker
        </Button>
        <h1 className="text-2xl font-bold">{store.name} - Shopping List</h1>
        {shoppingList.length > 0 && (
          <Button onClick={generateRoute} className="bg-blue-600 hover:bg-blue-700">
            Generate Route ({shoppingList.length} items)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Available Items */}
        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery ? "No items found matching your search." : "No items available."}
                </p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      <Badge variant="secondary" className="mt-1">
                        Category: {item.categoryId}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToShoppingList(item)}
                      disabled={shoppingList.some(listItem => listItem.id === item.id)}
                      className="ml-2"
                    >
                      {shoppingList.some(listItem => listItem.id === item.id) ? "Added" : "Add"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right side - Shopping List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Shopping List ({shoppingList.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {shoppingList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your shopping list is empty. Add items from the left to get started!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {shoppingList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      <Badge variant="outline" className="mt-1">
                        {item.categoryId}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromShoppingList(item.id)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
