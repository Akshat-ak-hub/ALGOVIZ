import { NodeState, EdgeState, Colors } from "../models/GraphModel";

// ============================================================
// GRAPH ALGORITHM TIMELINE BUILDERS
// ============================================================

export function runGraphDFS(nodes, edges, isDirected, startNode) {
  const steps = [];
  const visited = new Set();
  const stack = [];
  const traversedEdges = new Set();

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, edge: e });
    if (!isDirected) {
      adj[e.target.id].push({ target: e.source, edge: e });
    }
  }

  steps.push({
    description: `Initialize DFS: Starting from Node ${startNode.label}. Push to stack.`,
    currentNode: startNode,
    visited: new Set(visited),
    frontier: [startNode.id],
    traversedEdges: new Set(),
  });

  stack.push(startNode);

  while (stack.length > 0) {
    const curr = stack.pop();

    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    steps.push({
      description: `Pop Node ${curr.label} from stack and visit it.`,
      currentNode: curr,
      visited: new Set(visited),
      frontier: stack.map((n) => n.id),
      traversedEdges: new Set(traversedEdges),
    });

    // Add neighbors in reverse order to explore left neighbors first
    const neighbors = [...adj[curr.id]].reverse();
    for (const item of neighbors) {
      const neighbor = item.target;
      if (!visited.has(neighbor.id)) {
        stack.push(neighbor);
        traversedEdges.add(item.edge.id);

        steps.push({
          description: `Discovered unvisited neighbor Node ${neighbor.label}. Push to stack.`,
          currentNode: curr,
          visited: new Set(visited),
          frontier: stack.map((n) => n.id),
          traversedEdges: new Set(traversedEdges),
        });
      }
    }
  }

  steps.push({
    description: `DFS traversal completed. All reachable nodes visited.`,
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    traversedEdges: new Set(traversedEdges),
  });

  return steps;
}

export function runGraphBFS(nodes, edges, isDirected, startNode) {
  const steps = [];
  const visited = new Set();
  const queue = [];
  const traversedEdges = new Set();

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, edge: e });
    if (!isDirected) {
      adj[e.target.id].push({ target: e.source, edge: e });
    }
  }

  visited.add(startNode.id);
  queue.push(startNode);

  steps.push({
    description: `Initialize BFS: Enqueue root Node ${startNode.label} and mark as visited.`,
    currentNode: startNode,
    visited: new Set(visited),
    frontier: queue.map((n) => n.id),
    traversedEdges: new Set(),
  });

  while (queue.length > 0) {
    const curr = queue.shift();

    steps.push({
      description: `Dequeue Node ${curr.label} and expand search.`,
      currentNode: curr,
      visited: new Set(visited),
      frontier: queue.map((n) => n.id),
      traversedEdges: new Set(traversedEdges),
    });

    const neighbors = adj[curr.id];
    for (const item of neighbors) {
      const neighbor = item.target;
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
        traversedEdges.add(item.edge.id);

        steps.push({
          description: `Discover unvisited Node ${neighbor.label}. Mark visited and enqueue.`,
          currentNode: curr,
          visited: new Set(visited),
          frontier: queue.map((n) => n.id),
          traversedEdges: new Set(traversedEdges),
        });
      }
    }
  }

  steps.push({
    description: "BFS complete.",
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    traversedEdges: new Set(traversedEdges),
  });

  return steps;
}

