// ============================================================
// GLOBAL STATE & STYLING TOKENS
// ============================================================

export const NodeState = {
  UNVISITED: "UNVISITED",
  CURRENT: "CURRENT",
  VISITED: "VISITED",
  IN_PATH: "IN_PATH",
  SPECIAL: "SPECIAL", // Highlighted for queries (e.g. LCA, BST search result)
};

export const EdgeState = {
  NORMAL: "NORMAL",
  RELAXED: "RELAXED",
  IN_PATH: "IN_PATH",
  BRIDGE: "BRIDGE",
};

export const Colors = {
  bg: "#272727",
  grid: "#3a3a3a",
  edgeDrag: "rgba(255, 255, 255, 0.4)",
  node: {
    [NodeState.UNVISITED]: { fill: "#10b981", border: "#047857" },
    [NodeState.CURRENT]: { fill: "#f59e0b", border: "#b45309" },
    [NodeState.VISITED]: { fill: "#06b6d4", border: "#0891b2" },
    [NodeState.IN_PATH]: { fill: "#ef4444", border: "#b91c1c" },
    [NodeState.SPECIAL]: { fill: "#8b5cf6", border: "#6d28d9" }, // Purple for LCA / BST match
  },
  edge: {
    [EdgeState.NORMAL]: "#757575",
    [EdgeState.RELAXED]: "#f59e0b",
    [EdgeState.IN_PATH]: "#ef4444",
    [EdgeState.BRIDGE]: "#f43f5e", // Thick red-rose for bridges
  },
  // SCC component colors
  components: [
    "#ec4899", // pink
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#3b82f6", // blue
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#ef4444", // red
  ],
};

// ============================================================
// GRAPH DATA MODELS
// ============================================================

export class NodeModel {
  constructor(id, x, y) {
    this.id = id;
    this.label = id.toString();
    this.x = x;
    this.y = y;
    this.state = NodeState.UNVISITED;
    this.dfn = null; // Discovery time
    this.low = null; // Low value
    this.colorOverride = null; // Kosaraju SCC color
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= 484; // Radius 22 (22^2 = 484)
  }
}

let _edgeIdCounter = 0;

export class EdgeModel {
  constructor(source, target, weight, isDirected = false) {
    this.id = _edgeIdCounter++;
    this.source = source;
    this.target = target;
    this.weight = weight;
    this.state = EdgeState.NORMAL;
    this.isDirected = isDirected;
  }

  connects(n1, n2) {
    if (this.isDirected) {
      return this.source.id === n1.id && this.target.id === n2.id;
    }
    return (
      (this.source.id === n1.id && this.target.id === n2.id) ||
      (this.source.id === n2.id && this.target.id === n1.id)
    );
  }

  getOther(node) {
    if (this.source.id === node.id) return this.target;
    if (!this.isDirected && this.target.id === node.id) return this.source;
    return null;
  }

  getStrokeWidth() {
    switch (this.state) {
      case EdgeState.RELAXED:
        return 3.2;
      case EdgeState.IN_PATH:
      case EdgeState.BRIDGE:
        return 4.8;
      default:
        return 2.0;
    }
  }
}

export class GraphModel {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.nextId = 0;
  }

  addNode(x, y) {
    const node = new NodeModel(this.nextId++, x, y);
    this.nodes.push(node);
    return node;
  }

  addEdge(n1, n2, weight, isDirected = false) {
    if (n1.id === n2.id) return null;
    for (const edge of this.edges) {
      if (edge.source.id === n1.id && edge.target.id === n2.id) return null;
      if (!isDirected && edge.source.id === n2.id && edge.target.id === n1.id) return null;
    }
    const edge = new EdgeModel(n1, n2, weight, isDirected);
    this.edges.push(edge);
    return edge;
  }

  removeNode(node) {
    this.edges = this.edges.filter(
      (e) => e.source.id !== node.id && e.target.id !== node.id
    );
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
  }

  getNeighbors(node) {
    const neighbors = [];
    for (const edge of this.edges) {
      const other = edge.getOther(node);
      if (other) {
        neighbors.push({ node: other, weight: edge.weight, edge });
      }
    }
    return neighbors;
  }

  getEdge(n1, n2) {
    for (const edge of this.edges) {
      if (edge.connects(n1, n2)) return edge;
    }
    return null;
  }

  getNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      if (this.nodes[i].contains(x, y)) return this.nodes[i];
    }
    return null;
  }

  resetStates() {
    for (const node of this.nodes) {
      node.state = NodeState.UNVISITED;
      node.dfn = null;
      node.low = null;
      node.colorOverride = null;
    }
    for (const edge of this.edges) edge.state = EdgeState.NORMAL;
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.nextId = 0;
  }

  generateRandom(nodeCount, width, height, isDirected = false) {
    this.clear();
    const maxX = width - 120;
    const maxY = height - 120;

    for (let i = 0; i < nodeCount; i++) {
      let x, y, tooClose;
      let attempts = 0;
      do {
        x = 60 + Math.random() * maxX;
        y = 60 + Math.random() * maxY;
        tooClose = false;
        for (const node of this.nodes) {
          const dx = node.x - x;
          const dy = node.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < 75) {
            tooClose = true;
            break;
          }
        }
        attempts++;
      } while (tooClose && attempts < 100);
      this.addNode(x, y);
    }

    if (this.nodes.length === 0) return;

    // Ensure connectivity
    const connected = [];
    const remaining = [...this.nodes];
    remaining.sort(() => Math.random() - 0.5);
    connected.push(remaining.shift());

    while (remaining.length > 0) {
      const node = remaining.shift();
      const randConnected = connected[Math.floor(Math.random() * connected.length)];
      const weight = 1 + Math.floor(Math.random() * 20);
      this.addEdge(randConnected, node, weight, isDirected);
      connected.push(node);
    }

    // Additional edges
    const additional = Math.floor(nodeCount / 2) + Math.floor(Math.random() * nodeCount);
    for (let i = 0; i < additional; i++) {
      const n1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const n2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      if (n1.id !== n2.id && this.getEdge(n1, n2) === null) {
        const weight = 1 + Math.floor(Math.random() * 20);
        this.addEdge(n1, n2, weight, isDirected);
      }
    }
  }
}
