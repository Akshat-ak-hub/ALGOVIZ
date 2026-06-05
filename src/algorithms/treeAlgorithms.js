import { BSTModel } from "../models/TreeModel";

// ============================================================
// TREE ALGORITHMS TIMELINE BUILDERS
// ============================================================

export function buildTreeTraversals(root, type) {
  const steps = [];
  const visitedValues = [];
  const traversedIds = new Set();
  const flat = new BSTModel();
  flat.root = root;

  // Line numbers per traversal type (matching treeAlgorithmCode.js)
  const visitLine = { preorder: 3, inorder: 4, postorder: 5 };
  const recurseLeftLine = { preorder: 4, inorder: 3, postorder: 3 };
  const recurseRightLine = { preorder: 5, inorder: 5, postorder: 4 };
  const backtrackLine = visitLine[type];

  const traverse = (node) => {
    if (!node) return;

    if (type === "preorder") {
      visitedValues.push(node.value);
      traversedIds.add(node.id);
      steps.push({
        description: `Preorder visit: Record Node ${node.value}. Output = [${visitedValues.join(", ")}]`,
        activeId: node.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: visitLine.preorder,
      });
    }

    if (node.left) {
      steps.push({
        description: `Traverse left from Node ${node.value} to Node ${node.left.value}.`,
        activeId: node.left.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: recurseLeftLine[type],
      });
      traverse(node.left);
      steps.push({
        description: `Backtrack to Node ${node.value}.`,
        activeId: node.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: backtrackLine,
      });
    }

    if (type === "inorder") {
      visitedValues.push(node.value);
      traversedIds.add(node.id);
      steps.push({
        description: `Inorder visit: Record Node ${node.value}. Output = [${visitedValues.join(", ")}]`,
        activeId: node.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: visitLine.inorder,
      });
    }

    if (node.right) {
      steps.push({
        description: `Traverse right from Node ${node.value} to Node ${node.right.value}.`,
        activeId: node.right.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: recurseRightLine[type],
      });
      traverse(node.right);
      steps.push({
        description: `Backtrack to Node ${node.value}.`,
        activeId: node.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: backtrackLine,
      });
    }

    if (type === "postorder") {
      visitedValues.push(node.value);
      traversedIds.add(node.id);
      steps.push({
        description: `Postorder visit: Record Node ${node.value}. Output = [${visitedValues.join(", ")}]`,
        activeId: node.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        codeLine: visitLine.postorder,
      });
    }
  };

  steps.push({
    description: `Start ${type} traversal from root Node ${root.value}.`,
    activeId: root.id,
    visitedValues: [],
    highlightedIds: new Set(),
    codeLine: 1,
  });

  traverse(root);

  steps.push({
    description: `Traversal complete. Final result: [${visitedValues.join(", ")}]`,
    activeId: null,
    visitedValues: [...visitedValues],
    highlightedIds: new Set(traversedIds),
    codeLine: 6,
  });

  return steps;
}

export function buildTreeBFS(root) {
  const steps = [];
  const visitedValues = [];
  const traversedIds = new Set();

  if (!root) return steps;

  const queue = [{ node: root, parentVal: null }];
  steps.push({
    description: `Enqueue root Node ${root.value}. Queue = [${root.value}]`,
    activeId: root.id,
    visitedValues: [],
    highlightedIds: new Set(),
    queue: [root.value],
    codeLine: 4,
  });

  while (queue.length > 0) {
    const { node, parentVal } = queue.shift();

    visitedValues.push(node.value);
    traversedIds.add(node.id);

    const desc = parentVal
      ? `Dequeue Node ${node.value} (child of ${parentVal}). Record visit. Output = [${visitedValues.join(", ")}]`
      : `Dequeue root Node ${node.value}. Record visit. Output = [${visitedValues.join(", ")}]`;

    steps.push({
      description: desc,
      activeId: node.id,
      visitedValues: [...visitedValues],
      highlightedIds: new Set(traversedIds),
      queue: queue.map((item) => item.node.value),
      codeLine: 8,
    });

    if (node.left) {
      queue.push({ node: node.left, parentVal: node.value });
      steps.push({
        description: `Enqueue left child Node ${node.left.value}. Queue = [${queue.map((item) => item.node.value).join(", ")}]`,
        activeId: node.left.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        queue: queue.map((item) => item.node.value),
        codeLine: 9,
      });
    }

    if (node.right) {
      queue.push({ node: node.right, parentVal: node.value });
      steps.push({
        description: `Enqueue right child Node ${node.right.value}. Queue = [${queue.map((item) => item.node.value).join(", ")}]`,
        activeId: node.right.id,
        visitedValues: [...visitedValues],
        highlightedIds: new Set(traversedIds),
        queue: queue.map((item) => item.node.value),
        codeLine: 10,
      });
    }
  }

  steps.push({
    description: `BFS complete. Final Output = [${visitedValues.join(", ")}]`,
    activeId: null,
    visitedValues: [...visitedValues],
    highlightedIds: new Set(traversedIds),
    queue: [],
    codeLine: 12,
  });

  return steps;
}

