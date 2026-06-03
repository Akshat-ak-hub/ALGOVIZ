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
  Sparkles,
  Network,
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

export default function GraphVisualizer() {
  const canvasRef = useRef(null);
  const graphRef = useRef(new GraphModel());
  const logContainerRef = useRef(null);

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

  const pendingEdgeRef = useRef(null);
  const canvasSizeRef = useRef({ width: 800, height: 450 });
  const intervalIdRef = useRef(null);
  const playbackIndexRef = useRef(-1);
  const selectedNodeRef = useRef(null);
  const dragSourceNodeRef = useRef(null);
  const currentDragMousePosRef = useRef(null);
  const isShiftDraggingRef = useRef(false);
  const updateTriggerRef = useRef(null);
  const stepsTimelineRef = useRef([]);

  const isTransposedRef = useRef(false);

  const syncNodes = () => {
    setNodesList([...graphRef.current.nodes]);
    updateTriggerRef.current = Math.random();
  };

  const addLog = (text, type = "step") => {
    setExecutionLogs((prev) => [...prev, { text, type }]);
  };

  const clearLog = () => {
    setExecutionLogs([]);
  };

  useEffect(() => {
    drawCanvas();
  }, [updateTriggerRef.current, distanceMap, predecessorMap, dfnMap, lowMap]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Restrict max canvas height to keep layout tidy
      const parentWidth = rect.width || 800;
      const parentHeight = 400; 

      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      canvasSizeRef.current = { width: parentWidth, height: parentHeight };
      drawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    generateRandomGraph();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearRunningInterval();
    };
  }, [isDirected]);

  useEffect(() => {
    if (nodesList.length > 0) {
      if (!sourceNodeId || !nodesList.some((n) => n.id.toString() === sourceNodeId.toString())) {
        setSourceNodeId(nodesList[0].id.toString());
      }
    } else {
      setSourceNodeId("");
    }
  }, [nodesList]);

  const handleDirectedToggle = (directed) => {
    setIsDirected(directed);
    resetVisualizer();
  };

  const getCanvasMousePos = (e) => {
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
    const pos = getCanvasMousePos(e);
    const clickedNode = graphRef.current.getNodeAt(pos.x, pos.y);

    if (e.button === 2) {
      e.preventDefault();
      if (clickedNode) {
        graphRef.current.removeNode(clickedNode);
        addLog(`🗑 Deleted Node ${clickedNode.label}`, "system");
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
        addLog(`➕ Added Node ${node.label} at (${Math.round(pos.x)}, ${Math.round(pos.y)})`, "system");
        syncNodes();
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isRunning) return;
    const pos = getCanvasMousePos(e);
    const { width, height } = canvasSizeRef.current;

    if (selectedNodeRef.current) {
      selectedNodeRef.current.x = Math.max(22, Math.min(width - 22, pos.x));
      selectedNodeRef.current.y = Math.max(22, Math.min(height - 22, pos.y));
      drawCanvas();
    } else if (isShiftDraggingRef.current) {
      currentDragMousePosRef.current = pos;
      drawCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (isRunning) return;

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
        addLog(`🔗 Created edge (${pendingEdgeRef.current.source.label} ${isDirected ? "→" : "↔"} ${pendingEdgeRef.current.target.label}, w=${weight})`, "system");
      } else {
        addLog(`⚠️ Edge already exists between Node ${pendingEdgeRef.current.source.label} and Node ${pendingEdgeRef.current.target.label}`, "error");
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

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = Colors.grid;
    ctx.lineWidth = 0.5;
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
        ctx.shadowBlur = 10;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Draw arrow head if directed
      if (isDirected) {
        const angle = Math.atan2(v.y - u.y, v.x - u.x);
        const nodeRadiusOffset = 25;
        const arrowX = v.x - nodeRadiusOffset * Math.cos(angle);
        const arrowY = v.y - nodeRadiusOffset * Math.sin(angle);

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY - 10 * Math.sin(angle + Math.PI / 6));
        ctx.fill();
      }

      // Draw Edge Weight
      let midX = (u.x + v.x) / 2;
      let midY = (u.y + v.y) / 2;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        midX += (-dy / len) * 12;
        midY += (dx / len) * 12;
      }

      const text = edge.weight.toString();
      ctx.font = "normal 11px sans-serif";
      const txtW = ctx.measureText(text).width;

      ctx.fillStyle = "rgba(30, 30, 30, 0.9)";
      ctx.beginPath();
      ctx.roundRect(midX - txtW / 2 - 4, midY - 6 - 2, txtW + 8, 14, 5);
      ctx.fill();

      ctx.fillStyle = "#D0D0D0";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(text, midX, midY);
    }

    // Dragging Edge preview
    if (isShiftDraggingRef.current && dragSourceNodeRef.current && currentDragMousePosRef.current) {
      ctx.strokeStyle = Colors.edgeDrag;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 8]);
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
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = nodeColor.border;
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, 2 * Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.fillStyle = nodeColor.fill;
      ctx.beginPath();
      ctx.arc(x, y, 21, 0, 2 * Math.PI);
      ctx.fill();

      // DFN / LOW badges if Tarjan's is selected
      if (activeAlgorithm === "bridges" && dfnMap.has(node.id)) {
        const dfnVal = dfnMap.get(node.id);
        const lowVal = lowMap.get(node.id);
        const badgeStr = `${dfnVal}/${lowVal}`;
        ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
        ctx.beginPath();
        ctx.roundRect(x - 18, y + 25, 36, 12, 4);
        ctx.fill();
        ctx.fillStyle = "#fb7185";
        ctx.font = "bold 9px monospace";
        ctx.fillText(badgeStr, x, y + 31);
      }

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, x, y - 1);
    }

    ctx.restore();
  };

  const runGraphAlgorithm = () => {
    if (graphRef.current.nodes.length === 0) {
      alert("Please create a graph first!");
      return;
    }

    const startNode = graphRef.current.nodes.find(
      (n) => n.id.toString() === sourceNodeId.toString()
    );
    if (!startNode && (activeAlgorithm === "dfs" || activeAlgorithm === "bfs" || activeAlgorithm === "dijkstra" || activeAlgorithm === "bellman")) {
      alert("Please select a valid source node!");
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
      steps = runGraphTopo(graphRef.current.nodes, graphRef.current.edges, startNode);
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
      steps = runGraphSCCKosaraju(graphRef.current.nodes, graphRef.current.edges, startNode);
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
    graphRef.current.generateRandom(count, width || 800, height || 450, isDirected);
    syncNodes();
    clearLog();
    addLog(`🎲 Generated random connected graph with ${count} nodes (${isDirected ? "directed" : "undirected"}).`, "system");
  };

  const clearGraph = () => {
    resetVisualizer();
    graphRef.current.clear();
    syncNodes();
    clearLog();
    addLog("🗑 Graph cleared.", "system");
  };

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-68px)] flex flex-col lg:flex-row p-4 gap-4 overflow-hidden select-none font-sans">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] flex-shrink-0 pr-1">
        
        {/* Toggle directed/undirected Graph type */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2 shadow-md">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Graph Mode</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDirectedToggle(false)}
              className={`text-xs py-1.5 font-bold rounded-lg cursor-pointer border ${
                !isDirected ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "border-transparent text-slate-400"
              }`}
            >
              Undirected
            </button>
            <button
              onClick={() => handleDirectedToggle(true)}
              className={`text-xs py-1.5 font-bold rounded-lg cursor-pointer border ${
                isDirected ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "border-transparent text-slate-400"
              }`}
            >
              Directed
            </button>
          </div>
        </div>

        {/* Algorithm selection dropdown */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
            <Network size={13} className="text-cyan-400" />
            Select Algorithm
          </h2>
          <select
            value={activeAlgorithm}
            onChange={(e) => setActiveAlgorithm(e.target.value)}
            className="bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none focus:border-cyan-500"
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
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Node</label>
                <select
                  value={sourceNodeId}
                  onChange={(e) => setSourceNodeId(e.target.value)}
                  disabled={isRunning}
                  className="bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer"
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
                    className="bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-3 py-2 cursor-pointer"
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
            className="w-full flex items-center justify-center gap-1.5 bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Sparkles size={13} />
            Run Algorithm
          </button>
        </div>

        {/* Speed Controls */}
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

        {/* Control Button panel */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2 shadow-md">
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
            onClick={resetVisualizer}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 border border-rose-600/30 hover:bg-rose-600/20 text-rose-400 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <RotateCcw size={12} />
            Reset State
          </button>
        </div>

        {/* Graph Editor Controls */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
            <Activity size={13} className="text-cyan-400" />
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
              className="w-16 bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-200 text-xs px-2 py-1 text-center outline-none focus:border-cyan-500"
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
            className="w-full flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-650 text-slate-200 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition duration-200"
          >
            <Trash2 size={12} />
            Clear Graph
          </button>
        </div>

        {/* Legend */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2.5 shadow-md flex-shrink-0 mb-2">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2">
            Legend
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span className="text-slate-400 font-medium">Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
              <span className="text-slate-400 font-medium">Current Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]" />
              <span className="text-slate-400 font-medium">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
              <span className="text-slate-400 font-medium">Tree Path</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas & Separate Dedicated Workspace for Tables & Logs */}
      <main className="flex-grow flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
        {/* Canvas panel */}
        <div className="bg-[#272727] border border-[#2e2e2e] rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-center items-center min-h-[350px]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="block cursor-crosshair max-w-full"
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Help Overlay when Canvas is empty */}
          {nodesList.length === 0 && (
            <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center pointer-events-none p-6">
              <p className="text-sm font-semibold text-slate-300">
                🖱 &nbsp;Click anywhere to add a Node
              </p>
              <p className="text-sm font-semibold text-slate-300">
                ⇧ &nbsp;Shift + Drag between nodes to connect Edges
              </p>
              <p className="text-sm font-semibold text-slate-300">
                ✋ &nbsp;Drag a node to reposition it
              </p>
              <p className="text-sm font-semibold text-slate-300">
                🗑 &nbsp;Right-click a node to delete it
              </p>
              <div className="h-[1px] bg-[#2e2e2e] my-1 w-40" />
              <p className="text-cyan-400 font-bold text-sm">
                Or click "Random Graph" to auto-build!
              </p>
            </div>
          )}

          {/* Top Status execution banner */}
          {isRunning && (
            <div className="absolute top-4 left-4 right-4 bg-[#121212]/90 backdrop-blur-md border border-[#2e2e2e] rounded-xl p-3 shadow-md pointer-events-none z-10">
              <span className="text-xs font-bold text-amber-400 leading-relaxed block text-center">
                {statusBannerText}
              </span>
            </div>
          )}
        </div>

        {/* Separate Workspace for DSU or Distance Tables (Requested by user to prevent overlaps) */}
        {((activeAlgorithm === "dsu" && dsuParentsList.length > 0) ||
          ((activeAlgorithm === "dijkstra" || activeAlgorithm === "bellman") && distanceMap.size > 0)) && (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-[#2e2e2e] pb-2 flex items-center gap-1.5">
              <Table size={14} className="text-cyan-400" />
              Algorithm Results & Analytics
            </h3>

            <div className="w-full">
              {/* DSU Table */}
              {activeAlgorithm === "dsu" && dsuParentsList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Disjoint Set Union (DSU) Mapping
                  </h4>
                  <div className="overflow-x-auto border border-[#2d2d2d] rounded bg-[#121212] max-h-[200px]">
                    <table className="w-full text-[10px] text-center border-collapse font-mono">
                      <thead className="bg-[#1a1a1a] text-cyan-400 border-b border-[#2e2e2e] text-[8px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2 font-sans font-bold">Node Value</th>
                          <th className="p-2 font-sans font-bold">Representative Parent</th>
                          <th className="p-2 font-sans font-bold">Set Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-slate-300">
                        {dsuParentsList.map((row) => (
                          <tr key={row.nodeId} className="hover:bg-[#202020]">
                            <td className="p-2 font-bold text-slate-400">{row.nodeVal}</td>
                            <td className="p-2 text-cyan-400 font-bold">{row.pVal}</td>
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
                  <div className="overflow-x-auto border border-[#2d2d2d] rounded bg-[#121212] max-h-[200px]">
                    <table className="w-full text-[10px] text-left border-collapse font-mono">
                      <thead className="bg-[#1a1a1a] text-cyan-400 border-b border-[#2e2e2e] text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2 font-bold font-sans">Target Node</th>
                          <th className="p-2 font-bold font-sans">Computed Distance</th>
                          <th className="p-2 font-bold font-sans">Predecessor Node</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424]">
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
                              <tr key={n.id} className="hover:bg-[#202020]">
                                <td className="p-2 font-bold text-slate-300">Node {n.label}</td>
                                <td className={`p-2 font-bold ${dist === Infinity ? "text-slate-500" : "text-cyan-400"}`}>
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
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl flex flex-col h-[180px] overflow-hidden shadow-md flex-shrink-0">
          <div className="bg-[#161616] border-b border-[#2e2e2e] px-4 py-2 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              📟 Live Graph Execution Log
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

      {/* Edge Weight modal overlay */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-6 w-[280px] flex flex-col gap-4 shadow-xl">
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
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg text-slate-100 text-xs px-3 py-2 outline-none focus:border-cyan-500 text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter") addEdgeWeightConfirm();
                if (e.key === "Escape") addEdgeWeightCancel();
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={addEdgeWeightCancel}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d] rounded-lg cursor-pointer transition duration-150 font-sans"
              >
                Cancel
              </button>
              <button
                onClick={addEdgeWeightConfirm}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg cursor-pointer transition duration-150 font-sans"
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
