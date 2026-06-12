export function validateGraph(nodes, edges, algorithm) {
  const warnings = [];

  if (nodes.length === 0) {
    return { valid: false, message: "Graph is empty. Create some nodes first." };
  }

  if (nodes.length < 2 && algorithm !== "dfs" && algorithm !== "bfs") {
    return { valid: false, message: "Need at least 2 nodes for this algorithm." };
  }

  const adjacency = new Map();
  for (const n of nodes) adjacency.set(n.id, []);
  for (const e of edges) {
    if (adjacency.has(e.source.id)) adjacency.get(e.source.id).push(e.target.id);
    if (!e.isDirected && adjacency.has(e.target.id)) adjacency.get(e.target.id).push(e.source.id);
  }

  const visited = new Set();
  const stack = [nodes[0].id];
  visited.add(nodes[0].id);
  while (stack.length > 0) {
    const curr = stack.pop();
    for (const neighbor of adjacency.get(curr) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }

  const isDisconnected = visited.size < nodes.length;
  if (isDisconnected) {
    warnings.push("Graph is disconnected — algorithm will only run on the component containing the start node.");
  }

  if (algorithm === "topo" || algorithm === "cycle") {
    const hasCycle = detectCycle(nodes, edges);
    if (algorithm === "topo" && hasCycle) {
      return { valid: false, message: "Cycle detected! Topological sort requires a Directed Acyclic Graph." };
    }
    if (algorithm === "cycle") {
      warnings.push(hasCycle ? "Cycle detected in graph." : "No cycles found — graph is acyclic.");
    }
  }

  if (algorithm === "bellman") {
    const negativeEdges = edges.filter(e => e.weight < 0);
    if (negativeEdges.length > 0) {
      warnings.push("Graph contains negative edges — Bellman-Ford will detect negative cycles.");
    }
  }

  if (algorithm === "dijkstra") {
    const negativeEdges = edges.filter(e => e.weight < 0);
    if (negativeEdges.length > 0) {
      return { valid: false, message: "Dijkstra cannot handle negative edge weights. Use Bellman-Ford." };
    }
  }

  if (edges.length === 0) {
    warnings.push("Graph has no edges. Add connections between nodes.");
  }

  return { valid: true, message: warnings.join(" ") || null, warnings };
}

function detectCycle(nodes, edges) {
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    if (adj.has(e.source.id)) adj.get(e.source.id).push(e.target.id);
    if (!e.isDirected && adj.has(e.target.id)) adj.get(e.target.id).push(e.source.id);
  }

  const visited = new Set();
  const inStack = new Set();

  function dfs(u) {
    visited.add(u);
    inStack.add(u);
    for (const v of adj.get(u) || []) {
      if (!visited.has(v)) {
        if (dfs(v)) return true;
      } else if (inStack.has(v)) {
        return true;
      }
    }
    inStack.delete(u);
    return false;
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (dfs(n.id)) return true;
    }
  }
  return false;
}
