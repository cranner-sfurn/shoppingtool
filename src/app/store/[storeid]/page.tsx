"use client";

import type React from "react";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import type { StoreApiResponse } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StoreItem } from "@/lib/types";
import { calculateShoppingRoute } from "@/lib/route-utils";

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

  // State for shopping list, search, and category filter
  const [shoppingList, setShoppingList] = useState<StoreItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

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

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!storeItems) return [];
    const uniqueCategories = Array.from(
      new Set(storeItems.map((item) => item.categoryName))
    ).sort();
    return uniqueCategories;
  }, [storeItems]);

  // Filter items based on search query and category
  const filteredItems = useMemo(() => {
    if (!storeItems) return [];

    let filtered = storeItems;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.categoryName === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [storeItems, searchQuery, selectedCategory]);

  // Add item to shopping list
  const addToShoppingList = (item: StoreItem) => {
    if (!shoppingList.find((listItem) => listItem.id === item.id)) {
      setShoppingList((prev) => [...prev, item]);
    }
  };

  // Remove item from shopping list
  const removeFromShoppingList = (itemId: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Generate route by calculating shortest path
  const generateRoute = async () => {
    if (shoppingList.length === 0) return;

    setIsCalculatingRoute(true);
    try {
      const routeResult = await calculateShoppingRoute(storeId, shoppingList);

      // Store route result in localStorage and navigate to route page
      localStorage.setItem("routeResult", JSON.stringify(routeResult));
      router.push(`/store/${storeId}/route`);
    } catch (error) {
      console.error("Error calculating route:", error);
      // TODO: Show error message to user
    } finally {
      setIsCalculatingRoute(false);
    }
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
            className="flex items-center gap-2 text-sm"
          >
            ← Back
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
    <div className="container mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header with back button and store name */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm"
          >
            ← Back
          </Button>
          {shoppingList.length > 0 && (
            <Button
              onClick={generateRoute}
              className="text-sm"
              disabled={isCalculatingRoute}
            >
              {isCalculatingRoute
                ? "Calculating..."
                : `Get path (${shoppingList.length})`}
            </Button>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          {store.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left side - Available Items */}
        <Card className="flex flex-col max-h-[calc(100vh-12rem)]">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Available Items</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3 flex-shrink-0">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Search Items
                </label>
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="text-base" // Prevents zoom on iOS
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filter by Category
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs px-3 py-1 min-h-[32px] touch-manipulation flex-shrink-0"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs px-3 py-1 min-h-[32px] touch-manipulation flex-shrink-0 whitespace-nowrap"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
              {filteredItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "No items found matching your filters."
                    : "No items available."}
                </p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                          {item.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.categoryName}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToShoppingList(item)}
                      disabled={shoppingList.some(
                        (listItem) => listItem.id === item.id
                      )}
                      className="flex-shrink-0 min-h-[36px] px-3 touch-manipulation"
                    >
                      {shoppingList.some((listItem) => listItem.id === item.id)
                        ? "Added"
                        : "Add"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right side - Shopping List */}
        <Card className="flex flex-col max-h-[calc(100vh-12rem)]">
          <CardHeader className="flex-shrink-0">
            <CardTitle>
              Your Shopping List ({shoppingList.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {shoppingList.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-center text-sm sm:text-base">
                  Your shopping list is empty. Add items from the left to get
                  started!
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                {shoppingList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 sm:p-4 border rounded-lg touch-manipulation"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                          {item.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.categoryName}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromShoppingList(item.id)}
                      className="flex-shrink-0 min-h-[36px] px-3 touch-manipulation"
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
