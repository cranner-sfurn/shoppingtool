export type UUID = string;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Store {
  id: UUID;
  name: string;
  location: Coordinates;
}

interface StoreItem {
  id: UUID;
  storeId: UUID;
  name: string;
  asile?: string;
  location: Coordinates;
}

interface ShoppingList {
  storeId: UUID;
  items: Pick<StoreItem, "id" | "name" | "asile" | "location">[];
}
