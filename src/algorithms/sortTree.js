import { Vector } from "./adt";

function toPlain(arr) {
  if (arr instanceof Vector) return arr.toArray();
  return [...arr];
}

function buildTree(arr, left, right) {
  const values = arr.slice(left, right + 1);
  const node = {
    range: [left, right],
    values: values instanceof Vector ? values.toArray() : values,
    children: [],
    isLeaf: left >= right,
    depth: 0,
    x: 0,
    y: 0,
    width: 0,
    subtreeWidth: 0,
  };
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    node.children.push(buildTree(arr, left, mid));
    node.children.push(buildTree(arr, mid + 1, right));
  }
  return node;
}

export function buildMergeTree(arr) {
  const plain = toPlain(arr);
  return buildTree(plain, 0, plain.length - 1);
}

export function buildQuickTree(arr) {
  const plain = toPlain(arr);
  return buildTree(plain, 0, plain.length - 1);
}

export function isDivideAndConquer(algorithm) {
  return algorithm === "merge" || algorithm === "quick";
}

export function assignDepth(node, depth = 0) {
  node.depth = depth;
  for (const child of node.children) {
    assignDepth(child, depth + 1);
  }
}

// Layout: bottom-up tree layout
// Each node's "subtreeWidth" is the total horizontal span it occupies
// Node array width and children's subtree widths are considered,
// and siblings get a fixed gap between them regardless of depth.
// The parent is centered over its children's span.
export function computeLayout(node, boxW, boxG, siblingGap, levelH) {
  function computeSizes(n) {
    n.width = n.values.length * boxW + Math.max(0, n.values.length - 1) * boxG;
    n.y = n.depth * levelH;
    if (n.isLeaf) {
      n.subtreeWidth = n.width;
      return;
    }
    let sw = 0;
    for (let i = 0; i < n.children.length; i++) {
      computeSizes(n.children[i]);
      sw += n.children[i].subtreeWidth;
      if (i < n.children.length - 1) sw += siblingGap;
    }
    n.subtreeWidth = Math.max(n.width, sw);
  }
  computeSizes(node);

  function assignX(n, leftX) {
    n.x = leftX + n.subtreeWidth / 2;
    if (n.isLeaf) return;
    let cx = leftX;
    for (const child of n.children) {
      assignX(child, cx);
      cx += child.subtreeWidth + siblingGap;
    }
  }
  assignX(node, 0);
}

export function centerTree(node, padding) {
  let minX = Infinity;
  function walk(n) {
    minX = Math.min(minX, n.x - n.width / 2);
    for (const c of n.children) walk(c);
  }
  walk(node);
  const dx = padding - minX;
  function shift(n) {
    n.x += dx;
    for (const c of n.children) shift(c);
  }
  shift(node);
}

export function computeNodeStates(tree, stepData, sortedSet) {
  const map = new Map();
  function walk(node) {
    const [l, r] = node.range;
    const sortedCount = Array.from(sortedSet).filter((i) => i >= l && i <= r).length;
    let state = "inactive";
    if (sortedCount === node.values.length) {
      state = "done";
    } else if (stepData) {
      const activeRange = stepData.activeRange || null;
      const merging = stepData.merging || [];
      const pivot = stepData.pivot;
      if (activeRange && activeRange[0] === l && activeRange[1] === r) {
        state = "active";
      } else if (pivot !== null && pivot >= l && pivot <= r) {
        state = "active";
      } else if (merging.length > 0) {
        const mergeL = Math.min(...merging);
        const mergeR = Math.max(...merging);
        if (mergeL >= l && mergeR <= r && sortedCount > 0) state = "merge";
      }
    }
    map.set(node, state);
    for (const child of node.children) walk(child);
  }
  walk(tree);
  return map;
}

export const BOX_W = 30;
export const BOX_G = 4;
export const SIBLING_GAP = 48;
export const LEVEL_H = 80;
export const PAD = 40;
