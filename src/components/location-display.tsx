"use client";

import { useLocation } from "@/lib/location-context";

export default function LocationDisplay() {
  const { location, error, isLoading } = useLocation();

  if (isLoading) {
    return (
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Getting location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mb-4">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Location not available</p>
      </div>
    );
  }

  return (
    <div className="text-center mb-4">
      <p className="text-sm text-gray-600">
        Current Location: {location.latitude}, {location.longitude}
      </p>
    </div>
  );
}
