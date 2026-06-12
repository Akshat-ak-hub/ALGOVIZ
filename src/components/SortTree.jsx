import { useMemo } from "react";
import {
  buildMergeTree,
  buildQuickTree,
  assignDepth,
  computeLayout,
  centerTree,
  computeNodeStates,
  BOX_W,
  BOX_G,
  SIBLING_GAP,
  LEVEL_H,
  PAD,
} from "../algorithms/sortTree";

const BOX_H = 38;
const HALF_H = BOX_H / 2;

const STATE_COLORS = {
  inactive: { fill: "#161b22", stroke: "#30363d", text: "#8b949e" },
  active: { fill: "#1f6feb", stroke: "#58a6ff", text: "#e6edf3" },
  merge: { fill: "#161b22", stroke: "#d29922", text: "#d29922" },
  done: { fill: "#161b22", stroke: "#3fb950", text: "#3fb950" },
};

function Edges({ node, nodeStates }) {
  if (node.isLeaf) return null;
  const cx = node.x;
  const cy = node.y;
  const bottomY = cy + HALF_H + 4;
  return (
    <>
      {node.children.map((child, i) => {
        const childTop = child.y - HALF_H - 4;
        const midY = (bottomY + childTop) / 2;
        const isActive = nodeStates.get(child) !== "inactive";
        return (
          <g key={i}>
            <path
              d={`M ${cx} ${bottomY} C ${cx} ${midY}, ${child.x} ${midY}, ${child.x} ${childTop}`}
              fill="none"
              stroke={isActive ? "#58a6ff" : "#30363d"}
              strokeWidth={1.5}
            />
          </g>
        );
      })}
      {node.children.map((child, i) => (
        <Edges key={`e-${i}`} node={child} nodeStates={nodeStates} />
      ))}
    </>
  );
}

function Node({ node, state, values }) {
  const colors = STATE_COLORS[state] || STATE_COLORS.inactive;
  const isDone = state === "done";
  const leftX = node.x - node.width / 2;
  const nodeY = node.y;

  return (
    <g opacity={isDone ? 0.5 : 1}>
      {values.map((val, i) => {
        const cx = leftX + i * (BOX_W + BOX_G) + BOX_W / 2;
        const x = cx - BOX_W / 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={nodeY - HALF_H}
              width={BOX_W}
              height={BOX_H}
              rx={5}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={1.2}
            />
            <text
              x={cx}
              y={nodeY + 5}
              textAnchor="middle"
              fill={colors.text}
              fontSize={12}
              fontWeight={700}
              fontFamily="monospace"
            >
              {val}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Nodes({ node, nodeStates }) {
  const state = nodeStates.get(node) || "inactive";
  return (
    <>
      <Node node={node} state={state} values={node.values} />
      {node.children.map((child, i) => (
        <Nodes key={`n-${i}`} node={child} nodeStates={nodeStates} />
      ))}
    </>
  );
}

export default function SortTree({ array, algorithm, stepData, sortedSet }) {
  const { tree, dims } = useMemo(() => {
    if (!array || array.length === 0) return { tree: null, dims: { width: 200, height: 100 } };

    const t = algorithm === "quick" ? buildQuickTree(array) : buildMergeTree(array);
    assignDepth(t);
    computeLayout(t, BOX_W, BOX_G, SIBLING_GAP, LEVEL_H);
    centerTree(t, PAD);

    let maxX = 0, maxD = 0;
    function walk(n) {
      maxX = Math.max(maxX, n.x + n.width / 2);
      maxD = Math.max(maxD, n.depth);
      for (const c of n.children) walk(c);
    }
    walk(t);

    const w = maxX + PAD;

    const topPad = BOX_H / 2 + 8;
    const bottomPad = PAD;
    const contentH = maxD * LEVEL_H + BOX_H / 2;
    const h = contentH + topPad + bottomPad;

    return {
      tree: t,
      dims: { width: w, height: h, offsetY: -topPad },
    };
  }, [array, algorithm]);

  const nodeStates = useMemo(() => {
    if (!tree) return new Map();
    return computeNodeStates(tree, stepData, sortedSet || new Set());
  }, [tree, stepData, sortedSet]);

  if (!tree) return null;

  const { width, height, offsetY } = dims;

  return (
    <div className="overflow-auto custom-scrollbar py-2" style={{ maxHeight: '520px' }}>
      <svg
        viewBox={`0 ${offsetY} ${width} ${height}`}
        style={{ minWidth: `${Math.max(width, 400)}px` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <Edges node={tree} nodeStates={nodeStates} />
        <Nodes node={tree} nodeStates={nodeStates} />
      </svg>
    </div>
  );
}