export function buildTreeHeightDiameter(root) {
  const steps = [];
  const heights = new Map();
  let maxDiameter = 0;

  const calculate = (node) => {
    if (!node) return 0;

    steps.push({
      description: `Calculate Height for Node ${node.value}. Traverse left child first.`,
      activeId: node.id,
      heights: new Map(heights),
      maxDiameter,
      highlightedIds: new Set([node.id]),
      codeLine: 3,
    });

    const leftH = calculate(node.left);
    const rightH = calculate(node.right);

    const nodeH = Math.max(leftH, rightH) + 1;
    heights.set(node.id, nodeH);

    const currentD = leftH + rightH;
    if (currentD > maxDiameter) {
      maxDiameter = currentD;
    }

    steps.push({
      description: `Node ${node.value} height: Left subtree height = ${leftH}, Right subtree height = ${rightH}. Height = ${nodeH}. Current diameter = ${currentD}. Max overall diameter = ${maxDiameter}.`,
      activeId: node.id,
      heights: new Map(heights),
      maxDiameter,
      highlightedIds: new Set([node.id]),
      codeLine: 5,
    });

    return nodeH;
  };

  steps.push({
    description: `Starting Height & Diameter calculations at root Node ${root.value}.`,
    activeId: root.id,
    heights: new Map(),
    maxDiameter: 0,
    highlightedIds: new Set(),
    codeLine: 1,
  });

  calculate(root);

  steps.push({
    description: `Calculations complete. Tree Height = ${heights.get(root.id) || 0}, Tree Max Diameter = ${maxDiameter}.`,
    activeId: root.id,
    heights: new Map(heights),
    maxDiameter,
    highlightedIds: new Set(),
    codeLine: 7,
  });

  return steps;
}