export function runGraphTopo(nodes, edges, startNode) {
  const steps = [];
  const inDegree = new Map();
  const adj = {};

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj[n.id] = [];
  }

  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, edge: e });
    inDegree.set(e.target.id, inDegree.get(e.target.id) + 1);
  }

  const queue = [];
  const order = [];
  const traversedEdges = new Set();
  const visited = new Set();

  steps.push({
    description: "Compute in-degrees for all nodes in the DAG.",
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    inDegree: new Map(inDegree),
    order: [],
  });

  for (const n of nodes) {
    if (inDegree.get(n.id) === 0) {
      queue.push(n);
    }
  }

  steps.push({
    description: `Enqueue nodes with in-degree = 0: [${queue.map((n) => n.label).join(", ")}]`,
    currentNode: null,
    visited: new Set(visited),
    frontier: queue.map((n) => n.id),
    inDegree: new Map(inDegree),
    order: [],
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    order.push(curr.label);
    visited.add(curr.id);

    steps.push({
      description: `Process Node ${curr.label}. Append to topological order: [${order.join(" → ")}]`,
      currentNode: curr,
      visited: new Set(visited),
      frontier: queue.map((n) => n.id),
      inDegree: new Map(inDegree),
      order: [...order],
    });

    for (const item of adj[curr.id]) {
      const neighbor = item.target;
      traversedEdges.add(item.edge.id);
      const oldIn = inDegree.get(neighbor.id);
      const newIn = oldIn - 1;
      inDegree.set(neighbor.id, newIn);

      steps.push({
        description: `Decrement in-degree of Node ${neighbor.label} (${oldIn} → ${newIn}).`,
        currentNode: curr,
        visited: new Set(visited),
        frontier: queue.map((n) => n.id),
        inDegree: new Map(inDegree),
        order: [...order],
      });

      if (newIn === 0) {
        queue.push(neighbor);
        steps.push({
          description: `Node ${neighbor.label} in-degree is 0. Enqueue.`,
          currentNode: curr,
          visited: new Set(visited),
          frontier: queue.map((n) => n.id),
          inDegree: new Map(inDegree),
          order: [...order],
        });
      }
    }
  }

  const hasCycle = order.length < nodes.length;
  const desc = hasCycle
    ? "Topological sort complete. Cycle detected! Topological sort is only possible on DAGs."
    : `Topological sort completed successfully! Order: [${order.join(" → ")}]`;

  steps.push({
    description: desc,
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    order: [...order],
    cycleDetected: hasCycle,
  });

  return steps;
}

export function runGraphCycleDetection(nodes, edges, isDirected) {
  const steps = [];
  const visited = new Set();
  const recStack = new Set(); // Rec stack for directed cycle checks
  const cycleEdges = new Set();
  const parentMap = new Map();

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, edge: e });
    if (!isDirected) {
      adj[e.target.id].push({ target: e.source, edge: e });
    }
  }

  let cycleFound = false;

  const dfs = (node, parent) => {
    if (cycleFound) return;

    visited.add(node.id);
    if (isDirected) recStack.add(node.id);

    steps.push({
      description: `DFS Visit Node ${node.label}. Current Path stack: [${[...recStack]
        .map((id) => nodes.find((n) => n.id === id).label)
        .join(" → ")}]`,
      currentNode: node,
      visited: new Set(visited),
      frontier: isDirected ? [...recStack] : [],
      cycleEdges: new Set(cycleEdges),
    });

    for (const item of adj[node.id]) {
      const neighbor = item.target;

      if (isDirected) {
        if (recStack.has(neighbor.id)) {
          cycleFound = true;
          cycleEdges.add(item.edge.id);
          steps.push({
            description: `Directed Cycle Detected! Node ${node.label} points back to Node ${neighbor.label} which is on recursion stack.`,
            currentNode: node,
            visited: new Set(visited),
            frontier: [...recStack],
            cycleEdges: new Set(cycleEdges),
            cycleFound: true,
          });
          return;
        }

        if (!visited.has(neighbor.id)) {
          dfs(neighbor, node);
        }
      } else {
        // Undirected Cycle check
        if (!visited.has(neighbor.id)) {
          parentMap.set(neighbor.id, node.id);
          dfs(neighbor, node);
        } else if (neighbor.id !== parent?.id) {
          cycleFound = true;
          cycleEdges.add(item.edge.id);
          steps.push({
            description: `Undirected Cycle Detected! Node ${node.label} connects to visited Node ${neighbor.label} (excluding direct parent).`,
            currentNode: node,
            visited: new Set(visited),
            frontier: [],
            cycleEdges: new Set(cycleEdges),
            cycleFound: true,
          });
          return;
        }
      }
    }

    if (isDirected) recStack.delete(node.id);
  };

  steps.push({
    description: "Start cycle detection scan across all disconnected components.",
    currentNode: null,
    visited: new Set(),
    frontier: [],
    cycleEdges: new Set(),
  });

  for (const n of nodes) {
    if (!visited.has(n.id) && !cycleFound) {
      dfs(n, null);
    }
  }

  if (!cycleFound) {
    steps.push({
      description: "Cycle scan completed. Graph is acyclic (no cycles found).",
      currentNode: null,
      visited: new Set(visited),
      frontier: [],
      cycleEdges: new Set(),
      cycleFound: false,
    });
  }

  return steps;
}

