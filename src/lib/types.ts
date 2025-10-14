export type UUID = string;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Store {
  id: UUID;
  name: string;
  location: Coordinates;
}

export interface StoreAisle {
  id: UUID;
  storeId: UUID;
  start: Coordinates; // Northernmost point
  end: Coordinates;
}

interface StoreItem {
  id: UUID;
  storeId: UUID;
  aisleId: UUID;
  name: string;
}

export interface ShoppingList {
  id: UUID;
  items: Pick<StoreItem, "id" | "name" | "aisleId">[];
}
