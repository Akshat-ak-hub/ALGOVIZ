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
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSizeRef.current;
    const z = cameraRef.current.zoom || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear in screen space (reset transform first)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.scale(dpr, dpr);
    // Apply camera transform: translate then scale
    ctx.translate(cameraRef.current.x, cameraRef.current.y);
    ctx.scale(z, z);

    // Infinite Grid (in world coordinates)
    const gridSize = 40;
    const startX = Math.floor(-cameraRef.current.x / z / gridSize) * gridSize;
    const startY = Math.floor(-cameraRef.current.y / z / gridSize) * gridSize;
    const endX = (-cameraRef.current.x) / z + width / z + gridSize;
    const endY = (-cameraRef.current.y) / z + height / z + gridSize;

    ctx.strokeStyle = "#303030";
    ctx.lineWidth = 0.4;
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
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2.2;
    for (const edge of edges) {
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.stroke();
    }

    // Draw Nodes
    for (const node of nodes) {
      const isCurrentlyActive = node.id === activeNodeId;
      const isHighlighted = highlightedNodeIds.has(node.id);

      let fill = "#10b981"; // Emerald for normal
      let border = "#047857";
      let stateLabel = null;

      if (isCurrentlyActive) {
        fill = "#f59e0b"; // Orange active
        border = "#b45309";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
        stateLabel = "Current";
      } else if (isHighlighted) {
        fill = "#8b5cf6"; // Purple special
        border = "#6d28d9";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 12;
        stateLabel = "Found";
      }

      ctx.fillStyle = border;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0; // Reset

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 19, 0, 2 * Math.PI);
      ctx.fill();

      // Node state label (Item 12)
      if (stateLabel) {
        ctx.font = "bold 9px sans-serif";
        const labelW = ctx.measureText(stateLabel).width;
        const labelX = node.x;
        const labelY = node.y - 30;

        ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
        ctx.beginPath();
        ctx.roundRect(labelX - labelW / 2 - 5, labelY - 6, labelW + 10, 13, 4);
        ctx.fill();

        ctx.fillStyle = fill;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stateLabel, labelX, labelY);
      }

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y - 1);
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
  }, [nodesList, activeNodeId, highlightedNodeIds]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const parentWidth = rect.width || 800;
      canvasSizeRef.current = { width: parentWidth, height: 320 };
      drawTree();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    if (!isRunning) return new Set(["normal", "current", "found"]);
    const active = new Set(["normal"]);
    if (activeNodeId !== null) active.add("current");
    if (highlightedNodeIds.size > 0) active.add("found");
    return active;
  })();

  return (
    <div className="bg-navy-950 min-h-[calc(100vh-68px)] flex flex-col lg:flex-row p-4 gap-4 overflow-hidden select-none font-sans">
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-[320px] flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-100px)] flex-shrink-0 pr-1">
        
        {/* BST Key Controls Card */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
            <Database size={13} className="text-neon-cyan" />
            BST Operations
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter node value"
              className="w-full bg-navy-950 border border-navy-600 rounded-lg text-slate-100 text-xs px-3 py-2 outline-none text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleBSTAction("insert")}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 font-bold text-[10px] py-2 rounded-lg cursor-pointer transition duration-200"
            >
              Insert
            </button>
            <button
              onClick={() => handleBSTAction("search")}
              className="bg-cyan-600/20 hover:bg-cyan-600/30 text-neon-cyan border border-cyan-600/30 font-bold text-[10px] py-2 rounded-lg cursor-pointer transition duration-200"
            >
              Search
            </button>
            <button
              onClick={() => handleBSTAction("delete")}
              className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 font-bold text-[10px] py-2 rounded-lg cursor-pointer transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tree Editor Panel */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
            <Activity size={13} className="text-neon-cyan" />
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
              className="w-16 bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-2 py-1 text-center outline-none"
            />
          </div>
          <button
            onClick={generateRandomTree}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Shuffle size={12} />
            Random Tree
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={generatePrefilledTree}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-slate-200 font-bold text-[10px] py-2 px-2 rounded-lg cursor-pointer transition duration-200"
            >
              Prefilled Tree
            </button>
            <button
              onClick={clearTree}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 bg-rose-950/20 hover:bg-rose-950/30 text-rose-400 border border-rose-900/30 font-bold text-[10px] py-2 px-2 rounded-lg cursor-pointer transition duration-200"
            >
              <Trash2 size={11} />
              Clear Tree
            </button>
          </div>
        </div>

        {/* Tree Algorithms Selection */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-neon-cyan" />
            Tree Algorithm
          </h2>
          <select
            value={activeAlgorithm}
            onChange={(e) => setActiveAlgorithm(e.target.value)}
            className="bg-navy-950 border border-navy-600 rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none"
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
                    className={`text-[9px] py-1.5 font-bold rounded capitalize cursor-pointer border transition-all duration-200 ${
                      traversalType === mode
                        ? "bg-cyan-500/10 border-cyan-500/30 text-neon-cyan"
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
                  className="bg-navy-950 border border-navy-600 rounded text-slate-300 text-xs p-1.5"
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
                  className="bg-navy-950 border border-navy-600 rounded text-slate-300 text-xs p-1.5"
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
                className="bg-navy-950 border border-navy-600 rounded text-slate-300 text-xs p-1.5 text-center"
              />
            </div>
          )}

          <button
            onClick={runTreeAlgorithm}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer mt-1 transition duration-200"
          >
            <Play size={12} />
            Run Visualization
          </button>
        </div>

        {/* Speed Controls Slider */}
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

        {/* Playback Controls Panel */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md mb-2">
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
            onClick={resetVisualStates}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 border border-rose-600/30 hover:bg-rose-600/20 text-rose-400 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <RotateCcw size={12} />
            Reset State
          </button>
        </div>
        {/* Legend */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-2.5 shadow-md flex-shrink-0 mb-2">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2">
            Legend
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[
              { state: "normal", label: "Normal", color: "bg-emerald-500", shadow: "rgba(16,185,129,0.4)" },
              { state: "current", label: "Current Node", color: "bg-amber-500", shadow: "rgba(245,158,11,0.4)" },
              { state: "found", label: "Found/Visited", color: "bg-purple-500", shadow: "rgba(139,92,246,0.4)" },
            ].map(({ state, label, color, shadow }) => {
              const isActive = activeLegendStates.has(state);
              return (
                <div key={state} className={`flex items-center gap-2 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-25"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${color} ${isActive ? `shadow-[0_0_6px_${shadow}]` : ""}`} />
                  <span className="text-slate-400 font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Canvas & Separate Workspace for Tables/Results/Logs */}
      <main className="flex-grow flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
        {/* Canvas + Code Panel row */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Canvas panel */}
          <div className="bg-surface-overlay border border-navy-600 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-center items-center p-4 min-h-[300px] flex-1">
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
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
            className="block max-w-full"
          />

          {/* Canvas toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
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

          {/* Top Status Banner */}
          {isRunning && (
            <div className="absolute top-6 left-4 right-4 bg-navy-950/90 backdrop-blur-md border border-navy-600 rounded-xl p-3 shadow-md pointer-events-none z-10">
              <span className="text-xs font-bold text-amber-400 leading-relaxed block text-center">
                {statusBannerText}
              </span>
            </div>
          )}

          {/* Empty state + Help overlay (Items 5 + 10) */}
          {(nodesList.length === 0 || showHelpOverlay) && (
            <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <div className="flex items-center gap-3 animate-gentle-pulse">
                <TreePine size={18} className="text-emerald-400" />
                <p className="text-sm font-semibold text-slate-300">
                  {nodesList.length === 0 ? "BST is currently empty" : "Tree Interactions"}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-400 mt-2">
                <p className="animate-gentle-pulse">• <strong className="text-emerald-400">Insert</strong> — Enter a number and click Insert</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.15s" }}>• <strong className="text-neon-cyan">Search</strong> — Enter a value to find in the BST</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.3s" }}>• <strong className="text-rose-400">Delete</strong> — Remove a node by value, or right-click a node</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.45s" }}>• <strong className="text-slate-300">Drag a node</strong> — Reposition it on the canvas</p>
                <p className="animate-gentle-pulse" style={{ animationDelay: "0.6s" }}>• <strong className="text-slate-400">Middle-click / Scroll</strong> — Pan · zoom the canvas</p>
              </div>
            </div>
          )}
        </div>

          {/* Code Panel */}
          <div className="w-full xl:w-[380px] xl:flex-shrink-0 h-[300px] xl:h-auto">
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
        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-slate-500 bg-navy-800/50 border border-navy-600/50 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">␣</kbd> Play/Pause</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">←</kbd><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold ml-0.5">→</kbd> Step</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">R</kbd> Reset</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">MMB</kbd> Pan</span>
          <span><kbd className="bg-navy-700 px-1.5 py-0.5 rounded text-slate-400 font-bold">Scroll</kbd> Zoom</span>
        </div>

        {/* Dedicated Space for Tables and Results */}
        {(activeAlgorithm === "height" || activeAlgorithm === "lifting" || activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-navy-600 pb-2 flex items-center gap-1.5">
              <Table size={14} className="text-neon-cyan" />
              Algorithm Results & Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Traversal / Queue Output */}
              {(activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
                <div className="bg-navy-900 border border-navy-600 p-3 rounded-lg flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {activeAlgorithm === "bfs" ? "BFS Live Queue Front-to-Back" : `${traversalType} Traversal Output`}
                  </h4>
                  <div className="font-mono text-xs text-slate-200">
                    {activeAlgorithm === "bfs" ? (
                      <div className="bg-navy-950 border border-navy-600 p-2.5 rounded text-neon-cyan font-bold text-center">
                        {liveQueueList.length > 0 ? liveQueueList.join(" | ") : "Queue is empty"}
                      </div>
                    ) : (
                      <div className="bg-navy-950 border border-navy-600 p-2.5 rounded text-emerald-400 font-bold text-center">
                        {visitedOutputList.length > 0 ? visitedOutputList.join(" → ") : "No traversal yet"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Height and Diameter Table */}
              {activeAlgorithm === "height" && (
                <div className="bg-navy-900 border border-navy-600 p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <div className="flex justify-between items-center border-b border-navy-600 pb-2 mb-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height Metric Analytics</h4>
                    <div className="text-[10px] text-slate-300">
                      Max Overall Diameter: <span className="text-neon-cyan font-bold">{diameterResult} edges</span>
                    </div>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 font-mono text-[10px]">
                    {[...nodesList].map((n) => (
                      <div key={n.id} className="bg-navy-950 border border-navy-600 rounded p-2 flex justify-between items-center">
                        <span className="text-slate-400">Node {n.value}:</span>
                        <span className="text-emerald-400 font-bold">{heightsList.get(n.id) || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Binary Lifting Table */}
              {activeAlgorithm === "lifting" && liftingDataList.length > 0 && (
                <div className="bg-navy-900 border border-navy-600 p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Lifting Ancestors Jump Table (up[node_id][i] where power = 2^i)
                  </h4>
                  <div className="overflow-x-auto border border-navy-600 rounded bg-navy-950">
                    <table className="w-full text-[10px] text-center border-collapse font-mono">
                      <thead className="bg-navy-800 text-neon-cyan border-b border-navy-600 text-[8px] uppercase">
                        <tr>
                          <th className="p-2 text-left font-sans pl-3">Node Value</th>
                          <th className="p-2">2^0 Ancestor</th>
                          <th className="p-2">2^1 Ancestor</th>
                          <th className="p-2">2^2 Ancestor</th>
                          <th className="p-2">2^3 Ancestor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-700 text-slate-300">
                        {liftingDataList.map((row) => (
                          <tr key={row.nodeId} className="hover:bg-navy-700">
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
        <div className="bg-navy-800 border border-navy-600 rounded-xl flex flex-col h-[180px] overflow-hidden shadow-md flex-shrink-0">
          <div className="bg-navy-900 border-b border-navy-600 px-4 py-2 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <Terminal size={13} className="text-neon-cyan" /> Live Tree Execution Log
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
    </div>
  );
}