export function runGraphDSU(nodes, edges) {
  const steps = [];
  const parent = new Map();
  const rank = new Map();

  for (const n of nodes) {
    parent.set(n.id, n.id);
    rank.set(n.id, 0);
  }

  const getDSUTables = () => {
    const table = [];
    for (const n of nodes) {
      table.push({
        nodeVal: n.label,
        nodeId: n.id,
        pVal: nodes.find((fn) => fn.id === parent.get(n.id)).label,
        rankVal: rank.get(n.id),
      });
    }
    return table;
  };

  steps.push({
    description: "DSU Initialization: MakeSet operation for each node (parent pointing to self, rank = 0).",
    currentNode: null,
    visited: new Set(),
    frontier: [],
    dsuTable: getDSUTables(),
  });

  const find = (i) => {
    let path = [];
    let curr = i;
    while (parent.get(curr) !== curr) {
      path.push(curr);
      curr = parent.get(curr);
    }
    // Path compression
    for (const nodeId of path) {
      parent.set(nodeId, curr);
    }
    return curr;
  };

  const union = (x, y, edge) => {
    const rootX = find(x);
    const rootY = find(y);

    const xNode = nodes.find((n) => n.id === x);
    const yNode = nodes.find((n) => n.id === y);
    const rxNode = nodes.find((n) => n.id === rootX);
    const ryNode = nodes.find((n) => n.id === rootY);

    steps.push({
      description: `DSU Union request on Edge (${xNode.label}-${yNode.label}). Find(${xNode.label}) = Root ${rxNode.label}. Find(${yNode.label}) = Root ${ryNode.label}.`,
      currentNode: xNode,
      visited: new Set(),
      frontier: [],
      dsuTable: getDSUTables(),
    });

    if (rootX !== rootY) {
      if (rank.get(rootX) < rank.get(rootY)) {
        parent.set(rootX, rootY);
      } else if (rank.get(rootX) > rank.get(rootY)) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rank.get(rootX) + 1);
      }

      edge.state = EdgeState.IN_PATH;

      steps.push({
        description: `Roots differ. Union completed: Merge set representative ${rxNode.label} and ${ryNode.label}. Edge added to tree.`,
        currentNode: rxNode,
        visited: new Set(),
        frontier: [],
        dsuTable: getDSUTables(),
      });
    } else {
      steps.push({
        description: `Roots match (${rxNode.label} = ${ryNode.label}). Sets are already merged. Skip edge (prevents cycle).`,
        currentNode: rxNode,
        visited: new Set(),
        frontier: [],
        dsuTable: getDSUTables(),
      });
    }
  };

  // Perform random Unions on edges to visualize
  for (const edge of edges) {
    union(edge.source.id, edge.target.id, edge);
  }

  steps.push({
    description: "DSU visualizer routine completed. DSU Parent references mapped above.",
    currentNode: null,
    visited: new Set(),
    frontier: [],
    dsuTable: getDSUTables(),
  });

  return steps;
}

