import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Shuffle,
  Activity,
  Table,
  Sparkles,
  Network,
  Camera,
  HelpCircle,
  MousePointer,
  ArrowUpFromDot,
  Hand,
  Zap,
  Timer,
  Terminal,
  Move,
  Plus,
  Minus,
} from "lucide-react";
import { GraphModel, NodeState, EdgeState, Colors } from "../models/GraphModel";
import {
  runGraphDFS,
  runGraphBFS,
  runGraphTopo,
  runGraphCycleDetection,
  runGraphDSU,
  runGraphMSTKruskal,
  runGraphMSTPrim,
  runGraphBellmanFord,
  runGraphSCCKosaraju,
  runGraphTarjanBridges,
  runGraphDijkstra,
} from "../algorithms/graphAlgorithms";
import { useToast } from "../hooks/useToast";
import CodePanel from "./CodePanel";

/* ── Algorithm title lookup for the code panel header ── */
const ALGORITHM_TITLES = {
  dfs: "DFS Traversal",
  bfs: "BFS Traversal",
  topo: "Topological Sort (Kahn's)",
  cycle: "Cycle Detection",
  dsu: "DSU Operations",
  "mst-kruskal": "Kruskal's MST",
  "mst-prim": "Prim's MST",
  bellman: "Bellman-Ford",
  scc: "Kosaraju SCC",
  bridges: "Tarjan's Bridges",
  dijkstra: "Dijkstra's Algorithm",
};

/* ── Speed label helper ── */
const getSpeedLabel = (ms) => {
  if (ms <= 100) return "Lightning";
  if (ms <= 300) return "Fast";
  if (ms <= 600) return "Normal";
  if (ms <= 1200) return "Slow";
  return "Step-by-Step";
};

/* ── Dimension scale helper (display size) ── */
const DIM_MIN = 0.6;
const DIM_MAX = 1.8;
const DIM_STEP = 0.1;
const DIM_STORAGE_KEY = "algoviz-graph-dim-scale";
const clampDim = (v) => Math.max(DIM_MIN, Math.min(DIM_MAX, v));
const formatDim = (v) => `${Math.round(v * 100)}%`;

/* ── Node state label helper for canvas overlay (Item 12) ── */
const getNodeStateLabel = (state) => {
  switch (state) {
    case NodeState.CURRENT: return "Current";
    case NodeState.VISITED: return "Visited";
    case NodeState.IN_PATH: return "In Path";
    case NodeState.SPECIAL: return "Special";
    default: return null;
  }
};