export function buildTreeLCA(root, pVal, qVal) {
  const steps = [];
  const flatNodes = [];
  const gather = (n) => {
    if (!n) return;
    flatNodes.push(n);
    gather(n.left);
    gather(n.right);
  };
  gather(root);

  const pNode = flatNodes.find((n) => n.value === pVal);
  const qNode = flatNodes.find((n) => n.value === qVal);

  if (!pNode || !qNode) {
    steps.push({
      description: "One or both LCA target nodes not found in tree.",
      activeId: null,
      highlightedIds: new Set(),
      codeLine: 1,
    });
    return steps;
  }

  // Find Path from Root to Node helper
  const findPath = (node, target, pathList) => {
    if (!node) return false;
    pathList.push(node);

    if (node.value === target.value) return true;

    if (findPath(node.left, target, pathList) || findPath(node.right, target, pathList)) {
      return true;
    }

    pathList.pop();
    return false;
  };

  const pathP = [];
  const pathQ = [];
  findPath(root, pNode, pathP);
  findPath(root, qNode, pathQ);

  const pathPStr = pathP.map((n) => n.value).join(" → ");
  const pathQStr = pathQ.map((n) => n.value).join(" → ");

  steps.push({
    description: `Tracing path for LCA targets. Path to Node ${pVal}: [${pathPStr}]. Path to Node ${qVal}: [${pathQStr}].`,
    activeId: root.id,
    highlightedIds: new Set([pNode.id, qNode.id]),
    codeLine: 4,
  });

  let lcaNode = null;
  let len = Math.min(pathP.length, pathQ.length);

  for (let i = 0; i < len; i++) {
    const nP = pathP[i];
    const nQ = pathQ[i];

    if (nP.id === nQ.id) {
      lcaNode = nP;
      steps.push({
        description: `Check path index ${i}: Common node found: Node ${lcaNode.value}.`,
        activeId: lcaNode.id,
        highlightedIds: new Set([lcaNode.id, pNode.id, qNode.id]),
        codeLine: 7,
      });
    } else {
      steps.push({
        description: `Check path index ${i}: Paths diverge (${nP.value} ≠ ${nQ.value}). Previous common node is the LCA.`,
        activeId: lcaNode.id,
        highlightedIds: new Set([lcaNode.id, pNode.id, qNode.id]),
        codeLine: 8,
      });
      break;
    }
  }

  steps.push({
    description: `LCA identified! Lowest Common Ancestor of Node ${pVal} and Node ${qVal} is Node ${lcaNode.value}.`,
    activeId: lcaNode.id,
    highlightedIds: new Set([lcaNode.id]),
    lcaFinished: true,
    codeLine: 10,
  });

  return steps;
}

export function buildTreePathSum(root, targetSum) {
  const steps = [];
  const matchPaths = [];
  const currentPath = [];

  const solve = (node, currentSum) => {
    if (!node) return;

    currentPath.push(node);
    const newSum = currentSum + node.value;

    const pathStr = currentPath.map((n) => n.value).join(" + ");
    steps.push({
      description: `Visit Node ${node.value}. Current path: [${pathStr}] = ${newSum}. (Target = ${targetSum})`,
      activeId: node.id,
      highlightedIds: new Set(currentPath.map((n) => n.id)),
      codeLine: 1,
    });

    const isLeaf = !node.left && !node.right;
    if (isLeaf) {
      if (newSum === targetSum) {
        matchPaths.push([...currentPath]);
        steps.push({
          description: `Leaf Node ${node.value} reached. Sum matches Target (${targetSum})! Path found!`,
          activeId: node.id,
          highlightedIds: new Set(currentPath.map((n) => n.id)),
          match: true,
          codeLine: 5,
        });
      } else {
        steps.push({
          description: `Leaf Node ${node.value} reached. Sum (${newSum}) != Target (${targetSum}).`,
          activeId: node.id,
          highlightedIds: new Set(currentPath.map((n) => n.id)),
          codeLine: 3,
        });
      }
    } else {
      solve(node.left, newSum);
      if (node.left) {
        steps.push({
          description: `Backtrack to Node ${node.value} from left child.`,
          activeId: node.id,
          highlightedIds: new Set(currentPath.map((n) => n.id)),
          codeLine: 8,
        });
      }
      solve(node.right, newSum);
      if (node.right) {
        steps.push({
          description: `Backtrack to Node ${node.value} from right child.`,
          activeId: node.id,
          highlightedIds: new Set(currentPath.map((n) => n.id)),
          codeLine: 9,
        });
      }
    }

    currentPath.pop();
  };

  steps.push({
    description: `Searching for paths that sum up to ${targetSum} starting from root.`,
    activeId: root.id,
    highlightedIds: new Set(),
    codeLine: 1,
  });

  solve(root, 0);

  const matchStr =
    matchPaths.length > 0
      ? `Search complete. Found ${matchPaths.length} matching paths: ${matchPaths
          .map((p) => "[" + p.map((n) => n.value).join(" → ") + "]")
          .join(", ")}`
      : `Search complete. No path sums match the target of ${targetSum}.`;

  steps.push({
    description: matchStr,
    activeId: null,
    highlightedIds: new Set(matchPaths.flatMap((p) => p.map((n) => n.id))),
    finished: true,
    matchPaths,
    codeLine: 1,
  });

  return steps;
}

