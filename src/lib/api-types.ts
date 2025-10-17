export interface StoreApiResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  adjacencyList: string;
}

export type StoresApiResponse = StoreApiResponse[];

export interface StoreItemApiResponse {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
}

export type StoreItemsApiResponse = StoreItemApiResponse[];