export default function GraphVisualizer() {
  const canvasRef = useRef(null);
  const graphRef = useRef(new GraphModel());
  const logContainerRef = useRef(null);
  const { showToast } = useToast();

  const [activeAlgorithm, setActiveAlgorithm] = useState("dfs");
  const [sourceNodeId, setSourceNodeId] = useState("");
  const [destNodeId, setDestNodeId] = useState("all");
  const [nodeCountSetting, setNodeCountSetting] = useState(10);
  const [speedMs, setSpeedMs] = useState(500);
  const [isDirected, setIsDirected] = useState(false);

  const [nodesList, setNodesList] = useState([]);
  const [distanceMap, setDistanceMap] = useState(new Map());
  const [predecessorMap, setPredecessorMap] = useState(new Map());
  const [dsuParentsList, setDsuParentsList] = useState([]);
  const [dfnMap, setDfnMap] = useState(new Map());
  const [lowMap, setLowMap] = useState(new Map());
  const [executionLogs, setExecutionLogs] = useState([
    { text: "Graph engine loaded. Create nodes or choose an algorithm.", type: "system" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [totalStepsCount, setTotalStepsCount] = useState(0);
  const [statusBannerText, setStatusBannerText] = useState("");
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(5);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [currentCodeLine, setCurrentCodeLine] = useState(null);

  const pendingEdgeRef = useRef(null);
  const canvasSizeRef = useRef({ width: 800, height: 360 });
  const intervalIdRef = useRef(null);
  const playbackIndexRef = useRef(-1);
  const selectedNodeRef = useRef(null);
  const dragSourceNodeRef = useRef(null);
  const currentDragMousePosRef = useRef(null);
  const isShiftDraggingRef = useRef(false);
  const stepsTimelineRef = useRef([]);

  const isTransposedRef = useRef(false);

  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [cursorMode, setCursorMode] = useState("default");

  const [dimensionScale, setDimensionScale] = useState(() => {
    try {
      const stored = parseFloat(localStorage.getItem(DIM_STORAGE_KEY));
      return Number.isFinite(stored) ? clampDim(stored) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const syncNodes = () => {
    setNodesList([...graphRef.current.nodes]);
  };

  const addLog = (text, type = "step") => {
    setExecutionLogs((prev) => [...prev, { text, type }]);
  };

  const clearLog = () => {
    setExecutionLogs([]);
  };

  const handleDirectedToggle = (directed) => {
    setIsDirected(directed);
    resetVisualizer();
  };

  const getCanvasMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const z = cameraRef.current.zoom || 1;
    return {
      x: (e.clientX - rect.left - cameraRef.current.x) / z,
      y: (e.clientY - rect.top - cameraRef.current.y) / z,
    };
  };

  const getScreenMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (isRunning) return;

    if (e.button === 1) {
      e.preventDefault();
      const screenPos = getScreenMousePos(e);
      isPanningRef.current = true;
      panStartRef.current = { x: screenPos.x, y: screenPos.y };
      setCursorMode("grabbing");
      return;
    }

    const pos = getCanvasMousePos(e);
    const clickedNode = graphRef.current.getNodeAt(pos.x, pos.y);

    if (e.button === 2) {
      e.preventDefault();
      if (clickedNode) {
        graphRef.current.removeNode(clickedNode);
        addLog(`Deleted Node ${clickedNode.label}`, "system");
        syncNodes();
      }
      return;
    }

    if (e.button === 0) {
      if (clickedNode) {
        if (e.shiftKey) {
          dragSourceNodeRef.current = clickedNode;
          isShiftDraggingRef.current = true;
          currentDragMousePosRef.current = pos;
        } else {
          selectedNodeRef.current = clickedNode;
        }
      } else {
        const node = graphRef.current.addNode(pos.x, pos.y);
        addLog(`Added Node ${node.label} at (${Math.round(pos.x)}, ${Math.round(pos.y)})`, "system");
        syncNodes();
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isRunning) return;

    if (isPanningRef.current) {
      const screenPos = getScreenMousePos(e);
      const dx = screenPos.x - panStartRef.current.x;
      const dy = screenPos.y - panStartRef.current.y;
      panStartRef.current = { x: screenPos.x, y: screenPos.y };
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
      drawCanvas();
      return;
    }

    const pos = getCanvasMousePos(e);

    if (selectedNodeRef.current) {
      selectedNodeRef.current.x = pos.x;
      selectedNodeRef.current.y = pos.y;
      drawCanvas();
    } else if (isShiftDraggingRef.current) {
      currentDragMousePosRef.current = pos;
      drawCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (isRunning) return;

    if (isPanningRef.current) {
      isPanningRef.current = false;
      setCursorMode("default");
      return;
    }

    if (isShiftDraggingRef.current && dragSourceNodeRef.current) {
      const pos = getCanvasMousePos(e);
      const clickedNode = graphRef.current.getNodeAt(pos.x, pos.y);

      if (clickedNode && clickedNode.id !== dragSourceNodeRef.current.id) {
        pendingEdgeRef.current = { source: dragSourceNodeRef.current, target: clickedNode };
        setWeightInputValue(5);
        setIsWeightModalOpen(true);
      } else {
        cancelShiftDragging();
      }
    }
    selectedNodeRef.current = null;
  };

  const cancelShiftDragging = () => {
    isShiftDraggingRef.current = false;
    dragSourceNodeRef.current = null;
    currentDragMousePosRef.current = null;
    drawCanvas();
  };

  /* ── Wheel / trackpad pinch zoom (Item: zoom to cursor) ── */
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;

    const z = cameraRef.current.zoom || 1;
    // Trackpad pinch fires wheel with ctrlKey; treat as smaller deltaY
    const intensity = e.ctrlKey ? 0.01 : 0.0015;
    const delta = -e.deltaY * intensity;
    const newZoom = Math.min(3, Math.max(0.25, z * Math.exp(delta)));

    // Keep world point under cursor fixed:
    // worldX = (mouseScreenX - cameraX) / zoom  =>  cameraX = mouseScreenX - worldX * newZoom
    const worldX = (mouseScreenX - cameraRef.current.x) / z;
    const worldY = (mouseScreenY - cameraRef.current.y) / z;
    cameraRef.current.x = mouseScreenX - worldX * newZoom;
    cameraRef.current.y = mouseScreenY - worldY * newZoom;
    cameraRef.current.zoom = newZoom;
    drawCanvas();
  };

  const addEdgeWeightCancel = () => {
    setIsWeightModalOpen(false);
    pendingEdgeRef.current = null;
    cancelShiftDragging();
  };

  const addEdgeWeightConfirm = () => {
    if (pendingEdgeRef.current) {
      let weight = parseInt(weightInputValue, 10);
      if (isNaN(weight) || weight < 1) weight = 1;
      if (weight > 99) weight = 99;

      const edge = graphRef.current.addEdge(
        pendingEdgeRef.current.source,
        pendingEdgeRef.current.target,
        weight,
        isDirected
      );
      if (edge) {
        addLog(`Created edge (${pendingEdgeRef.current.source.label} ${isDirected ? "→" : "↔"} ${pendingEdgeRef.current.target.label}, w=${weight})`, "system");
      } else {
        addLog(`Edge already exists between Node ${pendingEdgeRef.current.source.label} and Node ${pendingEdgeRef.current.target.label}`, "error");
      }
    }
    setIsWeightModalOpen(false);
    pendingEdgeRef.current = null;
    cancelShiftDragging();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvasSizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const z = cameraRef.current.zoom || 1;
    const s = dimensionScale;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear in screen space (before camera transform)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Apply camera transform: translate then scale
    ctx.translate(cameraRef.current.x, cameraRef.current.y);
    ctx.scale(z, z);

    // Grid lines — infinite relative to camera
    const gridSize = 40;
    const startX = Math.floor(-cameraRef.current.x / z / gridSize) * gridSize;
    const startY = Math.floor(-cameraRef.current.y / z / gridSize) * gridSize;
    const endX = (-cameraRef.current.x) / z + width / z + gridSize;
    const endY = (-cameraRef.current.y) / z + height / z + gridSize;

    ctx.strokeStyle = Colors.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Edges
    for (const edge of graphRef.current.edges) {
      const u = isTransposedRef.current ? edge.target : edge.source;
      const v = isTransposedRef.current ? edge.source : edge.target;

      const strokeColor = Colors.edge[edge.state];
      const strokeWidth = edge.getStrokeWidth();

      if (edge.state === EdgeState.NORMAL) {
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10 * s;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * s;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Draw arrow head if directed
      if (isDirected) {
        const angle = Math.atan2(v.y - u.y, v.x - u.x);
        const nodeRadiusOffset = 25 * s;
        const arrowX = v.x - nodeRadiusOffset * Math.cos(angle);
        const arrowY = v.y - nodeRadiusOffset * Math.sin(angle);
        const arrowSize = 10 * s;

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.fill();
      }

      // Draw Edge Weight
      let midX = (u.x + v.x) / 2;
      let midY = (u.y + v.y) / 2;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        midX += (-dy / len) * 12 * s;
        midY += (dx / len) * 12 * s;
      }

      const text = edge.weight.toString();
      ctx.font = `normal ${11 * s}px sans-serif`;
      const txtW = ctx.measureText(text).width;

      ctx.fillStyle = "rgba(30, 30, 30, 0.9)";
      ctx.beginPath();
      ctx.roundRect(midX - txtW / 2 - 4 * s, midY - 6 * s - 2, txtW + 8 * s, 14 * s, 5 * s);
      ctx.fill();

      ctx.fillStyle = "#D0D0D0";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(text, midX, midY);
    }

    // Dragging Edge preview
    if (isShiftDraggingRef.current && dragSourceNodeRef.current && currentDragMousePosRef.current) {
      ctx.strokeStyle = Colors.edgeDrag;
      ctx.lineWidth = 1.8 * s;
      ctx.setLineDash([8 * s, 8 * s]);
      ctx.beginPath();
      ctx.moveTo(dragSourceNodeRef.current.x, dragSourceNodeRef.current.y);
      ctx.lineTo(currentDragMousePosRef.current.x, currentDragMousePosRef.current.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nodes
    for (const node of graphRef.current.nodes) {
      const { x, y } = node;
      let nodeColor = Colors.node[node.state];

      if (node.colorOverride) {
        nodeColor = { fill: node.colorOverride, border: "#111" };
      }

      if (node.state === NodeState.UNVISITED) {
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = nodeColor.fill;
        ctx.shadowBlur = 12 * s;
      }

      const outerR = 24 * s;
      const innerR = 21 * s;

      ctx.fillStyle = nodeColor.border;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, 2 * Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.fillStyle = nodeColor.fill;
      ctx.beginPath();
      ctx.arc(x, y, innerR, 0, 2 * Math.PI);
      ctx.fill();

      // DFN / LOW badges if Tarjan's is selected
      if (activeAlgorithm === "bridges" && dfnMap.has(node.id)) {
        const dfnVal = dfnMap.get(node.id);
        const lowVal = lowMap.get(node.id);
        const badgeStr = `${dfnVal}/${lowVal}`;
        ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
        ctx.beginPath();
        ctx.roundRect(x - 18 * s, y + 25 * s, 36 * s, 12 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = "#fb7185";
        ctx.font = `bold ${9 * s}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeStr, x, y + 31 * s);
      }

      // Node state label (Item 12)
      const stateLabel = getNodeStateLabel(node.state);
      if (stateLabel && !node.colorOverride) {
        ctx.font = `bold ${9 * s}px sans-serif`;
        const labelW = ctx.measureText(stateLabel).width;
        const labelX = x;
        const labelY = y - 32 * s;

        ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
        ctx.beginPath();
        ctx.roundRect(labelX - labelW / 2 - 5 * s, labelY - 6 * s, labelW + 10 * s, 13 * s, 4 * s);
        ctx.fill();

        ctx.fillStyle = nodeColor.fill;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stateLabel, labelX, labelY);
      }

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${13 * s}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, x, y - 1);
    }

    ctx.restore();
  };

  const runGraphAlgorithm = () => {
    if (graphRef.current.nodes.length === 0) {
      showToast("Please create a graph first!", "warning");
      return;
    }

    const startNode = graphRef.current.nodes.find(
      (n) => n.id.toString() === sourceNodeId.toString()
    );
    if (!startNode && (activeAlgorithm === "dfs" || activeAlgorithm === "bfs" || activeAlgorithm === "dijkstra" || activeAlgorithm === "bellman")) {
      showToast("Please select a valid source node!", "warning");
      return;
    }

    clearRunningInterval();
    graphRef.current.resetStates();
    isTransposedRef.current = false;

    let steps = [];
    if (activeAlgorithm === "dfs") {
      steps = runGraphDFS(graphRef.current.nodes, graphRef.current.edges, isDirected, startNode);
    } else if (activeAlgorithm === "bfs") {
      steps = runGraphBFS(graphRef.current.nodes, graphRef.current.edges, isDirected, startNode);
    } else if (activeAlgorithm === "dijkstra") {
      let endNode = null;
      if (destNodeId !== "all") {
        endNode = graphRef.current.nodes.find((n) => n.id.toString() === destNodeId.toString());
      }
      steps = runGraphDijkstra(
        graphRef.current.nodes,
        graphRef.current.edges,
        isDirected,
        startNode,
        endNode
      );
    } else if (activeAlgorithm === "topo") {
      steps = runGraphTopo(graphRef.current.nodes, graphRef.current.edges);
    } else if (activeAlgorithm === "cycle") {
      steps = runGraphCycleDetection(graphRef.current.nodes, graphRef.current.edges, isDirected);
    } else if (activeAlgorithm === "dsu") {
      steps = runGraphDSU(graphRef.current.nodes, graphRef.current.edges);
    } else if (activeAlgorithm === "mst-kruskal") {
      steps = runGraphMSTKruskal(graphRef.current.nodes, graphRef.current.edges);
    } else if (activeAlgorithm === "mst-prim") {
      steps = runGraphMSTPrim(graphRef.current.nodes, graphRef.current.edges);
    } else if (activeAlgorithm === "bellman") {
      steps = runGraphBellmanFord(graphRef.current.nodes, graphRef.current.edges, startNode);
    } else if (activeAlgorithm === "scc") {
      steps = runGraphSCCKosaraju(graphRef.current.nodes, graphRef.current.edges);
    } else if (activeAlgorithm === "bridges") {
      steps = runGraphTarjanBridges(graphRef.current.nodes, graphRef.current.edges);
    }

    stepsTimelineRef.current = steps;
    playbackIndexRef.current = 0;
    setTotalStepsCount(steps.length);
    setCurrentStepIdx(1);
    setIsRunning(true);
    setIsPlaying(true);
    clearLog();

    renderStep(0, steps);
    startRunningInterval(steps);
  };

  const startRunningInterval = (steps) => {
    intervalIdRef.current = setInterval(() => {
      const idx = playbackIndexRef.current;
      if (idx >= steps.length - 1) {
        clearRunningInterval();
        setIsPlaying(false);
        return;
      }
      playbackIndexRef.current = idx + 1;
      setCurrentStepIdx(idx + 2);
      renderStep(idx + 1, steps);
    }, speedMs);
  };

  const clearRunningInterval = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const renderStep = (idx, steps) => {
    const step = steps[idx];
    addLog(step.description, "step");
    setStatusBannerText(step.description);
    setCurrentCodeLine(step.codeLine ?? null);

    isTransposedRef.current = !!step.isTransposed;

    // Reset visual attributes
    for (const node of graphRef.current.nodes) {
      node.state = NodeState.UNVISITED;
      node.dfn = null;
      node.low = null;
      node.colorOverride = null;
    }
    for (const edge of graphRef.current.edges) edge.state = EdgeState.NORMAL;

    // Apply visited
    if (step.visited) {
      step.visited.forEach((nodeId) => {
        const node = graphRef.current.nodes.find((n) => n.id === nodeId);
        if (node) node.state = NodeState.VISITED;
      });
    }

    // Apply current node
    if (step.currentNode) {
      const node = graphRef.current.nodes.find((n) => n.id === step.currentNode.id);
      if (node) node.state = NodeState.CURRENT;
    }

    // Apply traversed path/tree edges
    if (step.traversedEdges) {
      step.traversedEdges.forEach((edgeId) => {
        const edge = graphRef.current.edges.find((e) => e.id === edgeId);
        if (edge) edge.state = EdgeState.IN_PATH;
      });
    }

    // Apply cycle edges
    if (step.cycleEdges) {
      step.cycleEdges.forEach((edgeId) => {
        const edge = graphRef.current.edges.find((e) => e.id === edgeId);
        if (edge) edge.state = EdgeState.IN_PATH;
      });
    }

    // Apply DFN / LOW values
    if (step.dfnMap) {
      setDfnMap(step.dfnMap);
      setLowMap(step.lowMap);
      // Highlight critical articulation nodes
      if (step.articulations) {
        step.articulations.forEach((nodeId) => {
          const node = graphRef.current.nodes.find((n) => n.id === nodeId);
          if (node) node.state = NodeState.SPECIAL;
        });
      }
      // Highlight bridges
      if (step.bridges) {
        step.bridges.forEach((edgeId) => {
          const edge = graphRef.current.edges.find((e) => e.id === edgeId);
          if (edge) edge.state = EdgeState.BRIDGE;
        });
      }
    }

    // Apply Kosaraju components
    if (step.componentsList) {
      step.componentsList.forEach((set, colorIdx) => {
        const compColor = Colors.components[colorIdx % Colors.components.length];
        set.forEach((nodeId) => {
          const node = graphRef.current.nodes.find((n) => n.id === nodeId);
          if (node) node.colorOverride = compColor;
        });
      });
    }

    // Set side tables maps
    if (step.distances) setDistanceMap(new Map(step.distances));
    if (step.predecessors) setPredecessorMap(new Map(step.predecessors));
    if (step.dsuTable) setDsuParentsList(step.dsuTable);

    syncNodes();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      clearRunningInterval();
      setIsPlaying(false);
      addLog("⏸ Playback paused.", "system");
    } else {
      setIsPlaying(true);
      addLog("▶ Playback resumed.", "system");
      startRunningInterval(stepsTimelineRef.current);
    }
  };

  const stepForward = () => {
    const steps = stepsTimelineRef.current;
    if (!steps || steps.length === 0 || playbackIndexRef.current >= steps.length - 1) return;

    clearRunningInterval();
    setIsPlaying(false);

    const nextIdx = playbackIndexRef.current + 1;
    playbackIndexRef.current = nextIdx;
    setCurrentStepIdx(nextIdx + 1);
    renderStep(nextIdx, steps);
  };

  /* ── Step backward (Item 7) ── */
  const stepBackward = () => {
    const steps = stepsTimelineRef.current;
    if (!steps || steps.length === 0 || playbackIndexRef.current <= 0) return;

    clearRunningInterval();
    setIsPlaying(false);

    const prevIdx = playbackIndexRef.current - 1;
    playbackIndexRef.current = prevIdx;
    setCurrentStepIdx(prevIdx + 1);
    renderStep(prevIdx, steps);
  };

  /* ── Scrubber seek (Item 9) ── */
  const seekToStep = (idx) => {
    const steps = stepsTimelineRef.current;
    if (!steps || steps.length === 0) return;

    clearRunningInterval();
    setIsPlaying(false);

    const clampedIdx = Math.max(0, Math.min(idx, steps.length - 1));
    playbackIndexRef.current = clampedIdx;
    setCurrentStepIdx(clampedIdx + 1);
    renderStep(clampedIdx, steps);
  };

  const resetVisualizer = () => {
    clearRunningInterval();
    graphRef.current.resetStates();
    isTransposedRef.current = false;

    setDistanceMap(new Map());
    setPredecessorMap(new Map());
    setDsuParentsList([]);
    setDfnMap(new Map());
    setLowMap(new Map());

    setIsRunning(false);
    setIsPlaying(false);
    setCurrentCodeLine(null);
    clearLog();
    addLog("States reset. Editor enabled.", "system");
    syncNodes();
  };

  const generateRandomGraph = () => {
    resetVisualizer();
    let count = parseInt(nodeCountSetting, 10);
    if (count < 4) count = 4;
    if (count > 25) count = 25;
    setNodeCountSetting(count);

    const { width, height } = canvasSizeRef.current;
    graphRef.current.generateRandom(count, width || 800, height || 360, isDirected);
    syncNodes();
    clearLog();
    addLog(`Generated random connected graph with ${count} nodes (${isDirected ? "directed" : "undirected"}).`, "system");
  };

  const clearGraph = () => {
    resetVisualizer();
    graphRef.current.clear();
    syncNodes();
    clearLog();
    addLog("Graph cleared.", "system");
  };

  /* ── Screenshot (Item 15) ── */
  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `graph-snapshot-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Screenshot saved!", "success");
  };

  /* ── Effects (placed after all function declarations) ── */

  useEffect(() => {
    drawCanvas();
  }, [nodesList, distanceMap, predecessorMap, dfnMap, lowMap, dimensionScale]);

  useEffect(() => {
    try {
      localStorage.setItem(DIM_STORAGE_KEY, dimensionScale.toString());
    } catch {}
  }, [dimensionScale]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const parentWidth = rect.width || 800;
      const parentHeight = 360;

      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      canvasSizeRef.current = { width: parentWidth, height: parentHeight };
      drawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateRandomGraph();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearRunningInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirected]);

  // Sync sourceNodeId to the first available node when the graph changes.
  // This is a legitimate "derive state from props/state" pattern; React 19's
  // strict rule flags it but the standard approach for syncing state
  // initialization to a derived value is to commit it in an effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (nodesList.length > 0) {
      if (!sourceNodeId || !nodesList.some((n) => n.id.toString() === sourceNodeId.toString())) {
        setSourceNodeId(nodesList[0].id.toString());
      }
    } else {
      setSourceNodeId("");
    }
  }, [nodesList, sourceNodeId]);

  /* ── Keyboard shortcuts (Item 7) ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === " ") {
        e.preventDefault();
        if (isRunning && currentStepIdx < totalStepsCount) togglePlayPause();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isRunning) stepForward();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRunning) stepBackward();
      }
      if (e.key === "r" || e.key === "R") {
        resetVisualizer();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setDimensionScale(1.0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPlaying, currentStepIdx, totalStepsCount]);

  /* ── Non-passive wheel listener so preventDefault() actually blocks page scroll ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wheelHandler = (e) => handleWheel(e);
    canvas.addEventListener("wheel", wheelHandler, { passive: false });
    return () => canvas.removeEventListener("wheel", wheelHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cursor mode to <body> via a controlled effect.
  useEffect(() => {
    document.body.style.cursor = cursorMode === "default" ? "" : cursorMode;
  }, [cursorMode]);

  /* ── Determine which legend items are active (Item 14) ── */
  const activeLegendStates = (() => {
    if (!isRunning) return new Set(["UNVISITED", "CURRENT", "VISITED", "IN_PATH"]);
    const active = new Set();
    for (const node of nodesList) {
      active.add(node.state);
    }
    return active;
  })();
  const progressPercent = totalStepsCount > 0 ? (currentStepIdx / totalStepsCount) * 100 : 0;

  return (
    <div className="bg-navy-950 min-h-[calc(100vh-68px)] flex flex-col lg:flex-row p-4 gap-4 overflow-hidden select-none font-sans">
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-[300px] xl:w-[320px] flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-100px)] flex-shrink-0 pr-1 min-w-0">
        
        {/* Toggle directed/undirected Graph type */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Graph Mode</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDirectedToggle(false)}
              className={`text-xs py-2 font-bold rounded-lg cursor-pointer border transition-all duration-200 ${
                !isDirected ? "bg-cyan-500/10 border-cyan-500/30 text-neon-cyan" : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Undirected
            </button>
            <button
              onClick={() => handleDirectedToggle(true)}
              className={`text-xs py-2 font-bold rounded-lg cursor-pointer border transition-all duration-200 ${
                isDirected ? "bg-cyan-500/10 border-cyan-500/30 text-neon-cyan" : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Directed
            </button>
          </div>
        </div>

        {/* Algorithm selection dropdown */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
            <Network size={13} className="text-neon-cyan" />
            Select Algorithm
          </h2>
          <select
            value={activeAlgorithm}
            onChange={(e) => setActiveAlgorithm(e.target.value)}
            className="bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none"
          >
            <optgroup label="Traversals & Order">
              <option value="dfs">DFS Traversal</option>
              <option value="bfs">BFS Traversal</option>
              <option value="topo">Topological Sort (Kahn's)</option>
            </optgroup>
            <optgroup label="Shortest Paths">
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="bellman">Bellman-Ford Algorithm</option>
            </optgroup>
            <optgroup label="Cycles & Subsets">
              <option value="cycle">Cycle Detection</option>
              <option value="dsu">DSU Operations</option>
            </optgroup>
            <optgroup label="Trees & Components">
              <option value="mst-kruskal">Kruskal's MST</option>
              <option value="mst-prim">Prim's MST</option>
              <option value="scc">Strongly Connected (Kosaraju)</option>
              <option value="bridges">Bridges & Articulations</option>
            </optgroup>
          </select>

          {/* Node selections if source node algorithm */}
          {(activeAlgorithm === "dfs" ||
            activeAlgorithm === "bfs" ||
            activeAlgorithm === "dijkstra" ||
            activeAlgorithm === "bellman" ||
            activeAlgorithm === "scc") && (
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Node</label>
                <select
                  value={sourceNodeId}
                  onChange={(e) => setSourceNodeId(e.target.value)}
                  disabled={isRunning}
                  className="bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer"
                >
                  {nodesList.length === 0 ? (
                    <option value="" disabled>No nodes available</option>
                  ) : (
                    nodesList.map((n) => (
                      <option key={n.id} value={n.id}>Node {n.label}</option>
                    ))
                  )}
                </select>
              </div>

              {activeAlgorithm === "dijkstra" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Destination</label>
                  <select
                    value={destNodeId}
                    onChange={(e) => setDestNodeId(e.target.value)}
                    disabled={isRunning}
                    className="bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer"
                  >
                    <option value="all">All nodes</option>
                    {nodesList.map((n) => (
                      <option key={n.id} value={n.id}>Node {n.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            onClick={runGraphAlgorithm}
            disabled={nodesList.length === 0}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Sparkles size={13} />
            Run Algorithm
          </button>
        </div>

        {/* Speed Controls */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Playback speed</label>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-navy-700 rounded appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><Zap size={11} /> Fast</span>
            <span className="bg-navy-950 border border-navy-600 px-2 py-0.5 rounded text-neon-cyan">{getSpeedLabel(speedMs)} · {speedMs}ms</span>
            <span className="flex items-center gap-1"><Timer size={11} /> Slow</span>
          </div>
        </div>

        {/* Display Size Controls */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Node &amp; label size</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDimensionScale((v) => clampDim(v - DIM_STEP))}
              disabled={dimensionScale <= DIM_MIN + 1e-6}
              title="Decrease size"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:hover:bg-navy-700 text-slate-200 cursor-pointer transition duration-200"
            >
              <Minus size={13} />
            </button>
            <input
              type="range"
              min={DIM_MIN * 100}
              max={DIM_MAX * 100}
              step={DIM_STEP * 100}
              value={dimensionScale * 100}
              onChange={(e) => setDimensionScale(clampDim(parseInt(e.target.value, 10) / 100))}
              className="flex-1 h-1 bg-navy-700 appearance-none cursor-pointer accent-cyan-500"
            />
            <button
              onClick={() => setDimensionScale((v) => clampDim(v + DIM_STEP))}
              disabled={dimensionScale >= DIM_MAX - 1e-6}
              title="Increase size"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:hover:bg-navy-700 text-slate-200 cursor-pointer transition duration-200"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
            <span>Small</span>
            <span className="bg-navy-950 border border-navy-600 px-2 py-0.5 text-neon-cyan tabular-nums">{formatDim(dimensionScale)}</span>
            <span>Large</span>
          </div>
        </div>

        {/* Control Button panel */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={stepBackward}
              disabled={!isRunning || currentStepIdx <= 1}
              className="flex items-center justify-center gap-1 bg-navy-700 hover:bg-navy-600 disabled:opacity-30 text-slate-300 font-bold text-xs py-2 px-2 rounded-lg cursor-pointer transition duration-200"
            >
              <ChevronLeft size={12} />
              Back
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isRunning || currentStepIdx >= totalStepsCount}
              className="flex items-center justify-center gap-1 bg-navy-700 hover:bg-navy-600 disabled:opacity-30 text-slate-300 font-bold text-xs py-2 px-2 rounded-lg cursor-pointer transition duration-200"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={stepForward}
              disabled={!isRunning || currentStepIdx >= totalStepsCount}
              className="flex items-center justify-center gap-1 bg-navy-700 hover:bg-navy-600 disabled:opacity-30 text-slate-300 font-bold text-xs py-2 px-2 rounded-lg cursor-pointer transition duration-200"
            >
              Next
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Step scrubber (Item 9) */}
          {isRunning && totalStepsCount > 0 && (
            <div className="flex flex-col gap-1.5">
              <input
                type="range"
                min="0"
                max={totalStepsCount - 1}
                value={Math.max(0, currentStepIdx - 1)}
                onChange={(e) => seekToStep(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-navy-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="text-center text-[9px] font-bold text-slate-500">
                Step {currentStepIdx} / {totalStepsCount}
              </div>
            </div>
          )}

          <button
            onClick={resetVisualizer}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 border border-rose-600/30 hover:bg-rose-600/20 text-rose-400 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <RotateCcw size={12} />
            Reset State
          </button>
        </div>

        {/* Graph Editor Controls */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
            <Activity size={13} className="text-neon-cyan" />
            Graph Editor
          </h2>
          <div className="flex items-center justify-between gap-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node Count</label>
            <input
              type="number"
              min="4"
              max="25"
              value={nodeCountSetting}
              onChange={(e) => setNodeCountSetting(e.target.value)}
              disabled={isRunning}
              className="w-16 bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-2 py-1 text-center outline-none"
            />
          </div>
          <button
            onClick={generateRandomGraph}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Shuffle size={12} />
            Random Graph
          </button>
          <button
            onClick={clearGraph}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-slate-200 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Trash2 size={12} />
            Clear Graph
          </button>
        </div>

        {/* Legend (Item 14 — synchronized) */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md flex-shrink-0 mb-2">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2">
            Legend
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${activeLegendStates.has("UNVISITED") ? "opacity-100" : "opacity-25"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span className="text-slate-400 font-medium">Unvisited</span>
            </div>
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${activeLegendStates.has("CURRENT") ? "opacity-100" : "opacity-25"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
              <span className="text-slate-400 font-medium">Current Node</span>
            </div>
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${activeLegendStates.has("VISITED") ? "opacity-100" : "opacity-25"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]" />
              <span className="text-slate-400 font-medium">Visited</span>
            </div>
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${activeLegendStates.has("IN_PATH") ? "opacity-100" : "opacity-25"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
              <span className="text-slate-400 font-medium">Tree Path</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas & Separate Dedicated Workspace for Tables & Logs */}
      <main className="flex-grow flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1 min-w-0">
        {/* Canvas + Code Panel row */}
        <div className="flex flex-col lg:flex-row gap-4 min-w-0">
        {/* Canvas panel */}
        <div className="bg-surface-overlay border border-navy-600 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-center items-center min-h-[320px] flex-1 min-w-0">
          {/* Step progress bar (Item 8) */}
          {isRunning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-600 z-20">
              <div
                className="h-full bg-cyan-500 rounded-r transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isPanningRef.current) {
                isPanningRef.current = false;
                setCursorMode("default");
              }
              selectedNodeRef.current = null;
              cancelShiftDragging();
            }}
            className="block max-w-full"
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Canvas toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <div className="flex items-center bg-navy-950/80 backdrop-blur-sm border border-navy-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setDimensionScale((v) => clampDim(v - DIM_STEP))}
                disabled={dimensionScale <= DIM_MIN + 1e-6}
                title="Decrease node size"
                className="p-1.5 text-slate-400 hover:text-neon-cyan hover:bg-navy-800/60 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
              >
                <Minus size={12} />
              </button>
              <span className="px-1.5 text-[10px] font-bold text-neon-cyan tabular-nums min-w-[34px] text-center">
                {formatDim(dimensionScale)}
              </span>
              <button
                onClick={() => setDimensionScale((v) => clampDim(v + DIM_STEP))}
                disabled={dimensionScale >= DIM_MAX - 1e-6}
                title="Increase node size"
                className="p-1.5 text-slate-400 hover:text-neon-cyan hover:bg-navy-800/60 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
              >
                <Plus size={12} />
              </button>
            </div>
            <button
              onClick={captureScreenshot}
              title="Save screenshot"
              className="p-1.5 bg-navy-950/80 backdrop-blur-sm border border-navy-600 rounded-lg text-slate-400 hover:text-neon-cyan hover:border-cyan-500/30 cursor-pointer transition-all duration-200"
            >
              <Camera size={14} />
            </button>
            <button
              onClick={() => setShowHelpOverlay(!showHelpOverlay)}
              title="Canvas help"
              className={`p-1.5 bg-navy-950/80 backdrop-blur-sm border rounded-lg cursor-pointer transition-all duration-200 ${
                showHelpOverlay ? "border-cyan-500/30 text-neon-cyan" : "border-navy-600 text-slate-400 hover:text-neon-cyan hover:border-cyan-500/30"
              }`}
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {/* Help Overlay when Canvas is empty OR help is toggled (Items 5 + 10) */}
          {(nodesList.length === 0 || showHelpOverlay) && (
            <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center pointer-events-none p-6 z-10">
              <div className="flex items-center gap-3 animate-gentle-pulse">
                <MousePointer size={16} className="text-neon-cyan" />
                <p className="text-sm font-semibold text-slate-300">
                  Click anywhere to add a Node
                </p>
              </div>
              <div className="flex items-center gap-3 animate-gentle-pulse" style={{ animationDelay: "0.15s" }}>
                <ArrowUpFromDot size={16} className="text-neon-cyan" />
                <p className="text-sm font-semibold text-slate-300">
                  Shift + Drag between nodes to connect Edges
                </p>
              </div>
              <div className="flex items-center gap-3 animate-gentle-pulse" style={{ animationDelay: "0.3s" }}>
                <Hand size={16} className="text-neon-cyan" />
                <p className="text-sm font-semibold text-slate-300">
                  Drag a node to reposition it
                </p>
              </div>
              <div className="flex items-center gap-3 animate-gentle-pulse" style={{ animationDelay: "0.45s" }}>
                <Trash2 size={16} className="text-rose-400" />
                <p className="text-sm font-semibold text-slate-300">
                  Right-click a node to delete it
                </p>
              </div>
              <div className="flex items-center gap-3 animate-gentle-pulse" style={{ animationDelay: "0.6s" }}>
                <Move size={16} className="text-neon-cyan" />
                <p className="text-sm font-semibold text-slate-300">
                  Middle-click + drag to pan · Scroll / pinch to zoom
                </p>
              </div>
              <div className="h-[1px] bg-navy-600 my-1 w-40" />
              <p className="text-neon-cyan font-bold text-sm">
                Or click "Random Graph" to auto-build!
              </p>
            </div>
          )}

          {/* Top Status execution banner */}
          {isRunning && (
            <div className="absolute top-6 left-4 right-4 bg-navy-950/90 backdrop-blur-md border border-navy-600 rounded-xl p-3 shadow-md pointer-events-none z-10">
              <span className="text-xs font-bold text-amber-400 leading-relaxed block text-center">
                {statusBannerText}
              </span>
            </div>
          )}
        </div>

          {/* Code Panel */}
          <div className="w-full lg:w-[300px] xl:w-[380px] lg:flex-shrink-0 h-[360px] lg:h-auto">
            <CodePanel
              algorithm={activeAlgorithm}
              currentLine={currentCodeLine}
              kind="graph"
              title={ALGORITHM_TITLES[activeAlgorithm] || "Algorithm Code"}
            />
          </div>
        </div>

        {/* Keyboard shortcuts hint (Item 7) */}
        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-slate-500 bg-navy-800/50 border border-navy-600/50 rounded-lg px-3 py-1.5 flex-shrink-0 flex-wrap">
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">␣</kbd> Play/Pause</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">←</kbd><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold ml-0.5">→</kbd> Step</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">R</kbd> Reset</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">MMB</kbd> Pan</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">Scroll</kbd> Zoom</span>
        </div>

        {/* Separate Workspace for DSU or Distance Tables (Requested by user to prevent overlaps) */}
        {((activeAlgorithm === "dsu" && dsuParentsList.length > 0) ||
          ((activeAlgorithm === "dijkstra" || activeAlgorithm === "bellman") && distanceMap.size > 0)) && (
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
              <Table size={14} className="text-neon-cyan" />
              Algorithm Results & Analytics
            </h3>

            <div className="w-full">
              {/* DSU Table */}
              {activeAlgorithm === "dsu" && dsuParentsList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Disjoint Set Union (DSU) Mapping
                  </h4>
                  <div className="overflow-x-auto border border-navy-600 rounded bg-navy-950 max-h-[200px]">
                    <table className="w-full text-[10px] text-center border-collapse font-mono">
                      <thead className="bg-navy-800 text-neon-cyan border-b border-navy-600 text-[8px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2 font-sans font-bold">Node Value</th>
                          <th className="p-2 font-sans font-bold">Representative Parent</th>
                          <th className="p-2 font-sans font-bold">Set Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-700 text-slate-300">
                        {dsuParentsList.map((row) => (
                          <tr key={row.nodeId} className="hover:bg-navy-700">
                            <td className="p-2 font-bold text-slate-400">{row.nodeVal}</td>
                            <td className="p-2 text-neon-cyan font-bold">{row.pVal}</td>
                            <td className="p-2">{row.rankVal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Shortest Path distance metrics table if Dijkstra/Bellman-Ford */}
              {(activeAlgorithm === "dijkstra" || activeAlgorithm === "bellman") && distanceMap.size > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Shortest Path Distances From Source Node
                  </h4>
                  <div className="overflow-x-auto border border-navy-600 rounded bg-navy-950 max-h-[200px]">
                    <table className="w-full text-[10px] text-left border-collapse font-mono">
                      <thead className="bg-navy-800 text-neon-cyan border-b border-navy-600 text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2 font-bold font-sans">Target Node</th>
                          <th className="p-2 font-bold font-sans">Computed Distance</th>
                          <th className="p-2 font-bold font-sans">Predecessor Node</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-700">
                        {[...nodesList]
                          .sort((a, b) => a.id - b.id)
                          .map((n) => {
                            const dist = distanceMap.get(n.id);
                            const distStr =
                              dist === Infinity || dist === undefined
                                ? "∞"
                                : Number.isInteger(dist)
                                ? dist.toString()
                                : dist.toFixed(1);

                            const prevId = predecessorMap.get(n.id);
                            let prevLabel = "—";
                            if (prevId !== null && prevId !== undefined) {
                              const pNode = nodesList.find((fn) => fn.id === prevId);
                              if (pNode) prevLabel = `Node ${pNode.label}`;
                            }

                            return (
                              <tr key={n.id} className="hover:bg-navy-700">
                                <td className="p-2 font-bold text-slate-300">Node {n.label}</td>
                                <td className={`p-2 font-bold ${dist === Infinity ? "text-slate-500" : "text-neon-cyan"}`}>
                                  {distStr}
                                </td>
                                <td className="p-2 text-slate-400">{prevLabel}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Execution Logs panel */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl flex flex-col h-[180px] overflow-hidden shadow-md flex-shrink-0">
          <div className="bg-navy-900 border-b border-navy-600 px-4 py-2 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <Terminal size={13} className="text-neon-cyan" /> Live Graph Execution Log
            </h3>
            <button
              onClick={clearLog}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors duration-150 cursor-pointer font-sans"
            >
              Clear Log
            </button>
          </div>

          <div
            ref={logContainerRef}
            className="flex-grow bg-navy-900 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 text-slate-300"
          >
            {executionLogs.map((log, index) => {
              let textClass = "text-slate-400";
              if (log.type === "system") textClass = "text-slate-500";
              if (log.type === "highlight") textClass = "text-amber-400";
              if (log.type === "success") textClass = "text-emerald-400 font-bold";
              if (log.type === "error") textClass = "text-rose-500";
              if (log.type === "path") textClass = "text-rose-400";

              return (
                <div key={index} className={`whitespace-pre-wrap ${textClass}`}>
                  {log.text}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Edge Weight modal overlay */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6 w-[280px] flex flex-col gap-4 shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm">Enter Edge Weight</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Specify path cost (1 to 99):
            </p>
            <input
              type="number"
              min="1"
              max="99"
              value={weightInputValue}
              onChange={(e) => setWeightInputValue(e.target.value)}
              className="w-full bg-navy-950 border border-navy-600 rounded-lg text-slate-100 text-xs px-3 py-2 outline-none text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter") addEdgeWeightConfirm();
                if (e.key === "Escape") addEdgeWeightCancel();
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={addEdgeWeightCancel}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-navy-700 rounded-lg cursor-pointer transition duration-150 font-sans"
              >
                Cancel
              </button>
              <button
                onClick={addEdgeWeightConfirm}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg cursor-pointer transition duration-150 font-sans"
              >
                Add Edge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