export function runGraphMSTKruskal(nodes, edges) {
  const steps = [];
  const parent = new Map();
  const rank = new Map();

  for (const n of nodes) {
    parent.set(n.id, n.id);
    rank.set(n.id, 0);
  }

  const find = (i) => {
    while (parent.get(i) !== i) {
      i = parent.get(i);
    }
    return i;
  };

  const unionSets = (rootX, rootY) => {
    if (rank.get(rootX) < rank.get(rootY)) {
      parent.set(rootX, rootY);
    } else if (rank.get(rootX) > rank.get(rootY)) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rank.get(rootX) + 1);
    }
  };

  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const mstEdges = new Set();
  let edgeIndex = 0;

  const edgeWeightsList = sortedEdges.map((e) => `${e.source.label}-${e.target.label}(w=${e.weight})`);

  steps.push({
    description: `Kruskal: Sort all graph edges by weight: [${edgeWeightsList.join(", ")}]`,
    currentNode: null,
    visited: new Set(),
    frontier: [],
    traversedEdges: new Set(),
  });

  while (mstEdges.size < nodes.length - 1 && edgeIndex < sortedEdges.length) {
    const edge = sortedEdges[edgeIndex++];

    const u = edge.source;
    const v = edge.target;
    const rootU = find(u.id);
    const rootV = find(v.id);

    edge.state = EdgeState.RELAXED; // Highlight current evaluation edge

    steps.push({
      description: `Evaluating Edge ${u.label}-${v.label} (w=${edge.weight}). Find(${u.label}) = set ${rootU}, Find(${v.label}) = set ${rootV}.`,
      currentNode: u,
      visited: new Set([u.id, v.id]),
      frontier: [],
      traversedEdges: new Set(mstEdges),
    });

    if (rootU !== rootV) {
      unionSets(rootU, rootV);
      mstEdges.add(edge.id);
      edge.state = EdgeState.IN_PATH;

      steps.push({
        description: `Roots differ. Add Edge ${u.label}-${v.label} to MST tree. No cycle formed.`,
        currentNode: v,
        visited: new Set(),
        frontier: [],
        traversedEdges: new Set(mstEdges),
      });
    } else {
      edge.state = EdgeState.NORMAL; // Reset, cycle formed
      steps.push({
        description: `Roots match (${rootU} = ${rootV}). Edge ${u.label}-${v.label} skipped (forming cycle).`,
        currentNode: u,
        visited: new Set(),
        frontier: [],
        traversedEdges: new Set(mstEdges),
      });
    }
  }

  steps.push({
    description: `Kruskal MST Algorithm completed. Total MST Edges = ${mstEdges.size}.`,
    currentNode: null,
    visited: new Set(),
    frontier: [],
    traversedEdges: new Set(mstEdges),
  });

  return steps;
}

export function runGraphMSTPrim(nodes, edges) {
  const steps = [];
  const visited = new Set();
  const mstEdges = new Set();

  if (nodes.length === 0) return steps;

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, weight: e.weight, edge: e });
    adj[e.target.id].push({ target: e.source, weight: e.weight, edge: e });
  }

  const start = nodes[0];
  visited.add(start.id);

  steps.push({
    description: `Prim MST: Starting from Node ${start.label}. Add to MST set.`,
    currentNode: start,
    visited: new Set(visited),
    frontier: [],
    traversedEdges: new Set(),
  });

  while (visited.size < nodes.length) {
    let minWeight = Infinity;
    let minEdge = null;
    let nextNode = null;

    // Find the minimum weight edge connecting MST set to non-MST set (cut edges)
    for (const uId of visited) {
      for (const item of adj[uId]) {
        if (!visited.has(item.target.id)) {
          if (item.weight < minWeight) {
            minWeight = item.weight;
            minEdge = item.edge;
            nextNode = item.target;
          }
        }
      }
    }

    if (!minEdge) break; // Graph is disconnected

    minEdge.state = EdgeState.RELAXED;
    steps.push({
      description: `Evaluating cut edges. Selected minimum weight cut edge: ${minEdge.source.label}-${minEdge.target.label} (w=${minWeight}) to Node ${nextNode.label}.`,
      currentNode: nextNode,
      visited: new Set(visited),
      frontier: [],
      traversedEdges: new Set(mstEdges),
    });

    visited.add(nextNode.id);
    mstEdges.add(minEdge.id);
    minEdge.state = EdgeState.IN_PATH;

    steps.push({
      description: `Added Node ${nextNode.label} and Edge ${minEdge.source.label}-${minEdge.target.label} to MST tree.`,
      currentNode: nextNode,
      visited: new Set(visited),
      frontier: [],
      traversedEdges: new Set(mstEdges),
    });
  }

  steps.push({
    description: "Prim MST complete.",
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    traversedEdges: new Set(mstEdges),
  });

  return steps;
}

