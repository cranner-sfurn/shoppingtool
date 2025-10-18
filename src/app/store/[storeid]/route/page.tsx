"use client";

import type React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PathResultWithNodes } from "@/lib/types";
import StoreMapWithPath from "@/components/StoreMapWithPath";

export default function RoutePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeid as string;
  const [pathResult, setPathResult] = useState<PathResultWithNodes | null>(
    null
  );

  useEffect(() => {
    // Get path result from localStorage
    const storedPath = localStorage.getItem("pathResult");
    if (storedPath) {
      try {
        const parsed = JSON.parse(storedPath);
        setPathResult(parsed);
      } catch (error) {
        console.error("Error parsing path result:", error);
        // Redirect back to store page if no valid path data
        router.push(`/store/${storeId}`);
      }
    } else {
      // Redirect back to store page if no path data
      router.push(`/store/${storeId}`);
    }
  }, [storeId, router]);

  if (!pathResult) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/store/${storeId}`)}
            className="flex items-center gap-2"
          >
            ← Back to Store
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Path...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Calculating your optimal shopping path...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header with back button */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/store/${storeId}`)}
            className="flex items-center gap-2 text-sm"
          >
            ← Back to Store
          </Button>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Your Shopping Path
        </h1>
      </div>

      <div className="space-y-6">
        {/* Interactive Store Map */}
        <Card>
          <CardHeader>
            <CardTitle>Your Path</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreMapWithPath
              pathNodes={pathResult.pathNodes}
              mapImagePath="/sainsbury's mk.png"
            />
          </CardContent>
        </Card>

        {/* Route Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pathResult.pathNodes.map((node, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {node.name.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
