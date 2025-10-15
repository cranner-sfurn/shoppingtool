// Graph/pathfinding utilities for computing a minimal route visiting required nodes

// ----- Types -----
export interface WeightedEdge {
  neighbor: string;
  weight: number; // non-negative weight
}

export type AdjacencyList = { [node: string]: WeightedEdge[] };

export interface DijkstraResult {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
}

export interface PairwisePathInfo {
  distance: number;
  path: string[]; // inclusive of endpoints
}

export type PairwiseShortestPaths = Record<string, Record<string, PairwisePathInfo | null>>;

export interface TspSolution {
  order: string[]; // order over target nodes (and optional fixed endpoints at ends)
  cost: number;
}

export interface SolveShortestVisitingRouteOptions {
  graph: AdjacencyList;
  required: string[]; // nodes to visit at least once
  start?: string; // optional fixed start
  end?: string; // optional fixed end
}

export interface SolveShortestVisitingRouteResult {
  totalCost: number;
  route: string[]; // full route including intermediate nodes along shortest paths
}

// ----- Dijkstra -----
export function dijkstra(graph: AdjacencyList, start: string): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: Set<string> = new Set();

  for (const node of Object.keys(graph)) {
    distances[node] = Number.POSITIVE_INFINITY;
    previous[node] = null;
  }
  if (!(start in graph)) {
    // Allow start not in graph by treating as isolated
    distances[start] = 0;
    previous[start] = null;
  } else {
    distances[start] = 0;
  }

  // Simple O(V^2 + E) Dijkstra with array min-extraction (OK for small graphs)
  while (true) {
    let current: string | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const node of Object.keys(distances)) {
      if (!visited.has(node) && distances[node] < best) {
        best = distances[node];
        current = node;
      }
    }
    if (current === null || best === Number.POSITIVE_INFINITY) break;
    visited.add(current);

    const neighbors = graph[current] ?? [];
    for (const { neighbor, weight } of neighbors) {
      if (weight < 0) continue; // skip negative edges for safety
      const alt = distances[current] + weight;
      if (alt < (distances[neighbor] ?? Number.POSITIVE_INFINITY)) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
      }
    }
  }

  return { distances, previous };
}

export function reconstructPath(previous: Record<string, string | null>, start: string, end: string): string[] | null {
  if (start === end) return [start];
  if (!(end in previous) || previous[end] === undefined) return null;
  const path: string[] = [];
  let curr: string | null | undefined = end;
  while (curr != null) {
    path.push(curr);
    if (curr === start) break;
    curr = previous[curr];
  }
  if (path[path.length - 1] !== start) return null;
  path.reverse();
  return path;
}

// ----- Pairwise shortest paths between target nodes -----
export function getShortestPathsBetweenTargets(
  graph: AdjacencyList,
  targets: string[]
): PairwiseShortestPaths {
  const result: PairwiseShortestPaths = {};
  for (const a of targets) {
    result[a] = {} as Record<string, PairwisePathInfo | null>;
  }

  for (const a of targets) {
    const { distances, previous } = dijkstra(graph, a);
    for (const b of targets) {
      if (a === b) {
        result[a][b] = { distance: 0, path: [a] };
        continue;
      }
      const path = reconstructPath(previous, a, b);
      if (!path) {
        result[a][b] = null;
      } else {
        result[a][b] = { distance: distances[b] ?? Number.POSITIVE_INFINITY, path };
      }
    }
  }

  return result;
}