export function runGraphBellmanFord(nodes, edges, startNode) {
  const steps = [];
  const distances = new Map();
  const predecessors = new Map();

  for (const n of nodes) {
    distances.set(n.id, Infinity);
    predecessors.set(n.id, null);
  }
  distances.set(startNode.id, 0);

  steps.push({
    description: `Bellman-Ford: Set distance of Node ${startNode.label} = 0, others = ∞. Starting relaxations.`,
    currentNode: startNode,
    visited: new Set(),
    distances: new Map(distances),
    predecessors: new Map(predecessors),
  });

  // Run V-1 relaxation rounds
  for (let round = 1; round < nodes.length; round++) {
    let relaxedAny = false;

    steps.push({
      description: `Round ${round}/${nodes.length - 1} of edge relaxations.`,
      currentNode: null,
      visited: new Set(),
      distances: new Map(distances),
      predecessors: new Map(predecessors),
    });

    for (const edge of edges) {
      const u = edge.source;
      const v = edge.target;
      const w = edge.weight;

      // Relax forward edge
      const uDist = distances.get(u.id);
      const vDist = distances.get(v.id);

      if (uDist !== Infinity && uDist + w < vDist) {
        distances.set(v.id, uDist + w);
        predecessors.set(v.id, u.id);
        edge.state = EdgeState.RELAXED;
        relaxedAny = true;

        const oldDist = vDist === Infinity ? "∞" : vDist;
        steps.push({
          description: `Relaxed edge ${u.label}→${v.label} (w=${w}): dist[${v.label}] = ${oldDist} → ${uDist + w}`,
          currentNode: u,
          visited: new Set([u.id, v.id]),
          distances: new Map(distances),
          predecessors: new Map(predecessors),
        });
        edge.state = EdgeState.NORMAL;
      }
    }

    if (!relaxedAny) {
      steps.push({
        description: `Early exit: No edges relaxed in Round ${round}. Shortest distances pre-calculated.`,
        currentNode: null,
        visited: new Set(),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
      });
      break;
    }
  }

  // 1 final round to check for negative cycles
  let negativeCycleDetected = false;
  steps.push({
    description: "Final round: Checking for negative cycles across all edges.",
    currentNode: null,
    visited: new Set(),
    distances: new Map(distances),
    predecessors: new Map(predecessors),
  });

  for (const edge of edges) {
    const u = edge.source;
    const v = edge.target;
    const w = edge.weight;

    const uDist = distances.get(u.id);
    const vDist = distances.get(v.id);

    if (uDist !== Infinity && uDist + w < vDist) {
      negativeCycleDetected = true;
      edge.state = EdgeState.IN_PATH;

      steps.push({
        description: `Negative Cycle Detected! Edge ${u.label}→${v.label} can be relaxed indefinitely (distance would drop below ${vDist}).`,
        currentNode: u,
        visited: new Set([u.id, v.id]),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        cycleDetected: true,
      });
      break;
    }
  }

  if (!negativeCycleDetected) {
    steps.push({
      description: "Bellman-Ford calculation complete. No negative weight cycles found.",
      currentNode: null,
      visited: new Set(),
      distances: new Map(distances),
      predecessors: new Map(predecessors),
    });
  }

  return steps;
}

