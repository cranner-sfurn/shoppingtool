"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Coordinates } from "./coordinates";

interface LocationContextType {
  location: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsLoading(false);
      return;
    }

    // attetmpt to get the location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = "Location access blocked";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access blocked";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000, // Update every second
      }
    );
  };

  useEffect(() => {
    updateLocation();

    // Update location every second
    const interval = setInterval(updateLocation, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LocationContext.Provider value={{ location, error, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

// Export for use in other components
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