export function buildTreeBinaryLifting(root) {
  const steps = [];
  const flatNodes = [];
  const gather = (n) => {
    if (!n) return;
    flatNodes.push(n);
    gather(n.left);
    gather(n.right);
  };
  gather(root);

  // Precompute parent pointers and depth
  const depths = new Map();
  const up = new Map(); // up.get(nodeId)[power] -> parentId

  const dfs = (node, pId, d) => {
    depths.set(node.id, d);
    const ancestors = Array(5).fill(null); // up to 2^4 = 16 ancestors (enough for depth 32)
    ancestors[0] = pId;
    up.set(node.id, ancestors);

    if (node.left) dfs(node.left, node.id, d + 1);
    if (node.right) dfs(node.right, node.id, d + 1);
  };

  dfs(root, null, 0);

  // Fill lifting table: up[u][i] = up[up[u][i-1]][i-1]
  for (let i = 1; i < 5; i++) {
    for (const node of flatNodes) {
      const parentRow = up.get(node.id);
      const prevAncestorId = parentRow[i - 1];
      if (prevAncestorId !== null) {
        const grandParentRow = up.get(prevAncestorId);
        parentRow[i] = grandParentRow[i - 1];
      }
    }
  }

  // Create table rows for rendering in sidebar
  const liftTableData = flatNodes.map((n) => {
    const row = up.get(n.id);
    return {
      nodeVal: n.value,
      nodeId: n.id,
      up: row.map((ancId) => {
        if (ancId === null) return "—";
        const ancNode = flatNodes.find((fn) => fn.id === ancId);
        return ancNode ? ancNode.value : "—";
      }),
    };
  });

  steps.push({
    description: `Binary Lifting Table Precomputed. Table contains 2^i ancestors for powers 0 to 4.`,
    activeId: root.id,
    highlightedIds: new Set(),
    liftTableData,
    codeLine: 1,
  });

  // Example Query: Jump from node with max depth to root
  let maxDepthNode = flatNodes[0];
  for (const n of flatNodes) {
    if (depths.get(n.id) > depths.get(maxDepthNode.id)) {
      maxDepthNode = n;
    }
  }

  const queryVal = maxDepthNode.value;
  steps.push({
    description: `Binary Lifting Demonstration: Finding LCA/Ancestor query. Let's find the ancestor of deepest Node ${queryVal} at distance 5 (binary: 101 = 2^2 + 2^0).`,
    activeId: maxDepthNode.id,
    highlightedIds: new Set([maxDepthNode.id]),
    liftTableData,
    codeLine: 1,
  });

  let curr = maxDepthNode;

  // Jump 2^2 = 4 nodes up
  const ancestorsRow = up.get(curr.id);
  const anc2 = ancestorsRow[2]; // 2^2 = 4th ancestor
  if (anc2 !== null) {
    const nextNode = flatNodes.find((fn) => fn.id === anc2);
    steps.push({
      description: `Step 1: Jump 2^2 = 4 levels up from Node ${curr.value} using lookup table. Next node is Node ${nextNode.value}.`,
      activeId: nextNode.id,
      highlightedIds: new Set([curr.id, nextNode.id]),
      liftTableData,
      codeLine: 4,
    });
    curr = nextNode;
  }

  // Jump 2^0 = 1 node up
  const ancestorsRow2 = up.get(curr.id);
  const anc0 = ancestorsRow2[0];
  if (anc0 !== null) {
    const nextNode2 = flatNodes.find((fn) => fn.id === anc0);
    steps.push({
      description: `Step 2: Jump 2^0 = 1 level up from Node ${curr.value} using lookup table. Next node is Node ${nextNode2.value}.`,
      activeId: nextNode2.id,
      highlightedIds: new Set([curr.id, nextNode2.id]),
      liftTableData,
      codeLine: 4,
    });
    curr = nextNode2;
  }

  steps.push({
    description: `Lifting search finalized. 5th ancestor of Node ${queryVal} is Node ${curr.value}.`,
    activeId: curr.id,
    highlightedIds: new Set([curr.id]),
    liftTableData,
    codeLine: 6,
  });

  return steps;
}