export function runGraphSCCKosaraju(nodes, edges, startNode) {
  const steps = [];
  const visited = new Set();
  const finishStack = [];

  const adj = {};
  const transAdj = {};
  for (const n of nodes) {
    adj[n.id] = [];
    transAdj[n.id] = [];
  }

  for (const e of edges) {
    // Kosaraju requires directed representation
    adj[e.source.id].push({ target: e.target, edge: e });
    transAdj[e.target.id].push({ target: e.source, edge: e });
  }

  // PASS 1: DFS on G to compute finishes
  const dfs1 = (node) => {
    visited.add(node.id);
    node.state = NodeState.VISITED;

    steps.push({
      description: `Kosaraju Pass 1: Visited Node ${node.label}. DFS traversal down.`,
      currentNode: node,
      visited: new Set(visited),
      frontier: [...finishStack],
    });

    for (const item of adj[node.id]) {
      if (!visited.has(item.target.id)) {
        dfs1(item.target);
      }
    }

    finishStack.push(node.id);
    steps.push({
      description: `Kosaraju Pass 1: Finished Node ${node.label}. Push to finish stack. Stack = [${finishStack
        .map((id) => nodes.find((n) => n.id === id).label)
        .join(", ")}]`,
      currentNode: node,
      visited: new Set(visited),
      frontier: [...finishStack],
    });
  };

  steps.push({
    description: "Kosaraju SCC: Start Pass 1 DFS on original graph to build finish times stack.",
    currentNode: null,
    visited: new Set(),
    frontier: [],
  });

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      dfs1(n);
    }
  }

  // Transpose edges visual step
  steps.push({
    description: "Kosaraju SCC: Transposing Graph! All directed edge arrows reverse direction.",
    currentNode: null,
    visited: new Set(),
    frontier: [...finishStack],
    isTransposed: true,
  });

  // PASS 2: DFS on G^T in finish order
  visited.clear();
  const components = [];
  let currentComponent = new Set();

  const dfs2 = (node, compColor) => {
    visited.add(node.id);
    currentComponent.add(node.id);
    node.colorOverride = compColor;

    steps.push({
      description: `Kosaraju Pass 2: Traversed Node ${node.label} on transposed graph. Grouping in SCC component.`,
      currentNode: node,
      visited: new Set(visited),
      frontier: [...finishStack],
      currentComponent: new Set(currentComponent),
      componentsList: [...components],
      isTransposed: true,
    });

    for (const item of transAdj[node.id]) {
      if (!visited.has(item.target.id)) {
        dfs2(item.target, compColor);
      }
    }
  };

  let colorIdx = 0;
  while (finishStack.length > 0) {
    const id = finishStack.pop();
    const node = nodes.find((n) => n.id === id);

    if (!visited.has(id)) {
      currentComponent = new Set();
      const sccColor = Colors.components[colorIdx % Colors.components.length];
      colorIdx++;

      steps.push({
        description: `Kosaraju Pass 2: Pop Node ${node.label} from stack. Node is unvisited, starts new SCC.`,
        currentNode: node,
        visited: new Set(visited),
        frontier: [...finishStack],
        isTransposed: true,
      });

      dfs2(node, sccColor);
      components.push(new Set(currentComponent));
    } else {
      steps.push({
        description: `Kosaraju Pass 2: Pop Node ${node.label} from stack. Node is already grouped in SCC. Skip.`,
        currentNode: node,
        visited: new Set(visited),
        frontier: [...finishStack],
        isTransposed: true,
      });
    }
  }

  const sccListStr = components
    .map((set) => "{" + [...set].map((id) => nodes.find((n) => n.id === id).label).join(",") + "}")
    .join(", ");

  steps.push({
    description: `Kosaraju SCC Complete. Found ${components.length} Strongly Connected Components: [${sccListStr}]`,
    currentNode: null,
    visited: new Set(visited),
    frontier: [],
    componentsList: [...components],
    isTransposed: true,
  });

  return steps;
}

