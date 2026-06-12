export const ALGO_COMPLEXITY = {
  // Graph algorithms
  dfs: { time: "O(V + E)", space: "O(V)" },
  bfs: { time: "O(V + E)", space: "O(V)" },
  dijkstra: { time: "O((V + E) log V)", space: "O(V)" },
  bellman: { time: "O(V × E)", space: "O(V)" },
  topo: { time: "O(V + E)", space: "O(V)" },
  cycle: { time: "O(V + E)", space: "O(V)" },
  dsu: { time: "O(α(V))", space: "O(V)" },
  "mst-kruskal": { time: "O(E log E)", space: "O(V + E)" },
  "mst-prim": { time: "O(E log V)", space: "O(V)" },
  scc: { time: "O(V + E)", space: "O(V + E)" },
  bridges: { time: "O(V + E)", space: "O(V)" },

  // Tree algorithms
  traversals: { time: "O(N)", space: "O(H)" },
  "tree-bfs": { time: "O(N)", space: "O(W)" },
  height: { time: "O(N)", space: "O(H)" },
  lca: { time: "O(N)", space: "O(H)" },
  pathsum: { time: "O(N)", space: "O(H)" },
  lifting: { time: "O(N log N) / O(log N)", space: "O(N log N)" },
  search: { time: "O(H)", space: "O(1)" },
  insert: { time: "O(H)", space: "O(1)" },
  delete: { time: "O(H)", space: "O(H)" },
};

export function getComplexity(id) {
  return ALGO_COMPLEXITY[id] || null;
}
