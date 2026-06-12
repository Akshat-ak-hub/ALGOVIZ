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
  Database,
  Sparkles,
  Camera,
  HelpCircle,
  TreePine,
  Zap,
  Timer,
  Terminal,
  Plus,
  Minus,
} from "lucide-react";
import { BSTModel } from "../models/TreeModel";
import {
  buildTreeTraversals,
  buildTreeBFS,
  buildTreeHeightDiameter,
  buildTreeLCA,
  buildTreePathSum,
  buildTreeBinaryLifting,
} from "../algorithms/treeAlgorithms";
import CodePanel from "./CodePanel";
import { useToast } from "../hooks/useToast";

/* ── Speed label helper (Item 11) ── */
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
const DIM_STORAGE_KEY = "algoviz-dim-scale";
const clampDim = (v) => Math.max(DIM_MIN, Math.min(DIM_MAX, v));
const formatDim = (v) => `${Math.round(v * 100)}%`;

export default function TreeVisualizer() {
  const canvasRef = useRef(null);
  const bstRef = useRef(new BSTModel());
  const logContainerRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ width: 800, height: 320 });
  const { showToast } = useToast();

  const [activeAlgorithm, setActiveAlgorithm] = useState("traversals");
  const [traversalType, setTraversalType] = useState("inorder");
  const [targetSumValue, setTargetSumValue] = useState(25);
  const [lcaNodeAP, setLcaNodeAP] = useState("");
  const [lcaNodeAQ, setLcaNodeAQ] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [speedMs, setSpeedMs] = useState(500);
  const [nodeCountSetting, setNodeCountSetting] = useState(7);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

  const [nodesList, setNodesList] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
  const [visitedOutputList, setVisitedOutputList] = useState([]);
  const [liveQueueList, setLiveQueueList] = useState([]);
  const [heightsList, setHeightsList] = useState(new Map());
  const [diameterResult, setDiameterResult] = useState(0);
  const [liftingDataList, setLiftingDataList] = useState([]);

  const [executionLogs, setExecutionLogs] = useState([
    { text: "Tree editor initialized. Ready for operations.", type: "system" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [totalStepsCount, setTotalStepsCount] = useState(0);
  const [statusBannerText, setStatusBannerText] = useState("");
  const [currentCodeLine, setCurrentCodeLine] = useState(null);
  const [cursorMode, setCursorMode] = useState("default");

  const [dimensionScale, setDimensionScale] = useState(() => {
    try {
      const stored = parseFloat(localStorage.getItem(DIM_STORAGE_KEY));
      return Number.isFinite(stored) ? clampDim(stored) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const stepsTimelineRef = useRef([]);
  const playbackIndexRef = useRef(-1);
  const intervalIdRef = useRef(null);
  const selectedNodeRef = useRef(null);

  const syncTreeData = () => {
    const { nodes } = bstRef.current.getFlatNodesAndEdges();
    setNodesList(nodes);
  };

  const addLog = (text, type = "step") => {
    setExecutionLogs((prev) => [...prev, { text, type }]);
  };

  const clearLog = () => {
    setExecutionLogs([]);
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

  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = Math.max(rect.width - 2, 400);
    const h = 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvasSizeRef.current = { width: w, height: h };
    const z = cameraRef.current.zoom || 1;
    const s = dimensionScale;

    // Clear in screen space (reset transform first)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.scale(dpr, dpr);
    // Apply camera transform: translate then scale
    ctx.translate(cameraRef.current.x, cameraRef.current.y);
    ctx.scale(z, z);

    // Infinite Grid (in world coordinates)
    const gridSize = 40;
    const startX = Math.floor(-cameraRef.current.x / z / gridSize) * gridSize;
    const startY = Math.floor(-cameraRef.current.y / z / gridSize) * gridSize;
    const endX = (-cameraRef.current.x) / z + w / z + gridSize;
    const endY = (-cameraRef.current.y) / z + h / z + gridSize;

    ctx.strokeStyle = "#30363d";
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

    const { nodes, edges } = bstRef.current.getFlatNodesAndEdges();

    // Draw Edges
    ctx.strokeStyle = "#484f58";
    ctx.lineWidth = 2.5 * s;
    for (const edge of edges) {
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.stroke();
    }

    // Build set of node IDs currently in the queue (for BFS purple state)
    const queuedNodeIds = new Set();
    if (liveQueueList.length > 0) {
      for (const n of nodes) {
        if (liveQueueList.includes(n.value)) queuedNodeIds.add(n.id);
      }
    }

    // Draw Nodes — solid fill, state-driven colors
    for (const node of nodes) {
      const isCurrentlyActive = node.id === activeNodeId;
      const isHighlighted = highlightedNodeIds.has(node.id);
      const isQueued = queuedNodeIds.has(node.id) && !isCurrentlyActive && !isHighlighted;

      // State-driven palette
      let fill, border, textColor, glowColor;

      if (isCurrentlyActive) {
        fill = "#06B6D4"; border = "#67E8F9"; textColor = "#ffffff"; glowColor = "#06B6D4";
      } else if (isHighlighted) {
        fill = "#22C55E"; border = "#86EFAC"; textColor = "#ffffff"; glowColor = "#22C55E";
      } else if (isQueued) {
        fill = "#8B5CF6"; border = "#C4B5FD"; textColor = "#ffffff"; glowColor = "#8B5CF6";
      } else {
        fill = "#6B7280"; border = "#9CA3AF"; textColor = "#ffffff"; glowColor = null;
      }

      const r = 20 * s;

      // Reset shadow state before each node
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Glow for active states
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12 * s;
      }

      // Solid filled circle
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow before border
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Subtle border
      ctx.strokeStyle = border;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.stroke();

      // State label badge above node
      let stateLabel = null;
      if (isCurrentlyActive) stateLabel = "Current";
      else if (isHighlighted) stateLabel = "Visited";
      else if (isQueued) stateLabel = "In Queue";

      if (stateLabel) {
        const labelFontPx = 9 * s;
        ctx.font = `bold ${labelFontPx}px sans-serif`;
        const labelW = ctx.measureText(stateLabel).width;
        const labelX = node.x;
        const labelY = node.y - 28 * s;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(labelX - labelW / 2 - 4 * s, labelY - 6 * s, labelW + 8 * s, 13 * s, 3 * s);
        ctx.fill();

        ctx.fillStyle = border;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stateLabel, labelX, labelY);
      }

      // Node value label
      ctx.fillStyle = textColor;
      ctx.font = `bold ${13 * s}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);
    }

    ctx.restore();
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
    const clickedNode = bstRef.current.getNodeAt(pos.x, pos.y);

    if (e.button === 0 && clickedNode) {
      // Start dragging the node
      selectedNodeRef.current = clickedNode;
    }
  };

  const handleContextMenu = (e) => {
    if (isRunning) return;
    e.preventDefault();
    const pos = getCanvasMousePos(e);
    const clickedNode = bstRef.current.getNodeAt(pos.x, pos.y);
    if (clickedNode) {
      bstRef.current.removeNode(clickedNode);
      syncTreeData();
      addLog(`Deleted Node ${clickedNode.value}`, "system");
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
      drawTree();
      return;
    }

    if (selectedNodeRef.current) {
      const pos = getCanvasMousePos(e);
      bstRef.current.setNodePosition(selectedNodeRef.current, pos.x, pos.y);
      drawTree();
    }
  };

  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setCursorMode("default");
    }
    selectedNodeRef.current = null;
  };

  const handleMouseLeave = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setCursorMode("default");
    }
    selectedNodeRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;

    const z = cameraRef.current.zoom || 1;
    const intensity = e.ctrlKey ? 0.01 : 0.0015;
    const delta = -e.deltaY * intensity;
    const newZoom = Math.min(3, Math.max(0.25, z * Math.exp(delta)));

    const worldX = (mouseScreenX - cameraRef.current.x) / z;
    const worldY = (mouseScreenY - cameraRef.current.y) / z;
    cameraRef.current.x = mouseScreenX - worldX * newZoom;
    cameraRef.current.y = mouseScreenY - worldY * newZoom;
    cameraRef.current.zoom = newZoom;
    drawTree();
  };

  const handleBSTAction = (action) => {
    if (isRunning) return;
    const val = parseInt(inputValue, 10);
    if (Number.isNaN(val)) {
      showToast("Please enter a valid numeric value!", "warning");
      return;
    }
    setInputValue("");

    resetVisualStates();

    if (action === "insert") {
      const result = bstRef.current.insert(val);
      bstRef.current.positionTree(bstRef.current.root, 400, 60, 200);
      syncTreeData();
      triggerTimeline(result.steps);
    } else if (action === "search") {
      const steps = bstRef.current.search(val);
      triggerTimeline(steps);
    } else if (action === "delete") {
      const result = bstRef.current.delete(val);
      bstRef.current.positionTree(bstRef.current.root, 400, 60, 200);
      syncTreeData();
      triggerTimeline(result.steps);
    }
  };

  // Tree Editor Buttons
  const clearTree = () => {
    if (isRunning) return;
    bstRef.current.clear();
    syncTreeData();
    resetVisualStates();
    addLog("Tree cleared successfully.", "success");
  };

  const generateRandomTree = () => {
    if (isRunning) return;
    const count = parseInt(nodeCountSetting, 10) || 7;
    bstRef.current.generateRandomTree(count);
    syncTreeData();
    resetVisualStates();
    addLog(`Generated random BST with ${count} nodes.`, "success");
  };

  const generatePrefilledTree = () => {
    if (isRunning) return;
    bstRef.current.generatePrefilledTree();
    syncTreeData();
    resetVisualStates();
    addLog("Loaded prefilled balanced BST.", "success");
  };

  const runTreeAlgorithm = () => {
    if (!bstRef.current.root) {
      showToast("Tree is empty! Add some nodes first.", "warning");
      return;
    }

    resetVisualStates();

    let steps = [];
    if (activeAlgorithm === "traversals") {
      steps = buildTreeTraversals(bstRef.current.root, traversalType);
    } else if (activeAlgorithm === "bfs") {
      steps = buildTreeBFS(bstRef.current.root);
    } else if (activeAlgorithm === "height") {
      steps = buildTreeHeightDiameter(bstRef.current.root);
    } else if (activeAlgorithm === "lca") {
      steps = buildTreeLCA(bstRef.current.root, parseInt(lcaNodeAP, 10), parseInt(lcaNodeAQ, 10));
    } else if (activeAlgorithm === "pathsum") {
      steps = buildTreePathSum(bstRef.current.root, parseInt(targetSumValue, 10));
    } else if (activeAlgorithm === "lifting") {
      steps = buildTreeBinaryLifting(bstRef.current.root);
    }

    triggerTimeline(steps);
  };

  const triggerTimeline = (steps) => {
    if (steps.length === 0) return;
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
        setIsRunning(false);
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
    setActiveNodeId(step.activeId);
    setHighlightedNodeIds(step.highlightedIds || new Set());
    setCurrentCodeLine(step.codeLine ?? null);
    addLog(step.description, "step");
    setStatusBannerText(step.description);

    if (step.visitedValues) setVisitedOutputList(step.visitedValues);
    if (step.queue) setLiveQueueList(step.queue);
    if (step.heights) setHeightsList(step.heights);
    if (step.maxDiameter !== undefined) setDiameterResult(step.maxDiameter);
    if (step.liftTableData) setLiftingDataList(step.liftTableData);
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
    if (playbackIndexRef.current >= steps.length - 1) return;
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

  const resetVisualStates = () => {
    clearRunningInterval();
    setActiveNodeId(null);
    setHighlightedNodeIds(new Set());
    setVisitedOutputList([]);
    setLiveQueueList([]);
    setHeightsList(new Map());
    setLiftingDataList([]);
    setCurrentCodeLine(null);
    setIsRunning(false);
    setIsPlaying(false);
    clearLog();
    addLog("States reset. Editor active.", "system");
    drawTree();
  };

  /* ── Screenshot (Item 15) ── */
  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `tree-snapshot-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Screenshot saved!", "success");
  };

  /* ── Effects (placed after all function declarations) ── */

  useEffect(() => {
    bstRef.current.generatePrefilledTree();
    syncTreeData();

    return () => clearRunningInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    drawTree();
  }, [nodesList, activeNodeId, highlightedNodeIds, dimensionScale, liveQueueList]);

  useEffect(() => {
    try {
      localStorage.setItem(DIM_STORAGE_KEY, dimensionScale.toString());
    } catch {}
  }, [dimensionScale]);

  useEffect(() => {
    drawTree();
    const onResize = () => drawTree();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearRunningInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  // Set default LCA targets when tree shape changes.
  // This is a legitimate "derive state from props/state" pattern; React 19's
  // compiler rule flags it but the standard approach for syncing a state
  // initialization to a derived value is to commit it in an effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (nodesList.length > 1) {
      setLcaNodeAP(nodesList[0].value.toString());
      setLcaNodeAQ(nodesList[nodesList.length - 1].value.toString());
    } else {
      setLcaNodeAP("");
      setLcaNodeAQ("");
    }
  }, [nodesList]);

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
        resetVisualStates();
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

  const progressPercent = totalStepsCount > 0 ? (currentStepIdx / totalStepsCount) * 100 : 0;

  const activeLegendStates = (() => {
    if (!isRunning) return new Set(["unvisited", "current", "visited"]);
    const active = new Set(["unvisited"]);
    if (activeNodeId !== null) active.add("current");
    if (highlightedNodeIds.size > 0) active.add("visited");
    if (liveQueueList.length > 0) active.add("queued");
    return active;
  })();

  return (
    <div className="bg-bp-950 min-h-[calc(100vh-68px)] flex flex-col lg:flex-row p-4 gap-4 overflow-hidden select-none font-sans">
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-[300px] xl:w-[320px] flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-100px)] flex-shrink-0 pr-1 min-w-0">
        
        {/* BST Key Controls Card */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-bp-800 pb-2 flex items-center gap-1.5">
            <Database size={13} className="text-accent" />
            BST Operations
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter node value"
              className="w-full bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 outline-none text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleBSTAction("insert")}
              className="bg-[#3fb950]/10 hover:bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/20 font-bold text-[10px] py-2 rounded-md cursor-pointer transition duration-200"
            >
              Insert
            </button>
            <button
              onClick={() => handleBSTAction("search")}
              className="bg-accent-muted hover:bg-[#1f6feb]/20 text-accent border border-accent/20 font-bold text-[10px] py-2 rounded-md cursor-pointer transition duration-200"
            >
              Search
            </button>
            <button
              onClick={() => handleBSTAction("delete")}
              className="bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/20 font-bold text-[10px] py-2 rounded-md cursor-pointer transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tree Editor Panel */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-bp-800 pb-2 flex items-center gap-1.5">
            <Activity size={13} className="text-accent" />
            Tree Editor
          </h2>
          <div className="flex items-center justify-between gap-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node Count</label>
            <input
              type="number"
              min="3"
              max="15"
              value={nodeCountSetting}
              onChange={(e) => setNodeCountSetting(e.target.value)}
              disabled={isRunning}
              className="w-16 bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-2 py-1 text-center outline-none"
            />
          </div>
          <button
            onClick={generateRandomTree}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-1.5 bg-accent-emphasis hover:bg-[#1f6feb]/90 text-white font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition duration-200"
          >
            <Shuffle size={12} />
            Random Tree
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={generatePrefilledTree}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 bg-bp-800 hover:bg-bp-750 text-slate-200 font-bold text-[10px] py-2 px-2 rounded-md cursor-pointer transition duration-200 border border-bp-700"
            >
              Prefilled Tree
            </button>
            <button
              onClick={clearTree}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/20 font-bold text-[10px] py-2 px-2 rounded-md cursor-pointer transition duration-200"
            >
              <Trash2 size={11} />
              Clear Tree
            </button>
          </div>
        </div>

        {/* Tree Algorithms Selection */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-bp-800 pb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-accent" />
            Tree Algorithm
          </h2>
          <select
            value={activeAlgorithm}
            onChange={(e) => setActiveAlgorithm(e.target.value)}
            className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none"
          >
            <option value="traversals">DFS Traversals (In/Pre/Post)</option>
            <option value="bfs">BFS / Level-Order</option>
            <option value="height">Height & Diameter</option>
            <option value="lca">Lowest Common Ancestor (LCA)</option>
            <option value="pathsum">Root-to-Leaf Path Sum</option>
            <option value="lifting">Binary Lifting Ancestors</option>
          </select>

          {activeAlgorithm === "traversals" && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">DFS Type</label>
              <div className="grid grid-cols-3 gap-1">
                {["preorder", "inorder", "postorder"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTraversalType(mode)}
                    className={`text-[9px] py-1.5 font-bold rounded-md capitalize cursor-pointer border transition-all duration-200 ${
                      traversalType === mode
                        ? "bg-accent-muted border-accent/30 text-accent"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAlgorithm === "lca" && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Node P</label>
                <select
                  value={lcaNodeAP}
                  onChange={(e) => setLcaNodeAP(e.target.value)}
                  className="bg-bp-950 border border-bp-700 rounded text-slate-300 text-xs p-1.5"
                >
                  {nodesList.map((n) => (
                    <option key={n.id} value={n.value}>
                      {n.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Node Q</label>
                <select
                  value={lcaNodeAQ}
                  onChange={(e) => setLcaNodeAQ(e.target.value)}
                  className="bg-bp-950 border border-bp-700 rounded text-slate-300 text-xs p-1.5"
                >
                  {nodesList.map((n) => (
                    <option key={n.id} value={n.value}>
                      {n.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeAlgorithm === "pathsum" && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target Sum</label>
              <input
                type="number"
                value={targetSumValue}
                onChange={(e) => setTargetSumValue(e.target.value)}
                className="bg-bp-950 border border-bp-700 rounded text-slate-300 text-xs p-1.5 text-center"
              />
            </div>
          )}

          <button
            onClick={runTreeAlgorithm}
            className="w-full flex items-center justify-center gap-1.5 bg-[#3fb950] hover:bg-[#3fb950]/90 text-white font-bold text-xs py-2.5 px-4 rounded-md cursor-pointer mt-1 transition duration-200 border border-[#3fb950]/20"
          >
            <Play size={12} />
            Run Visualization
          </button>
        </div>

        {/* Speed Controls Slider */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Playback speed</label>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-bp-800 rounded appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><Zap size={11} /> Fast</span>
            <span className="bg-bp-950 border border-bp-700 px-2 py-0.5 rounded text-accent">{getSpeedLabel(speedMs)} · {speedMs}ms</span>
            <span className="flex items-center gap-1"><Timer size={11} /> Slow</span>
          </div>
        </div>

        {/* Display Size Controls */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Node &amp; label size</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDimensionScale((v) => clampDim(v - DIM_STEP))}
              disabled={dimensionScale <= DIM_MIN + 1e-6}
              title="Decrease size"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-bp-800 hover:bg-bp-750 disabled:opacity-30 disabled:hover:bg-bp-800 text-slate-200 cursor-pointer transition duration-200 rounded-md border border-bp-700"
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
              className="flex-1 h-1 bg-bp-800 appearance-none cursor-pointer accent-accent"
            />
            <button
              onClick={() => setDimensionScale((v) => clampDim(v + DIM_STEP))}
              disabled={dimensionScale >= DIM_MAX - 1e-6}
              title="Increase size"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-bp-800 hover:bg-bp-750 disabled:opacity-30 disabled:hover:bg-bp-800 text-slate-200 cursor-pointer transition duration-200 rounded-md border border-bp-700"
            >
              <Plus size={13} />
            </button>
            <span className="bg-bp-950 border border-bp-700 px-2 py-0.5 rounded text-accent tabular-nums text-[10px] font-bold">{formatDim(dimensionScale)}</span>
          </div>
        </div>

        {/* Playback Progress Slider */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm mb-2">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
            <span>Progress</span>
            <span className="text-accent font-mono text-[9px]">{currentStepIdx}/{totalStepsCount}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={stepBackward}
              disabled={currentStepIdx <= 1}
              className="flex items-center justify-center bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 font-bold text-xs p-2 rounded-md cursor-pointer transition duration-200 border border-bp-700"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={togglePlayPause}
              className="flex-1 flex items-center justify-center gap-1 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white font-bold text-xs py-2 px-2 rounded-md cursor-pointer transition duration-200 border border-accent-emphasis"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={stepForward}
              disabled={currentStepIdx >= totalStepsCount}
              className="flex items-center justify-center bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 font-bold text-xs p-2 rounded-md cursor-pointer transition duration-200 border border-bp-700"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={totalStepsCount}
              value={currentStepIdx}
              onChange={(e) => seekToStep(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-bp-800 rounded appearance-none cursor-pointer accent-accent"
            />
          </div>
          <button
            onClick={resetVisualStates}
            className="w-full flex items-center justify-center gap-1.5 bg-[#f85149]/10 border border-[#f85149]/30 hover:bg-[#f85149]/20 text-[#f85149] font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition duration-200"
          >
            <RotateCcw size={12} />
            Clear Visualization
          </button>
        </div>

        {/* Legend */}
        <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-2.5 shadow-sm flex-shrink-0 mb-2">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-bp-800 pb-2">
            Legend
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[
              { state: "unvisited", label: "Unvisited", color: "bg-[#6B7280] border border-[#9CA3AF]" },
              { state: "queued", label: "In Queue/Stack", color: "bg-[#8B5CF6] border border-[#C4B5FD]" },
              { state: "current", label: "Current", color: "bg-[#06B6D4] border border-[#67E8F9]" },
              { state: "visited", label: "Visited", color: "bg-[#22C55E] border border-[#86EFAC]" },
            ].map(({ state, label, color }) => {
              const isActive = activeLegendStates.has(state);
              return (
                <div key={state} className={`flex items-center gap-2 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-25"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-slate-400 font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Canvas & Separate Workspace for Tables/Results/Logs */}
      <main className="flex-grow flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1 min-w-0">
        {/* Canvas + Code Panel row */}
        <div className="flex flex-col lg:flex-row gap-4 min-w-0">
          {/* Canvas panel */}
          <div className="bg-bp-900 border border-bp-800 rounded-lg relative overflow-hidden shadow-inner flex flex-col justify-center items-center p-4 min-h-[300px] flex-1 min-w-0">
          {/* Step progress bar (Item 8) */}
          {isRunning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-bp-800 z-20">
              <div
                className="h-full bg-accent rounded-r transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
            className="block max-w-full"
          />

          {/* Canvas toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <div className="flex items-center bg-bp-950/80 backdrop-blur-sm border border-bp-800 rounded-md overflow-hidden">
              <button
                onClick={() => setDimensionScale((v) => clampDim(v - DIM_STEP))}
                disabled={dimensionScale <= DIM_MIN + 1e-6}
                title="Decrease node size"
                className="p-1.5 text-slate-400 hover:text-accent hover:bg-bp-800/60 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
              >
                <Minus size={12} />
              </button>
              <span className="px-1.5 text-[10px] font-bold text-accent tabular-nums min-w-[34px] text-center">
                {formatDim(dimensionScale)}
              </span>
              <button
                onClick={() => setDimensionScale((v) => clampDim(v + DIM_STEP))}
                disabled={dimensionScale >= DIM_MAX - 1e-6}
                title="Increase node size"
                className="p-1.5 text-slate-400 hover:text-accent hover:bg-bp-800/60 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
              >
                <Plus size={12} />
              </button>
            </div>
            <button
              onClick={captureScreenshot}
              title="Save screenshot"
              className="p-1.5 bg-bp-950/80 backdrop-blur-sm border border-bp-800 rounded-md text-slate-400 hover:text-accent hover:border-accent/30 cursor-pointer transition-all duration-200"
            >
              <Camera size={14} />
            </button>
            <button
              onClick={() => setShowHelpOverlay(!showHelpOverlay)}
              title="Canvas help"
              className={`p-1.5 bg-bp-950/80 backdrop-blur-sm border rounded-md cursor-pointer transition-all duration-200 ${
                showHelpOverlay ? "border-accent/30 text-accent" : "border-bp-800 text-slate-400 hover:text-accent hover:border-accent/30"
              }`}
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {/* Top Status Banner */}
          {isRunning && (
            <div className="absolute top-6 left-4 right-4 bg-bp-950/90 backdrop-blur-md border border-bp-800 rounded-md p-3 shadow-sm pointer-events-none z-10">
              <span className="text-xs font-bold text-amber-400 leading-relaxed block text-center">
                {statusBannerText}
              </span>
            </div>
          )}

          {/* Empty state + Help overlay (Items 5 + 10) */}
          {(nodesList.length === 0 || showHelpOverlay) && (
            <div className="absolute inset-0 bg-bp-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <div className="flex items-center gap-3 animate-gentle-pulse">
                <TreePine size={18} className="text-[#3fb950]" />
                <p className="text-sm font-semibold text-slate-300">
                  {nodesList.length === 0 ? "BST is currently empty" : "Tree Interactions"}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-400 mt-2">
                <p className="animate-gentle-pulse">• <strong className="text-[#3fb950]">Insert</strong> — Enter a number and click Insert</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.15s" }}>• <strong className="text-accent">Search</strong> — Enter a value to find in the BST</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.3s" }}>• <strong className="text-[#f85149]">Delete</strong> — Remove a node by value, or right-click a node</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.45s" }}>• <strong className="text-slate-300">Drag a node</strong> — Reposition it on the canvas</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.6s" }}>• <strong className="text-slate-400">Middle-click / Scroll</strong> — Pan · zoom the canvas</p>
              </div>
            </div>
          )}
        </div>

          {/* Code Panel */}
          <div className="w-full lg:w-[300px] xl:w-[380px] lg:flex-shrink-0 h-[300px] lg:h-auto">
            <CodePanel
              algorithm={activeAlgorithm}
              traversalType={traversalType}
              currentLine={currentCodeLine}
              title={
                activeAlgorithm === "search"
                  ? "BST Search"
                  : activeAlgorithm === "insert"
                    ? "BST Insert"
                    : activeAlgorithm === "delete"
                      ? "BST Delete"
                      : activeAlgorithm === "traversals"
                        ? `${traversalType.charAt(0).toUpperCase() + traversalType.slice(1)} Traversal`
                        : activeAlgorithm === "bfs"
                          ? "BFS Traversal"
                          : activeAlgorithm === "height"
                            ? "Height & Diameter"
                            : activeAlgorithm === "lca"
                              ? "Lowest Common Ancestor"
                              : activeAlgorithm === "pathsum"
                                ? "Path Sum"
                                : activeAlgorithm === "lifting"
                                  ? "Binary Lifting"
                                  : "Algorithm Code"
              }
            />
          </div>
        </div>

        {/* Keyboard shortcuts hint (Item 7) */}
        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-slate-500 bg-bp-900 border border-bp-800 rounded-lg px-3 py-1.5 flex-shrink-0 flex-wrap">
          <span><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">␣</kbd> Play/Pause</span>
          <span><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">←</kbd><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold ml-0.5">→</kbd> Step</span>
          <span><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">R</kbd> Reset</span>
          <span><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">MMB</kbd> Pan</span>
          <span><kbd className="bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">Scroll</kbd> Zoom</span>
        </div>

        {/* Dedicated Space for Tables and Results */}
        {(activeAlgorithm === "height" || activeAlgorithm === "lifting" || activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
          <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-bp-800 pb-2 flex items-center gap-1.5">
              <Table size={14} className="text-accent" />
              Algorithm Results & Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Traversal / Queue Output */}
              {(activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
                <div className="bg-bp-900 border border-bp-700 p-3 rounded-lg flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {activeAlgorithm === "bfs" ? "BFS Live Queue Front-to-Back" : `${traversalType} Traversal Output`}
                  </h4>
                  <div className="font-mono text-xs text-slate-200">
                    {activeAlgorithm === "bfs" ? (
                      <div className="bg-bp-950 border border-bp-700 p-2.5 rounded text-accent font-bold text-center">
                        {liveQueueList.length > 0 ? liveQueueList.join(" | ") : "Queue is empty"}
                      </div>
                    ) : (
                      <div className="bg-bp-950 border border-bp-700 p-2.5 rounded text-[#3fb950] font-bold text-center">
                        {visitedOutputList.length > 0 ? visitedOutputList.join(" → ") : "No traversal yet"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Height and Diameter Table */}
              {activeAlgorithm === "height" && (
                <div className="bg-bp-900 border border-bp-700 p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <div className="flex justify-between items-center border-b border-bp-700 pb-2 mb-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height Metric Analytics</h4>
                    <div className="text-[10px] text-slate-300">
                      Max Overall Diameter: <span className="text-accent font-bold">{diameterResult} edges</span>
                    </div>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 font-mono text-[10px]">
                    {[...nodesList].map((n) => (
                      <div key={n.id} className="bg-bp-950 border border-bp-700 rounded p-2 flex justify-between items-center">
                        <span className="text-slate-400">Node {n.value}:</span>
                        <span className="text-[#3fb950] font-bold">{heightsList.get(n.id) || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Binary Lifting Table */}
              {activeAlgorithm === "lifting" && liftingDataList.length > 0 && (
                <div className="bg-bp-900 border border-bp-700 p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Lifting Ancestors Jump Table (up[node_id][i] where power = 2^i)
                  </h4>
                  <div className="overflow-x-auto border border-bp-700 rounded bg-bp-950">
                    <table className="w-full text-[10px] text-center border-collapse font-mono">
                      <thead className="bg-bp-800 text-accent border-b border-bp-700 text-[8px] uppercase">
                        <tr>
                          <th className="p-2 text-left font-sans pl-3">Node Value</th>
                          <th className="p-2">2^0 Ancestor</th>
                          <th className="p-2">2^1 Ancestor</th>
                          <th className="p-2">2^2 Ancestor</th>
                          <th className="p-2">2^3 Ancestor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bp-700 text-slate-300">
                        {liftingDataList.map((row) => (
                          <tr key={row.nodeId} className="hover:bg-bp-800">
                            <td className="p-2 text-left pl-3 font-bold text-slate-400">{row.nodeVal}</td>
                            <td className="p-2">{row.up[0]}</td>
                            <td className="p-2">{row.up[1]}</td>
                            <td className="p-2">{row.up[2]}</td>
                            <td className="p-2">{row.up[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monospace Log */}
        <div className="bg-bp-900 border border-bp-700 rounded-lg flex flex-col h-[180px] overflow-hidden shadow-sm flex-shrink-0">
          <div className="bg-bp-950 border-b border-bp-700 px-4 py-2 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <Terminal size={13} className="text-accent" /> Live Tree Execution Log
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
            className="flex-grow bg-bp-950 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 text-slate-300"
          >
            {executionLogs.map((log, index) => {
              let textClass = "text-slate-400";
              if (log.type === "system") textClass = "text-slate-500";
              if (log.type === "highlight") textClass = "text-[#d29922]";
              if (log.type === "success") textClass = "text-[#3fb950] font-bold";
              if (log.type === "error") textClass = "text-[#f85149]";
              if (log.type === "path") textClass = "text-[#f85149]";

              return (
                <div key={index} className={`whitespace-pre-wrap ${textClass}`}>
                  {log.text}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
