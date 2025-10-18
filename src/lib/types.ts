// Types for store items
export interface StoreItem {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
}

// Types for graph data
export interface Node {
  id: string;
  name: string;
  isCategory: boolean;
  storeId: string;
  x?: number; // percentage (0-100) from left edge of map
  y?: number; // percentage (0-100) from top edge of map
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  weight: number;
  storeId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  nodeId: string | null;
}

export interface PathResult {
  totalCost: number;
  path: string[]; // node names in order
}

export interface PathResultWithNodes {
  totalCost: number;
  pathNodes: Node[]; // full node objects with coordinates
}