export function runGraphTarjanBridges(nodes, edges) {
  const steps = [];
  let timer = 0;
  const dfn = new Map();
  const low = new Map();
  const visited = new Set();
  const bridges = new Set();
  const articulations = new Set();

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, edge: e });
    adj[e.target.id].push({ target: e.source, edge: e }); // Undirected
  }

  const dfs = (u, parentEdgeId) => {
    visited.add(u.id);
    timer++;
    dfn.set(u.id, timer);
    low.set(u.id, timer);

    steps.push({
      description: `Tarjan visit Node ${u.label}. Assign discovery dfn = ${timer}, low = ${timer}.`,
      currentNode: u,
      visited: new Set(visited),
      dfnMap: new Map(dfn),
      lowMap: new Map(low),
      bridges: new Set(bridges),
      articulations: new Set(articulations),
    });

    let children = 0;

    for (const item of adj[u.id]) {
      const v = item.target;
      const edge = item.edge;

      if (edge.id === parentEdgeId) continue;

      if (visited.has(v.id)) {
        // Back-edge found
        const oldLow = low.get(u.id);
        const backDfn = dfn.get(v.id);
        const newLow = Math.min(oldLow, backDfn);
        low.set(u.id, newLow);

        steps.push({
          description: `Back-edge found: Node ${u.label}→Node ${v.label}. Update low[${u.label}] = min(low[${u.label}], dfn[${v.label}]) = min(${oldLow}, ${backDfn}) = ${newLow}.`,
          currentNode: u,
          visited: new Set(visited),
          dfnMap: new Map(dfn),
          lowMap: new Map(low),
          bridges: new Set(bridges),
          articulations: new Set(articulations),
        });
      } else {
        children++;
        dfs(v, edge.id);

        // Upon backtrack
        const oldLow = low.get(u.id);
        const childLow = low.get(v.id);
        const newLow = Math.min(oldLow, childLow);
        low.set(u.id, newLow);

        steps.push({
          description: `Backtrack to Node ${u.label} from Node ${v.label}. Update low[${u.label}] = min(low[${u.label}], low[${v.label}]) = min(${oldLow}, ${childLow}) = ${newLow}.`,
          currentNode: u,
          visited: new Set(visited),
          dfnMap: new Map(dfn),
          lowMap: new Map(low),
          bridges: new Set(bridges),
          articulations: new Set(articulations),
        });

        // Articulation point criteria
        const isRoot = parentEdgeId === null;
        if (!isRoot && childLow >= dfn.get(u.id)) {
          articulations.add(u.id);
          steps.push({
            description: `Articulation Point identified: low[${v.label}] (${childLow}) >= dfn[${u.label}] (${dfn.get(u.id)}). Node ${u.label} is critical.`,
            currentNode: u,
            visited: new Set(visited),
            dfnMap: new Map(dfn),
            lowMap: new Map(low),
            bridges: new Set(bridges),
            articulations: new Set(articulations),
          });
        }

        // Bridge criteria
        if (childLow > dfn.get(u.id)) {
          bridges.add(edge.id);
          edge.state = EdgeState.BRIDGE;
          steps.push({
            description: `Bridge Edge identified: low[${v.label}] (${childLow}) > dfn[${u.label}] (${dfn.get(u.id)}). Edge ${u.label}-${v.label} is critical.`,
            currentNode: u,
            visited: new Set(visited),
            dfnMap: new Map(dfn),
            lowMap: new Map(low),
            bridges: new Set(bridges),
            articulations: new Set(articulations),
          });
        }
      }
    }

    // Root check for articulation points
    if (parentEdgeId === null && children > 1) {
      articulations.add(u.id);
      steps.push({
        description: `Articulation Point identified: Root Node ${u.label} has >= 2 children (${children}). Node is critical.`,
        currentNode: u,
        visited: new Set(visited),
        dfnMap: new Map(dfn),
        lowMap: new Map(low),
        bridges: new Set(bridges),
        articulations: new Set(articulations),
      });
    }
  };

  steps.push({
    description: "Tarjan's Bridges & Articulation Points: Initializing search.",
    currentNode: null,
    visited: new Set(),
    dfnMap: new Map(),
    lowMap: new Map(),
    bridges: new Set(),
    articulations: new Set(),
  });

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      dfs(n, null);
    }
  }

  const artLabels = [...articulations].map((id) => nodes.find((n) => n.id === id).label);
  steps.push({
    description: `Tarjan scan completed. Found ${bridges.size} Bridges and ${articulations.size} Articulation Points. Articulations: [${artLabels.join(", ")}]`,
    currentNode: null,
    visited: new Set(visited),
    dfnMap: new Map(dfn),
    lowMap: new Map(low),
    bridges: new Set(bridges),
    articulations: new Set(articulations),
  });

  return steps;
}

