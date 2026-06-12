import { useEffect, useRef } from "react";

/* ── Tiny self-running algorithm demos (no controls) ── */

function drawTree(ctx, w, h, nodes, edges, active, found) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(148,163,184,0.35)";
  for (const e of edges) {
    ctx.beginPath();
    ctx.moveTo(e.s.x, e.s.y);
    ctx.lineTo(e.t.x, e.t.y);
    ctx.stroke();
  }
  for (const n of nodes) {
    const isActive = n.id === active;
    const isFound = found && found.has(n.id);
    let fill = "#10b981";
    let border = "#047857";
    if (isActive) {
      fill = "#f59e0b";
      border = "#b45309";
    } else if (isFound) {
      fill = "#8b5cf6";
      border = "#6d28d9";
    }
    ctx.fillStyle = border;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.label, n.x, n.y);
  }
}

function buildTreeNodes(values) {
  // Layout tree based on a small fixed BST shape
  const positions = {
    0: { x: 60, y: 22 },
    1: { x: 30, y: 46 },
    2: { x: 90, y: 46 },
    3: { x: 15, y: 70 },
    4: { x: 45, y: 70 },
    5: { x: 75, y: 70 },
    6: { x: 105, y: 70 },
  };
  // Generate small BST and assign positions in BFS order
  const sorted = [...values].sort((a, b) => a - b).slice(0, 7);
  const nodes = sorted.map((v, i) => ({
    id: i,
    value: v,
    label: v.toString(),
    x: positions[i].x,
    y: positions[i].y,
  }));
  const edges = [];
  for (let i = 1; i < nodes.length; i++) {
    const parent = Math.floor((i - 1) / 2);
    edges.push({ s: nodes[parent], t: nodes[i] });
  }
  return { nodes, edges };
}

function MiniTreeSearch() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 120, h = 92;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const { nodes, edges } = buildTreeNodes([15, 8, 22, 4, 11, 18, 27]);
    let step = 0;
    const path = [0, 1, 4, 5];
    const target = 4; // node 4 will be the "found" highlight

    let raf;
    const tick = () => {
      const active = path[step % path.length];
      const found = new Set([target]);
      drawTree(ctx, w, h, nodes, edges, active, found);
      step++;
      raf = setTimeout(tick, 700);
    };
    tick();

    return () => clearTimeout(raf);
  }, []);
  return <canvas ref={ref} className="block" />;
}

function MiniGraphDFS() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 120, h = 92;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const nodes = [
      { id: 0, x: 30, y: 22 },
      { id: 1, x: 70, y: 18 },
      { id: 2, x: 100, y: 50 },
      { id: 3, x: 70, y: 78 },
      { id: 4, x: 18, y: 70 },
    ];
    const edges = [
      { s: 0, t: 1 },
      { s: 1, t: 2 },
      { s: 2, t: 3 },
      { s: 3, t: 4 },
      { s: 4, t: 0 },
    ];
    const order = [0, 1, 2, 3, 4];
    let step = 0;
    let raf;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const visited = new Set(order.slice(0, step + 1));
      const active = order[step % order.length];
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(148,163,184,0.4)";
      for (const e of edges) {
        ctx.beginPath();
        ctx.moveTo(nodes[e.s].x, nodes[e.s].y);
        ctx.lineTo(nodes[e.t].x, nodes[e.t].y);
        ctx.stroke();
      }
      for (const n of nodes) {
        let fill = "#10b981";
        let border = "#047857";
        if (n.id === active) {
          fill = "#f59e0b";
          border = "#b45309";
        } else if (visited.has(n.id) && n.id !== active) {
          fill = "#06b6d4";
          border = "#0891b2";
        }
        ctx.fillStyle = border;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      step++;
      raf = setTimeout(draw, 700);
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return <canvas ref={ref} className="block" />;
}

