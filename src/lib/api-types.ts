export interface StoreApiResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type StoresApiResponse = StoreApiResponse[];