export function runGraphDijkstra(nodes, edges, isDirected, startNode, endNode) {
  const steps = [];
  const distances = new Map();
  const predecessors = new Map();
  const visited = new Set();
  const traversedEdges = new Set();

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source.id].push({ target: e.target, weight: e.weight, edge: e });
    if (!isDirected) {
      adj[e.target.id].push({ target: e.source, weight: e.weight, edge: e });
    }
  }

  for (const n of nodes) {
    distances.set(n.id, Infinity);
    predecessors.set(n.id, null);
  }
  distances.set(startNode.id, 0);

  // Simple priority queue (array-based)
  const pq = [{ node: startNode, dist: 0 }];

  steps.push({
    description: `Dijkstra: Initialize distance of Node ${startNode.label} = 0, all others = ∞.`,
    currentNode: startNode,
    visited: new Set(),
    distances: new Map(distances),
    predecessors: new Map(predecessors),
    traversedEdges: new Set(),
  });

  while (pq.length > 0) {
    // Extract min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: curr, dist: currDist } = pq.shift();

    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    steps.push({
      description: `Extract min: Node ${curr.label} (dist=${currDist}). Mark as finalized.`,
      currentNode: curr,
      visited: new Set(visited),
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      traversedEdges: new Set(traversedEdges),
    });

    // Early exit if we reached destination
    if (endNode && curr.id === endNode.id) {
      steps.push({
        description: `Reached destination Node ${endNode.label}! Shortest distance = ${currDist}.`,
        currentNode: curr,
        visited: new Set(visited),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        traversedEdges: new Set(traversedEdges),
      });
      break;
    }

    for (const item of adj[curr.id]) {
      const neighbor = item.target;
      if (visited.has(neighbor.id)) continue;

      const newDist = currDist + item.weight;
      const oldDist = distances.get(neighbor.id);

      if (newDist < oldDist) {
        distances.set(neighbor.id, newDist);
        predecessors.set(neighbor.id, curr.id);
        traversedEdges.add(item.edge.id);
        pq.push({ node: neighbor, dist: newDist });

        const oldStr = oldDist === Infinity ? "∞" : oldDist;
        steps.push({
          description: `Relax edge ${curr.label}→${neighbor.label} (w=${item.weight}): dist[${neighbor.label}] = ${oldStr} → ${newDist}.`,
          currentNode: curr,
          visited: new Set(visited),
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          traversedEdges: new Set(traversedEdges),
        });
      }
    }
  }

  steps.push({
    description: "Dijkstra's algorithm complete. All reachable shortest distances computed.",
    currentNode: null,
    visited: new Set(visited),
    distances: new Map(distances),
    predecessors: new Map(predecessors),
    traversedEdges: new Set(traversedEdges),
  });

  return steps;
}
