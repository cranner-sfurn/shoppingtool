export interface StoreApiResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  adjacencyList: string;
}

export type StoresApiResponse = StoreApiResponse[];
