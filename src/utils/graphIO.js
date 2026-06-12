export function serializeGraph(nodes, edges, isDirected) {
  const data = {
    version: 1,
    isDirected,
    nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
    edges: edges.map(e => ({
      sourceId: e.source.id,
      targetId: e.target.id,
      weight: e.weight,
    })),
  };
  return JSON.stringify(data, null, 2);
}

export function deserializeGraph(jsonStr) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error("Missing 'nodes' array in graph data.");
  }
  if (!data.edges || !Array.isArray(data.edges)) {
    throw new Error("Missing 'edges' array in graph data.");
  }
  if (data.nodes.length === 0) {
    throw new Error("Graph must contain at least one node.");
  }

  const idSet = new Set(data.nodes.map(n => n.id));
  for (const e of data.edges) {
    if (!idSet.has(e.sourceId)) {
      throw new Error(`Edge references unknown source node id ${e.sourceId}.`);
    }
    if (!idSet.has(e.targetId)) {
      throw new Error(`Edge references unknown target node id ${e.targetId}.`);
    }
    if (e.weight === undefined || e.weight === null || typeof e.weight !== "number" || e.weight < 1) {
      throw new Error("Each edge must have a positive numeric weight.");
    }
  }

  return {
    version: data.version || 1,
    isDirected: !!data.isDirected,
    nodes: data.nodes,
    edges: data.edges,
  };
}
