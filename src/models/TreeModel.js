import { NodeState } from "./GraphModel";

// ============================================================
// TREE DATA MODELS & BST OPERATIONS
// ============================================================

export class TreeNode {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.label = value.toString();
    this.left = null;
    this.right = null;
    this.parent = null;
    this.x = 0;
    this.y = 0;
    this.state = NodeState.UNVISITED;
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= 484; // Radius 22
  }
}

export class BSTModel {
  constructor() {
    this.root = null;
    this.nodeCounter = 0;
  }

  clear() {
    this.root = null;
    this.nodeCounter = 0;
  }

  insert(val) {
    const newNode = new TreeNode(this.nodeCounter++, val);
    const steps = [];

    if (!this.root) {
      this.root = newNode;
      steps.push({
        description: `Tree is empty. Inserted Node ${val} as root.`,
        activeId: newNode.id,
        nodes: this.cloneTree(),
        highlightedIds: new Set([newNode.id]),
        codeLine: 2,
      });
      return { root: this.root, steps };
    }

    let curr = this.root;
    steps.push({
      description: `Starting insertion search for value ${val}. Compare with root ${curr.value}.`,
      activeId: curr.id,
      nodes: this.cloneTree(),
      highlightedIds: new Set([curr.id]),
      codeLine: 3,
    });

    while (curr) {
      if (val < curr.value) {
        steps.push({
          description: `${val} < ${curr.value}. Moving left.`,
          activeId: curr.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([curr.id]),
          codeLine: 4,
        });
        if (!curr.left) {
          curr.left = newNode;
          newNode.parent = curr;
          steps.push({
            description: `Inserted Node ${val} as left child of Node ${curr.value}.`,
            activeId: newNode.id,
            nodes: this.cloneTree(),
            highlightedIds: new Set([newNode.id, curr.id]),
            codeLine: 4,
          });
          break;
        }
        curr = curr.left;
      } else {
        steps.push({
          description: `${val} >= ${curr.value}. Moving right.`,
          activeId: curr.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([curr.id]),
          codeLine: 5,
        });
        if (!curr.right) {
          curr.right = newNode;
          newNode.parent = curr;
          steps.push({
            description: `Inserted Node ${val} as right child of Node ${curr.value}.`,
            activeId: newNode.id,
            nodes: this.cloneTree(),
            highlightedIds: new Set([newNode.id, curr.id]),
            codeLine: 6,
          });
          break;
        }
        curr = curr.right;
      }
    }

    return { root: this.root, steps };
  }

  search(val) {
    const steps = [];
    if (!this.root) {
      steps.push({
        description: "Tree is empty. Cannot search.",
        activeId: null,
        nodes: this.cloneTree(),
        highlightedIds: new Set(),
        codeLine: 2,
      });
      return steps;
    }

    let curr = this.root;
    steps.push({
      description: `Search: Compare ${val} with node ${curr.value}.`,
      activeId: curr.id,
      nodes: this.cloneTree(),
      highlightedIds: new Set([curr.id]),
      codeLine: 4,
    });

    while (curr) {
      if (curr.value === val) {
        steps.push({
          description: `Found Node ${val}! Search completed successfully.`,
          activeId: curr.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([curr.id]),
          found: true,
          codeLine: 6,
        });
        return steps;
      }

      if (val < curr.value) {
        if (!curr.left) break;
        curr = curr.left;
        steps.push({
          description: `${val} < parent. Moving left to Node ${curr.value}.`,
          activeId: curr.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([curr.id]),
          codeLine: 8,
        });
      } else {
        if (!curr.right) break;
        curr = curr.right;
        steps.push({
          description: `${val} >= parent. Moving right to Node ${curr.value}.`,
          activeId: curr.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([curr.id]),
          codeLine: 10,
        });
      }
    }

    steps.push({
      description: `Node ${val} does not exist in the BST.`,
      activeId: null,
      nodes: this.cloneTree(),
      highlightedIds: new Set(),
      found: false,
      codeLine: 11,
    });
    return steps;
  }

  delete(val) {
    const steps = [];
    const deleteNode = (node, v) => {
      if (!node) {
        steps.push({
          description: `Node ${v} not found.`,
          activeId: null,
          nodes: this.cloneTree(),
          highlightedIds: new Set(),
        });
        return null;
      }

      steps.push({
        description: `Locating node: compare ${v} with Node ${node.value}.`,
        activeId: node.id,
        nodes: this.cloneTree(),
        highlightedIds: new Set([node.id]),
      });

      if (v < node.value) {
        node.left = deleteNode(node.left, v);
        if (node.left) node.left.parent = node;
      } else if (v > node.value) {
        node.right = deleteNode(node.right, v);
        if (node.right) node.right.parent = node;
      } else {
        // Node found!
        steps.push({
          description: `Found Node ${node.value} to delete. Checking children.`,
          activeId: node.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([node.id]),
        });

        // Case 1: No child or 1 child
        if (!node.left) {
          steps.push({
            description: `Replacing Node ${node.value} with its right child.`,
            activeId: node.right ? node.right.id : null,
            nodes: this.cloneTree(),
            highlightedIds: node.right ? new Set([node.right.id]) : new Set(),
          });
          return node.right;
        } else if (!node.right) {
          steps.push({
            description: `Replacing Node ${node.value} with its left child.`,
            activeId: node.left ? node.left.id : null,
            nodes: this.cloneTree(),
            highlightedIds: node.left ? new Set([node.left.id]) : new Set(),
          });
          return node.left;
        }

        // Case 2: Two children. Find successor (smallest node in right subtree)
        steps.push({
          description: `Node has two children. Finding inorder successor in right subtree.`,
          activeId: node.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([node.id]),
        });

        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }

        steps.push({
          description: `Found successor: Node ${successor.value}. Copying value to Node ${node.value}.`,
          activeId: successor.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([successor.id, node.id]),
        });

        node.value = successor.value;
        node.label = successor.value.toString();

        steps.push({
          description: `Deleting successor node ${successor.value} from right subtree.`,
          activeId: node.id,
          nodes: this.cloneTree(),
          highlightedIds: new Set([node.id]),
        });

        node.right = deleteNode(node.right, successor.value);
        if (node.right) node.right.parent = node;
      }
      return node;
    };