function MiniGraphDijkstra() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 120, h = 92;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const nodes = [
      { id: 0, x: 22, y: 22 },
      { id: 1, x: 60, y: 18 },
      { id: 2, x: 98, y: 40 },
      { id: 3, x: 90, y: 76 },
      { id: 4, x: 30, y: 76 },
    ];
    const edges = [
      { s: 0, t: 1, w: 2 },
      { s: 1, t: 2, w: 3 },
      { s: 2, t: 3, w: 1 },
      { s: 3, t: 4, w: 4 },
      { s: 4, t: 0, w: 2 },
      { s: 0, t: 2, w: 5 },
    ];
    // Simulate Dijkstra: each step shows a "current" node and an "in-path" edge
    const steps = [
      { active: 0, inPath: [{ s: 0, t: 1 }] },
      { active: 1, inPath: [{ s: 0, t: 1 }, { s: 1, t: 2 }] },
      { active: 2, inPath: [{ s: 0, t: 1 }, { s: 1, t: 2 }, { s: 2, t: 3 }] },
      { active: 3, inPath: [{ s: 0, t: 1 }, { s: 1, t: 2 }, { s: 2, t: 3 }, { s: 3, t: 4 }] },
      { active: 4, inPath: [{ s: 0, t: 1 }, { s: 1, t: 2 }, { s: 2, t: 3 }, { s: 3, t: 4 }, { s: 4, t: 0 }] },
    ];
    let step = 0;
    let raf;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const s = steps[step % steps.length];
      const inPathSet = new Set(s.inPath.map((e) => `${e.s}-${e.t}`));
      ctx.lineWidth = 1.2;
      for (const e of edges) {
        const isPath = inPathSet.has(`${e.s}-${e.t}`);
        ctx.strokeStyle = isPath ? "#ef4444" : "rgba(148,163,184,0.4)";
        ctx.lineWidth = isPath ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(nodes[e.s].x, nodes[e.s].y);
        ctx.lineTo(nodes[e.t].x, nodes[e.t].y);
        ctx.stroke();
      }
      for (const n of nodes) {
        const isActive = n.id === s.active;
        const fill = isActive ? "#f59e0b" : "#10b981";
        const border = isActive ? "#b45309" : "#047857";
        ctx.fillStyle = border;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      step++;
      raf = setTimeout(draw, 800);
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return <canvas ref={ref} className="block" />;
}

function MiniGraphTarjan() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 120, h = 92;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Two separate SCCs (triangle + line) and a bridge
    const nodes = [
      { id: 0, x: 22, y: 22 },
      { id: 1, x: 50, y: 50 },
      { id: 2, x: 22, y: 70 },
      { id: 3, x: 78, y: 22 },
      { id: 4, x: 100, y: 60 },
    ];
    const edges = [
      { s: 0, t: 1, bridge: false },
      { s: 1, t: 2, bridge: false },
      { s: 2, t: 0, bridge: false },
      { s: 0, t: 3, bridge: true },
      { s: 3, t: 4, bridge: true },
    ];
    const colors = ["#ec4899", "#8b5cf6", "#8b5cf6", "#f59e0b", "#f59e0b"];
    let phase = 0;
    let raf;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.4;
      for (const e of edges) {
        ctx.strokeStyle = e.bridge && phase >= 1 ? "#f43f5e" : "rgba(148,163,184,0.4)";
        ctx.lineWidth = e.bridge && phase >= 1 ? 2.4 : 1.2;
        ctx.beginPath();
        ctx.moveTo(nodes[e.s].x, nodes[e.s].y);
        ctx.lineTo(nodes[e.t].x, nodes[e.t].y);
        ctx.stroke();
      }
      for (let i = 0; i < nodes.length; i++) {
        ctx.fillStyle = "#1f2937";
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      phase = (phase + 1) % 3;
      raf = setTimeout(draw, 1100);
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return <canvas ref={ref} className="block" />;
}

function MiniSorting() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 120, h = 92;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Bubble sort mini demo
    const arr = [42, 17, 83, 6, 55, 31];
    const n = arr.length;
    const cellW = 14;
    const startX = (w - n * cellW) / 2;
    const maxVal = Math.max(...arr);

    let i = 0, j = 0;
    let raf;

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let k = 0; k < n; k++) {
        const x = startX + k * cellW;
        const hFrac = (arr[k] / maxVal) * 40;
        const isComparing = k === j || k === j + 1;
        const isSorted = k >= n - i;
        const fill = isSorted ? "#475569" : isComparing ? "#94a3b8" : "#64748b";
        const textColor = isSorted ? "#64748b" : "#e2e8f0";

        ctx.fillStyle = fill;
        const r = 3;
        const bx = x + 1, by = 10, bw = cellW - 2, bh = Math.max(hFrac, 6);
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.fillText(arr[k].toString(), x + cellW / 2, by + bh / 2);
      }

      // Bubble step
      if (j < n - 1 - i) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
        j++;
      } else {
        j = 0;
        i++;
        if (i >= n - 1) i = 0;
      }
      raf = setTimeout(draw, 500);
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return <canvas ref={ref} className="block" />;
}

export default function MiniPreview({ type }) {
  if (type === "tree") return <MiniTreeSearch />;
  if (type === "dfs") return <MiniGraphDFS />;
  if (type === "dijkstra") return <MiniGraphDijkstra />;
  if (type === "tarjan") return <MiniGraphTarjan />;
  if (type === "sorting") return <MiniSorting />;
  return null;
}
