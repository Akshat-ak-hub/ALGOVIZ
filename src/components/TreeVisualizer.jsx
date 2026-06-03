import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Trash2,
  Shuffle,
  Activity,
  Table,
  Database,
  Sparkles,
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

export default function TreeVisualizer() {
  const canvasRef = useRef(null);
  const bstRef = useRef(new BSTModel());
  const logContainerRef = useRef(null);

  const [activeAlgorithm, setActiveAlgorithm] = useState("traversals");
  const [traversalType, setTraversalType] = useState("inorder");
  const [targetSumValue, setTargetSumValue] = useState(25);
  const [lcaNodeAP, setLcaNodeAP] = useState("");
  const [lcaNodeAQ, setLcaNodeAQ] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [speedMs, setSpeedMs] = useState(500);
  const [nodeCountSetting, setNodeCountSetting] = useState(7);

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

  const stepsTimelineRef = useRef([]);
  const playbackIndexRef = useRef(-1);
  const intervalIdRef = useRef(null);
  const updateTriggerRef = useRef(null);

  const syncTreeData = () => {
    const { nodes } = bstRef.current.getFlatNodesAndEdges();
    setNodesList(nodes);
    updateTriggerRef.current = Math.random();
  };

  const addLog = (text, type = "step") => {
    setExecutionLogs((prev) => [...prev, { text, type }]);
  };

  const clearLog = () => {
    setExecutionLogs([]);
  };

  useEffect(() => {
    bstRef.current.generatePrefilledTree();
    syncTreeData();

    return () => clearRunningInterval();
  }, []);

  useEffect(() => {
    drawTree();
  }, [updateTriggerRef.current, activeNodeId, highlightedNodeIds]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  // Set default LCA targets
  useEffect(() => {
    if (nodesList.length > 1) {
      setLcaNodeAP(nodesList[0].value.toString());
      setLcaNodeAQ(nodesList[nodesList.length - 1].value.toString());
    } else {
      setLcaNodeAP("");
      setLcaNodeAQ("");
    }
  }, [nodesList]);

  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = 400;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = "#303030";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
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

      if (isCurrentlyActive) {
        fill = "#f59e0b"; // Orange active
        border = "#b45309";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
      } else if (isHighlighted) {
        fill = "#8b5cf6"; // Purple special
        border = "#6d28d9";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 12;
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

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y - 1);
    }

    ctx.restore();
  };

  const handleBSTAction = (action) => {
    if (isRunning) return;
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) {
      alert("Please enter a valid numeric value!");
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
      alert("Tree is empty!");
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

  const resetVisualStates = () => {
    clearRunningInterval();
    setActiveNodeId(null);
    setHighlightedNodeIds(new Set());
    setVisitedOutputList([]);
    setLiveQueueList([]);
    setHeightsList(new Map());
    setLiftingDataList([]);
    setIsRunning(false);
    setIsPlaying(false);
    clearLog();
    addLog("States reset. Editor active.", "system");
    drawTree();
  };

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-68px)] flex flex-col lg:flex-row p-4 gap-4 overflow-hidden select-none font-sans">
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] flex-shrink-0 pr-1">
        
        {/* BST Key Controls Card */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
            <Database size={13} className="text-cyan-400" />
            BST Operations
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter node value"
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-100 text-xs px-3 py-2 outline-none focus:border-cyan-500 text-center"
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
              className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/30 font-bold text-[10px] py-2 rounded-lg cursor-pointer transition duration-200"
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

        {/* Tree Editor Panel (New Section requested by user) */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
            <Activity size={13} className="text-cyan-400" />
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
              className="w-16 bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-2 py-1 text-center outline-none focus:border-cyan-500"
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
              className="flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-650 text-slate-200 font-bold text-[10px] py-2 px-2 rounded-lg cursor-pointer transition duration-200"
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
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-400" />
            Tree Algorithm
          </h2>
          <select
            value={activeAlgorithm}
            onChange={(e) => setActiveAlgorithm(e.target.value)}
            className="bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-3 py-2.5 cursor-pointer outline-none focus:border-cyan-500"
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
                    className={`text-[9px] py-1 font-bold rounded capitalize cursor-pointer border ${
                      traversalType === mode
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "border-transparent text-slate-400"
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
                  className="bg-[#121212] border border-[#2e2e2e] rounded text-slate-300 text-xs p-1"
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
                  className="bg-[#121212] border border-[#2e2e2e] rounded text-slate-300 text-xs p-1"
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
                className="bg-[#121212] border border-[#2e2e2e] rounded text-slate-300 text-xs p-1 text-center"
              />
            </div>
          )}

          <button
            onClick={runTreeAlgorithm}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer mt-1"
          >
            <Play size={12} />
            Run Visualization
          </button>
        </div>

        {/* Speed Controls Slider */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2.5 shadow-md">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Playback speed</label>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-[#2d2d2d] rounded appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
            <span>Fast</span>
            <span>Current: {speedMs}ms</span>
            <span>Slow</span>
          </div>
        </div>

        {/* Playback Controls Panel */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2 shadow-md mb-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={togglePlayPause}
              disabled={!isRunning || currentStepIdx >= totalStepsCount}
              className="flex items-center justify-center gap-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:opacity-30 text-slate-300 font-bold text-xs py-2 px-3 rounded-lg cursor-pointer"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Resume"}
            </button>
            <button
              onClick={stepForward}
              disabled={!isRunning || currentStepIdx >= totalStepsCount}
              className="flex items-center justify-center gap-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:opacity-30 text-slate-300 font-bold text-xs py-2 px-3 rounded-lg cursor-pointer"
            >
              <ChevronRight size={12} />
              Step
            </button>
          </div>
          <button
            onClick={resetVisualStates}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 border border-rose-600/30 hover:bg-rose-600/20 text-rose-400 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
          >
            <RotateCcw size={12} />
            Reset State
          </button>
        </div>
      </aside>

      {/* Main Canvas & Separate Workspace for Tables/Results/Logs */}
      <main className="flex-grow flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
        {/* Canvas panel */}
        <div className="bg-[#272727] border border-[#2e2e2e] rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-center items-center p-4 min-h-[350px]">
          <canvas ref={canvasRef} className="block max-w-full" />

          {/* Top Status Banner */}
          {isRunning && (
            <div className="absolute top-4 left-4 right-4 bg-[#121212]/90 backdrop-blur-md border border-[#2e2e2e] rounded-xl p-3 shadow-md pointer-events-none z-10">
              <span className="text-xs font-bold text-amber-400 leading-relaxed block text-center">
                {statusBannerText}
              </span>
            </div>
          )}

          {nodesList.length === 0 && (
            <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-semibold text-slate-400">
                🌳 BST is currently empty
              </p>
              <p className="text-xs text-slate-500">
                Use the sidebar to insert nodes or generate a random tree!
              </p>
            </div>
          )}
        </div>

        {/* Dedicated Space for Tables and Results (Requested by user to avoid overlaps) */}
        {(activeAlgorithm === "height" || activeAlgorithm === "lifting" || activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
              <Table size={14} className="text-cyan-400" />
              Algorithm Results & Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Traversal / Queue Output */}
              {(activeAlgorithm === "traversals" || activeAlgorithm === "bfs") && (
                <div className="bg-[#141414] border border-[#2c2c2c] p-3 rounded-lg flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {activeAlgorithm === "bfs" ? "BFS Live Queue Front-to-Back" : `${traversalType} Traversal Output`}
                  </h4>
                  <div className="font-mono text-xs text-slate-200">
                    {activeAlgorithm === "bfs" ? (
                      <div className="bg-[#121212] border border-[#2e2e2e] p-2.5 rounded text-cyan-400 font-bold text-center">
                        {liveQueueList.length > 0 ? liveQueueList.join(" | ") : "Queue is empty"}
                      </div>
                    ) : (
                      <div className="bg-[#121212] border border-[#2e2e2e] p-2.5 rounded text-emerald-400 font-bold text-center">
                        {visitedOutputList.length > 0 ? visitedOutputList.join(" → ") : "No traversal yet"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Height and Diameter Table */}
              {activeAlgorithm === "height" && (
                <div className="bg-[#141414] border border-[#2c2c2c] p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-2 mb-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height Metric Analytics</h4>
                    <div className="text-[10px] text-slate-300">
                      Max Overall Diameter: <span className="text-cyan-400 font-bold">{diameterResult} edges</span>
                    </div>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 font-mono text-[10px]">
                    {[...nodesList].map((n) => (
                      <div key={n.id} className="bg-[#121212] border border-[#2a2a2a] rounded p-2 flex justify-between items-center">
                        <span className="text-slate-400">Node {n.value}:</span>
                        <span className="text-emerald-400 font-bold">{heightsList.get(n.id) || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Binary Lifting Table */}
              {activeAlgorithm === "lifting" && liftingDataList.length > 0 && (
                <div className="bg-[#141414] border border-[#2c2c2c] p-3 rounded-lg flex flex-col gap-2 col-span-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Lifting Ancestors Jump Table (up[node_id][i] where power = 2^i)
                  </h4>
                  <div className="overflow-x-auto border border-[#2e2e2e] rounded bg-[#121212]">
                    <table className="w-full text-[10px] text-center border-collapse font-mono">
                      <thead className="bg-[#1a1a1a] text-cyan-400 border-b border-[#2e2e2e] text-[8px] uppercase">
                        <tr>
                          <th className="p-2 text-left font-sans pl-3">Node Value</th>
                          <th className="p-2">2^0 Ancestor</th>
                          <th className="p-2">2^1 Ancestor</th>
                          <th className="p-2">2^2 Ancestor</th>
                          <th className="p-2">2^3 Ancestor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-slate-300">
                        {liftingDataList.map((row) => (
                          <tr key={row.nodeId} className="hover:bg-[#202020]">
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
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl flex flex-col h-[180px] overflow-hidden shadow-md flex-shrink-0">
          <div className="bg-[#161616] border-b border-[#2e2e2e] px-4 py-2 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              📟 Live Tree Execution Log
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
            className="flex-grow bg-[#141414] p-3 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 text-slate-300"
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
