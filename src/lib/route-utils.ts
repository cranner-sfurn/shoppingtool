import type { AdjacencyList } from "./pathfinding";
import { solveShortestVisitingRoute } from "./pathfinding";
import type {
  Node,
  NodeConnection,
  Category,
  StoreItem,
  RouteResultWithNodes,
} from "./types";

// Fetch nodes for a store
export async function fetchNodes(storeId: string): Promise<Node[]> {
  const response = await fetch(`/api/stores/${storeId}/nodes`);
  if (!response.ok) {
    throw new Error("Failed to fetch nodes");
  }
  return response.json();
}

// Fetch node connections for a store
export async function fetchConnections(
  storeId: string
): Promise<NodeConnection[]> {
  const response = await fetch(`/api/stores/${storeId}/connections`);
  if (!response.ok) {
    throw new Error("Failed to fetch connections");
  }
  return response.json();
}

// Fetch categories for a store
export async function fetchCategories(storeId: string): Promise<Category[]> {
  const response = await fetch(`/api/stores/${storeId}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

// Build adjacency list from node connections
export function buildAdjacencyList(
  connections: NodeConnection[]
): AdjacencyList {
  const adjacencyList: AdjacencyList = {};

  for (const connection of connections) {
    if (!adjacencyList[connection.fromNodeId]) {
      adjacencyList[connection.fromNodeId] = [];
    }
    adjacencyList[connection.fromNodeId].push({
      neighbor: connection.toNodeId,
      weight: connection.weight,
    });
  }

  return adjacencyList;
}

// Map category IDs to their corresponding node IDs
export function getCategoryNodeIds(
  categories: Category[],
  categoryIds: string[]
): string[] {
  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    if (category.nodeId) {
      categoryMap.set(category.id, category.nodeId);
    }
  }

  const nodeIds: string[] = [];
  for (const categoryId of categoryIds) {
    const nodeId = categoryMap.get(categoryId);
    if (nodeId) {
      nodeIds.push(nodeId);
    }
  }

  return nodeIds;
}

// Find entrance and checkout nodes
export function findSpecialNodes(nodes: Node[]): {
  entrance?: string;
  checkout?: string;
} {
  const entrance = nodes.find((node) => node.name === "entrance")?.id;
  const checkout = nodes.find((node) => node.name === "checkout")?.id;

  return { entrance, checkout };
}

// Calculate the optimal shopping route
export async function calculateShoppingRoute(
  storeId: string,
  shoppingList: StoreItem[]
): Promise<RouteResultWithNodes> {
  // Fetch all required data
  const [nodes, connections, categories] = await Promise.all([
    fetchNodes(storeId),
    fetchConnections(storeId),
    fetchCategories(storeId),
  ]);

  // Extract unique category IDs from shopping list
  const categoryIds = Array.from(
    new Set(shoppingList.map((item) => item.categoryId))
  );

  // Map category IDs to node IDs
  const categoryNodeIds = getCategoryNodeIds(categories, categoryIds);

  // Find entrance and checkout nodes
  const { entrance, checkout } = findSpecialNodes(nodes);

  if (!entrance || !checkout) {
    throw new Error("Entrance or checkout node not found");
  }

  // Build adjacency list
  const adjacencyList = buildAdjacencyList(connections);

  // Calculate the route using the pathfinding algorithm
  const result = solveShortestVisitingRoute({
    graph: adjacencyList,
    required: categoryNodeIds,
    start: entrance,
    end: checkout,
  });

  if (!result) {
    throw new Error("No valid route found");
  }

  // Get full node objects for the route
  const routeNodes = result.route.map((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    return node;
  });

  return {
    totalCost: result.totalCost,
    routeNodes: routeNodes,
  };
}