// ----- TSP / Hamiltonian path solver (Held-Karp DP) -----
// If start and end are both specified and distinct: Hamiltonian path from start to end visiting all others
// If only start specified: path starting at start, ending anywhere minimal
// If only end specified: path ending at end, starting anywhere minimal
// If neither specified: cycle (TSP) with minimal cost; we will return the best path (not repeating the start at the end)
export function solveTSP(
  matrix: PairwiseShortestPaths,
  targets: string[],
  start?: string,
  end?: string
): TspSolution | null {
  // Validate availability
  for (const i of targets) {
    for (const j of targets) {
      if (i === j) continue;
      if (!matrix[i] || !(j in matrix[i]) || matrix[i][j] === null) {
        return null; // unreachable pair
      }
    }
  }

  const n = targets.length;
  if (n === 0) return { order: [], cost: 0 };
  if (n === 1) return { order: [targets[0]], cost: 0 };

  const indexOf: Record<string, number> = {};
  targets.forEach((t, idx) => (indexOf[t] = idx));

  const startIdx = start ? indexOf[start] : 0;
  const endIdx = end ? indexOf[end] : undefined;

  // DP over subsets: dp[mask][j] = minimal cost to reach j with visited set mask
  const size = 1 << n;
  const dp: number[][] = Array.from({ length: size }, () => Array(n).fill(Number.POSITIVE_INFINITY));
  const parent: number[][] = Array.from({ length: size }, () => Array(n).fill(-1));

  // Initialize
  if (startIdx !== undefined) {
    const mask = 1 << startIdx;
    dp[mask][startIdx] = 0;
  } else {
    // Any start allowed
    for (let i = 0; i < n; i++) {
      const mask = 1 << i;
      dp[mask][i] = 0;
    }
  }

  for (let mask = 0; mask < size; mask++) {
    for (let j = 0; j < n; j++) {
      const costToJ = dp[mask][j];
      if (costToJ === Number.POSITIVE_INFINITY) continue;
      for (let k = 0; k < n; k++) {
        if (mask & (1 << k)) continue; // already visited
        const from = targets[j];
        const to = targets[k];
        const edge = matrix[from][to]!;
        const nextMask = mask | (1 << k);
        const newCost = costToJ + edge.distance;
        if (newCost < dp[nextMask][k]) {
          dp[nextMask][k] = newCost;
          parent[nextMask][k] = j;
        }
      }
    }
  }

  const fullMask = size - 1;
  let bestCost = Number.POSITIVE_INFINITY;
  let bestEnd = -1;

  if (endIdx !== undefined) {
    bestCost = dp[fullMask][endIdx];
    bestEnd = endIdx;
    if (bestCost === Number.POSITIVE_INFINITY) return null;
  } else {
    for (let j = 0; j < n; j++) {
      const cost = dp[fullMask][j];
      if (cost < bestCost) {
        bestCost = cost;
        bestEnd = j;
      }
    }
    if (bestEnd === -1) return null;
  }

  // Reconstruct order
  let mask = fullMask;
  let curr = bestEnd;
  const orderIdx: number[] = [];
  while (curr !== -1) {
    orderIdx.push(curr);
    const prev = parent[mask][curr];
    if (prev === -1) break;
    mask = mask & ~(1 << curr);
    curr = prev;
  }
  orderIdx.reverse();

  const order = orderIdx.map(i => targets[i]);

  return { order, cost: bestCost };
}

// ----- Full path reconstruction -----
export function reconstructFullPath(
  matrix: PairwiseShortestPaths,
  order: string[]
): { route: string[]; totalCost: number } {
  if (order.length === 0) return { route: [], totalCost: 0 };
  let totalCost = 0;
  const route: string[] = [order[0]];
  for (let i = 0; i < order.length - 1; i++) {
    const from = order[i];
    const to = order[i + 1];
    const info = matrix[from][to];
    if (!info) {
      throw new Error(`No path between required nodes: ${from} -> ${to}`);
    }
    totalCost += info.distance;
    // concatenate without repeating the starting node
    for (let j = 1; j < info.path.length; j++) {
      route.push(info.path[j]);
    }
  }
  return { route, totalCost };
}

// ----- Orchestration helper -----
export function solveShortestVisitingRoute(opts: SolveShortestVisitingRouteOptions): SolveShortestVisitingRouteResult | null {
  const { graph } = opts;
  const required = Array.from(new Set(opts.required));
  if (required.length === 0) return { totalCost: 0, route: [] };

  // If start/end provided but not in required, include them as mandatory waypoints at ends
  const targets: string[] = (() => {
    const list = [...required];
    if (opts.start && !list.includes(opts.start)) list.unshift(opts.start);
    if (opts.end && !list.includes(opts.end)) list.push(opts.end);
    return list;
  })();

  const pairwise = getShortestPathsBetweenTargets(graph, targets);
  const tsp = solveTSP(pairwise, targets, opts.start, opts.end);
  if (!tsp) return null;
  const { route, totalCost } = reconstructFullPath(pairwise, tsp.order);
  return { totalCost, route };
}


