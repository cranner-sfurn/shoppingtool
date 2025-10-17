export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two coordinates, returns distance in meters
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert meters to miles
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

// Calculate distance in miles between two coordinates
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distanceInMeters = calculateDistance(lat1, lon1, lat2, lon2);
  return metersToMiles(distanceInMeters);
}