    this.root = deleteNode(this.root, val);
    steps.push({
      description: `Deletion of ${val} completed.`,
      activeId: null,
      nodes: this.cloneTree(),
      highlightedIds: new Set(),
    });
    return { root: this.root, steps };
  }

  positionTree(node, x, y, rangeX, level = 0) {
    if (!node) return;
    node.x = x;
    node.y = y;
    const nextY = y + 70;
    const offset = rangeX / 2;
    this.positionTree(node.left, x - offset, nextY, offset, level + 1);
    this.positionTree(node.right, x + offset, nextY, offset, level + 1);
  }

  cloneTree() {
    const clone = (node) => {
      if (!node) return null;
      const n = new TreeNode(node.id, node.value);
      n.x = node.x;
      n.y = node.y;
      n.state = node.state;
      n.left = clone(node.left);
      n.right = clone(node.right);
      if (n.left) n.left.parent = n;
      if (n.right) n.right.parent = n;
      return n;
    };
    return clone(this.root);
  }

  getFlatNodesAndEdges(root = this.root) {
    const nodes = [];
    const edges = [];
    const traverse = (node) => {
      if (!node) return;
      nodes.push(node);
      if (node.left) {
        edges.push({ source: node, target: node.left });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ source: node, target: node.right });
        traverse(node.right);
      }
    };
    traverse(root);
    return { nodes, edges };
  }

  generatePrefilledTree() {
    this.clear();
    const values = [15, 8, 22, 4, 11, 18, 27, 2, 6, 9, 13, 16, 20, 24, 30];
    for (const v of values) {
      this.insert(v);
    }
    this.positionTree(this.root, 400, 60, 200);
  }

  generateRandomTree(nodeCount) {
    this.clear();
    const usedValues = new Set();
    for (let i = 0; i < nodeCount; i++) {
      let val;
      do {
        val = 1 + Math.floor(Math.random() * 99);
      } while (usedValues.has(val));
      usedValues.add(val);
      this.insert(val);
    }
    this.autoLayout();
  }

  /* ── Canvas-positioned API (matches GraphModel UX) ── */

  autoLayout() {
    // Lay out nodes in a tidy BFS pattern centered at (400, 60) if any node
    // lacks an explicit position. Falls back to full auto-layout if root is
    // unpositioned.
    if (!this.root) return;
    if (this.root.x === 0 && this.root.y === 0) {
      this.positionTree(this.root, 400, 60, 200);
    }
  }

  addNodeAt(value, x, y) {
    const newNode = new TreeNode(this.nodeCounter++, value);
    newNode.x = x;
    newNode.y = y;

    if (!this.root) {
      this.root = newNode;
      return newNode;
    }

    let curr = this.root;
    while (true) {
      if (value < curr.value) {
        if (!curr.left) {
          curr.left = newNode;
          newNode.parent = curr;
          return newNode;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = newNode;
          newNode.parent = curr;
          return newNode;
        }
        curr = curr.right;
      }
    }
  }

  getNodeAt(x, y) {
    // Depth-first search; nodes returned as plain references
    const stack = this.root ? [this.root] : [];
    while (stack.length) {
      const node = stack.pop();
      if (node.contains(x, y)) return node;
      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }
    return null;
  }

  setNodePosition(node, x, y) {
    node.x = x;
    node.y = y;
  }

  removeNode(node) {
    if (!node) return;
    // Standard BST deletion preserving ordering.
    // 1) If leaf or one child: splice the node out.
    // 2) If two children: replace value with in-order successor,
    //    then delete the successor from the right subtree.
    if (!node.left || !node.right) {
      const replacement = node.left || node.right;
      if (node.parent) {
        if (node.parent.left === node) node.parent.left = replacement;
        else node.parent.right = replacement;
      } else {
        this.root = replacement;
      }
      if (replacement) replacement.parent = node.parent;
      return;
    }

    // Two children: find in-order successor (smallest in right subtree)
    let successor = node.right;
    while (successor.left) successor = successor.left;

    // Inherit successor's value (preserve BST property of the *structure*)
    node.value = successor.value;
    node.label = successor.label;

    // Splice successor out of the right subtree
    if (successor.parent.left === successor) {
      successor.parent.left = successor.right;
    } else {
      successor.parent.right = successor.right;
    }
    if (successor.right) successor.right.parent = successor.parent;
  }

  clearAllStates() {
    const walk = (n) => {
      if (!n) return;
      n.state = NodeState.UNVISITED;
      walk(n.left);
      walk(n.right);
    };
    walk(this.root);
  }
}
