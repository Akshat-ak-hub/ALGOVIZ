import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Shuffle, Timer, Plus, Trash2, Search, ArrowLeftRight,
  ListOrdered, Keyboard, Split, Repeat, Info,
} from "lucide-react";
import { LinkedListModel } from "../models/LinkedListModel";
import { ALGORITHM_NAMES, ALGORITHM_IDS } from "../algorithms/linkedListAlgorithmCode";
import CodePanel from "./CodePanel";
import { useToast } from "../hooks/useToast";

/* ── constants ─────────────────────────────────────────────── */
const NODE_W = 70;
const NODE_H = 42;
const NODE_R = 8;
const GAP = 120;

const OPERATIONS_WITH_INPUT = {
  "insert-head": { needsValue: true, placeholder: "Enter value" },
  "insert-tail": { needsValue: true, placeholder: "Enter value" },
  "insert-position": { needsValue: true, needsPos: true, placeholder: "Value", posPlaceholder: "Position" },
  "delete-value": { needsValue: true, placeholder: "Value to delete" },
  search: { needsValue: true, placeholder: "Value to search" },
};

const COMPLEXITY_INFO = {
  "insert-head": { time: "O(1)", space: "O(1)" },
  "insert-tail": { time: "O(1)", space: "O(1)" },
  "insert-position": { time: "O(n)", space: "O(1)" },
  "delete-head": { time: "O(1)", space: "O(1)" },
  "delete-tail": { time: "O(1)", space: "O(1)" },
  "delete-value": { time: "O(n)", space: "O(1)" },
  reverse: { time: "O(n)", space: "O(1)" },
  "detect-cycle": { time: "O(n)", space: "O(1)" },
  "find-middle": { time: "O(n)", space: "O(1)" },
  search: { time: "O(n)", space: "O(1)" },
};

const SPEED_LABELS = [
  { ms: 100, label: "Lightning" },
  { ms: 300, label: "Fast" },
  { ms: 600, label: "Normal" },
  { ms: 1200, label: "Slow" },
];

/* ── spring presets ────────────────────────────────────────── */
const springNode = { type: "spring", stiffness: 220, damping: 24 };
const springLabel = { type: "spring", stiffness: 380, damping: 26 };
const springArrow = { type: "spring", stiffness: 260, damping: 28 };

/* ── helpers ───────────────────────────────────────────────── */
function getNodeStyle(label, isDeleting) {
  if (isDeleting) return { bg: "#ed8068", border: "#171717", text: "#171717" };
  switch (label) {
    case "temp":       return { bg: "#f0c2a3", border: "#171717", text: "#171717" };
    case "target":
    case "found":
    case "middle":     return { bg: "#c5b6e7", border: "#171717", text: "#171717" };
    case "curr":
    case "slow":
    case "fast":
    case "slow/fast":  return { bg: "#ffdf3e", border: "#171717", text: "#171717" };
    case "newNode":    return { bg: "#a9d4bb", border: "#171717", text: "#171717" };
    case "head":
    case "tail":
    case "head/tail":  return { bg: "#c5b6e7", border: "#171717", text: "#171717" };
    case "prev":       return { bg: "#fde68a", border: "#171717", text: "#171717" };
    case "next":       return { bg: "#93c5fd", border: "#171717", text: "#171717" };
    default:           return { bg: "#fffdf6", border: "#171717", text: "#171717" };
  }
}

function getArrowStyle(action, nodeLabel, nextLabel, deleteId, nodeId, nextId) {
  if (action === "delete" && (deleteId === nodeId || deleteId === nextId)) {
    return { color: "#ed8068", width: 3, dash: "6 4", marker: "red" };
  }
  if (action === "relink" && nodeLabel === "prev" && nextLabel === "next") {
    return { color: "#568b68", width: 3, dash: "none", marker: "green" };
  }
  if (action === "relink" && nodeLabel === "temp") {
    return { color: "#ed8068", width: 2, dash: "4 4", marker: "red" };
  }
  if (action === "delete" && nodeLabel === "temp") {
    return { color: "#ed8068", width: 3, dash: "6 4", marker: "red" };
  }
  return { color: "#4a4940", width: 2, dash: "none", marker: "default" };
}

function estimateLabelWidth(text) {
  return text.length * 6.5 + 10;
}

/* ── component ─────────────────────────────────────────────── */
export default function LinkedListVisualizer() {
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(new LinkedListModel());

  const [algorithm, setAlgorithm] = useState("insert-head");
  const [inputValue, setInputValue] = useState("");
  const [positionValue, setPositionValue] = useState("");
  const [speedMs, setSpeedMs] = useState(600);
  const [nodeCount, setNodeCount] = useState(5);

  const [nodesData, setNodesData] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();
  const [statusText, setStatusText] = useState("Press Space to play, or step through manually");
  const [executionLogs, setExecutionLogs] = useState([]);
  const [currentCodeLine, setCurrentCodeLine] = useState(0);
  const [pointerLabels, setPointerLabels] = useState({});
  const [deletingIds, setDeletingIds] = useState(new Set());

  const totalSteps = steps.length;
  const stepData = steps[currentStep] || null;
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep >= totalSteps - 1;
  const algorithmLabel = ALGORITHM_NAMES[algorithm] || algorithm;
  const needsInput = algorithm in OPERATIONS_WITH_INPUT;
  const needsPos = OPERATIONS_WITH_INPUT[algorithm]?.needsPos || false;

  /* ── generate random list ──────────────────────────────── */
  const generateRandom = useCallback(() => {
    listRef.current.generateRandom(nodeCount);
    setNodesData(listRef.current.toNodesData());
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setExecutionLogs([]);
    setStatusText(`Generated random list of size ${nodeCount}`);
    setCurrentCodeLine(0);
    setPointerLabels({});
    setDeletingIds(new Set());
  }, [nodeCount]);

  useEffect(() => { generateRandom(); }, [generateRandom]);

  /* ── auto-play interval ────────────────────────────────── */
  useEffect(() => {
    if (!isRunning || isAtEnd) return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 2) {
          setIsRunning(false);
          return totalSteps - 1;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isAtEnd, totalSteps, speedMs]);

  /* ── log accumulation ──────────────────────────────────── */
  useEffect(() => {
    if (!stepData) return;
    setExecutionLogs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.step === currentStep) {
        const updated = [...prev];
        updated[updated.length - 1] = { step: currentStep, text: stepData.description };
        return updated;
      }
      if (last && last.text === stepData.description) return prev;
      return [...prev, { step: currentStep, text: stepData.description }];
    });
  }, [currentStep, stepData]);

  /* ── sync state from step ──────────────────────────────── */
  useEffect(() => {
    if (stepData) {
      setCurrentCodeLine(stepData.codeLine || 0);
      setPointerLabels(stepData.pointerLabels || {});
      const newDeleting = new Set();
      for (let i = 0; i <= currentStep; i++) {
        const s = steps[i];
        if (s && s.deleteId != null) newDeleting.add(s.deleteId);
      }
      setDeletingIds(newDeleting);
    } else {
      setDeletingIds(new Set());
    }
  }, [stepData, currentStep, steps]);

  /* ── cleanup ───────────────────────────────────────────── */
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  /* ── run operation ─────────────────────────────────────── */
  const runOperation = (value) => {
    setIsRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setDeletingIds(new Set());
    setPointerLabels({});

    let newSteps = [];
    const model = listRef.current;
    const val = parseInt(value, 10);

    if (Number.isNaN(val) && needsInput) {
      showToast("Please enter a valid numeric value", "warning");
      setStatusText("Please enter a valid numeric value");
      return;
    }
    model.resetStates();

    switch (algorithm) {
      case "insert-head":      newSteps = model.insertAtHead(val); break;
      case "insert-tail":      newSteps = model.insertAtTail(val); break;
      case "insert-position": {
        const pos = parseInt(positionValue, 10);
        if (Number.isNaN(pos)) { showToast("Please enter a valid position", "warning"); return; }
        newSteps = model.insertAtPosition(val, pos); break;
      }
      case "delete-head":      newSteps = model.deleteHead(); break;
      case "delete-tail":      newSteps = model.deleteTail(); break;
      case "delete-value":     if (!Number.isNaN(val)) newSteps = model.deleteByValue(val); break;
      case "reverse":          newSteps = model.reverse(); break;
      case "detect-cycle":     newSteps = model.detectCycle(); break;
      case "find-middle":      newSteps = model.getMiddle(); break;
      case "search":           if (!Number.isNaN(val)) newSteps = model.search(val); break;
    }

    setNodesData(model.toNodesData());
    if (newSteps.length === 0) {
      setSteps([]); setCurrentStep(0); setExecutionLogs([]); setCurrentCodeLine(0);
      setStatusText("No steps generated — list may be empty."); return;
    }
    setSteps(newSteps); setCurrentStep(0); setExecutionLogs([]); setCurrentCodeLine(0);
    setStatusText(`Running ${algorithmLabel}...`); setIsRunning(true);
  };

  /* ── playback controls ─────────────────────────────────── */
  const togglePlayPause = useCallback(() => {
    if (totalSteps === 0) return;
    if (isAtEnd && !isRunning) { setCurrentStep(0); setIsRunning(true); return; }
    setIsRunning((p) => !p);
  }, [isAtEnd, isRunning, totalSteps]);

  const stepForward = useCallback(() => {
    if (isAtEnd || totalSteps === 0) return;
    setIsRunning(false);
    setCurrentStep((p) => Math.min(p + 1, totalSteps - 1));
  }, [isAtEnd, totalSteps]);

  const stepBackward = useCallback(() => {
    if (isAtStart) return;
    setIsRunning(false);
    setCurrentStep(currentStep - 1);
  }, [isAtStart, currentStep]);

  const resetVisualizer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSteps([]); setCurrentStep(0); setExecutionLogs([]);
    setStatusText("Reset — ready to replay"); setCurrentCodeLine(0);
    setPointerLabels({}); setDeletingIds(new Set());
    setNodesData(listRef.current.toNodesData());
  }, []);

  const seekToStep = useCallback((idx) => {
    setIsRunning(false);
    setCurrentStep(Math.max(0, Math.min(idx, totalSteps - 1)));
  }, [totalSteps]);

  /* ── keyboard shortcuts ────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      switch (e.key) {
        case " ":          e.preventDefault(); togglePlayPause(); break;
        case "ArrowRight":  e.preventDefault(); stepForward(); break;
        case "ArrowLeft":   e.preventDefault(); stepBackward(); break;
        case "r": case "R": e.preventDefault(); resetVisualizer(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, stepForward, stepBackward, resetVisualizer]);

  const getSpeedLabel = (ms) => { const e = SPEED_LABELS.find((s) => s.ms === ms); return e ? e.label : "Custom"; };

  /* ══════════════════════════════════════════════════════════
     SVG VISUALISATION — smooth animated linked-list rendering
     ══════════════════════════════════════════════════════════ */
  const displayNodes =
    stepData?.nodesSnapshot?.length ? stepData.nodesSnapshot.map((n) => ({ ...n }))
    : nodesData.map((n) => ({ ...n }));

  const activeLabels = stepData?.pointerLabels || pointerLabels || {};
  const action = stepData?.action;
  const deleteId = stepData?.deleteId;

  // Compute SVG viewBox width from node positions
  const maxNodeX = displayNodes.length > 0 ? Math.max(...displayNodes.map((n) => n.x)) : 400;
  const svgWidth = Math.max(900, maxNodeX + 140);

  // Build arrow descriptors
  const straightArrows = [];
  const cycleArrows = [];

  for (const node of displayNodes) {
    if (node.nextId == null) continue;
    const nextNode = displayNodes.find((n) => n.id === node.nextId);
    if (!nextNode) continue;

    // Detect if this is an actual cycle loop or self-loop
    const isCycle =
      node.id === nextNode.id ||
      (algorithm === "detect-cycle" && nextNode.x <= node.x) ||
      (node.x - nextNode.x > GAP + 30);

    const nodeLabel = activeLabels[node.id] || "";
    const nextLabel = activeLabels[nextNode.id] || "";
    const style = getArrowStyle(action, nodeLabel, nextLabel, deleteId, node.id, nextNode.id);

    if (isCycle) {
      const midY = node.y + NODE_H / 2 + 40;
      const midX = (node.x + nextNode.x) / 2;
      const d = `M ${node.x + NODE_W / 2} ${node.y + NODE_H / 2}
                 Q ${node.x + NODE_W / 2} ${midY}, ${midX} ${midY}
                 Q ${nextNode.x - NODE_W / 2} ${midY}, ${nextNode.x - NODE_W / 2} ${nextNode.y + NODE_H / 2}`;
      cycleArrows.push({ key: `cycle-${node.id}-${nextNode.id}`, d, midX, midY });
    } else {
      const pointingLeft = nextNode.x < node.x;
      straightArrows.push({
        key: `arrow-${node.id}-${nextNode.id}`,
        x1: pointingLeft ? node.x - NODE_W / 2 : node.x + NODE_W / 2,
        y1: node.y,
        x2: pointingLeft ? nextNode.x + NODE_W / 2 : nextNode.x - NODE_W / 2,
        y2: nextNode.y,
        ...style,
      });
    }
  }

  // Find last node for NULL terminator
  const lastNode = displayNodes.length > 0 ? displayNodes[displayNodes.length - 1] : null;
  const showNull = lastNode && (lastNode.nextId == null || lastNode.nextId === undefined);

  /* ── icons ─────────────────────────────────────────────── */
  const operationIcons = {
    "insert-head": <Plus size={14} />, "insert-tail": <Plus size={14} />, "insert-position": <Plus size={14} />,
    "delete-head": <Trash2 size={14} />, "delete-tail": <Trash2 size={14} />, "delete-value": <Trash2 size={14} />,
    reverse: <ArrowLeftRight size={14} />, "detect-cycle": <Repeat size={14} />,
    "find-middle": <Split size={14} />, search: <Search size={14} />,
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="linked-list-workbench bg-bp-950 min-h-[calc(100vh-130px)] p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">

        {/* ─── TOP CONTROLS BAR ──────────────────────────── */}
        <div className="linked-list-controls flex flex-wrap items-center gap-3 bg-bp-900 border border-bp-800 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ListOrdered size={14} className="text-slate-400" />
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
              className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none min-w-[140px]">
              {ALGORITHM_IDS.map((id) => (<option key={id} value={id}>{ALGORITHM_NAMES[id]}</option>))}
            </select>
          </div>

          <span className="text-bp-700">|</span>

          {needsInput && (
            <div className="flex items-center gap-2">
              <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder={OPERATIONS_WITH_INPUT[algorithm].placeholder}
                className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 w-28 outline-none font-mono"
                onKeyDown={(e) => { if (e.key === "Enter") runOperation(inputValue); }} />
              {needsPos && (
                <input type="number" value={positionValue} onChange={(e) => setPositionValue(e.target.value)}
                  placeholder={OPERATIONS_WITH_INPUT[algorithm].posPlaceholder}
                  className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 w-24 outline-none font-mono"
                  onKeyDown={(e) => { if (e.key === "Enter") runOperation(inputValue); }} />
              )}
              <button onClick={() => runOperation(inputValue)}
                className="flex items-center gap-1.5 px-3 py-2 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-accent-emphasis">
                {operationIcons[algorithm]} Run
              </button>
            </div>
          )}

          {!needsInput && (
            <button onClick={() => runOperation()}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-accent-emphasis">
              {operationIcons[algorithm]} Run
            </button>
          )}

          {algorithm === "detect-cycle" ? (
            <>
              <span className="text-bp-700">|</span>
              <button onClick={generateRandom}
                className="flex items-center gap-1.5 px-3 py-2 bg-bp-800 hover:bg-bp-750 text-slate-300 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-bp-700">
                <Shuffle size={12} /> Random
              </button>
              <span className="text-bp-700">|</span>
              <button onClick={() => {
                  listRef.current.createCycle(); setNodesData(listRef.current.toNodesData());
                  setSteps([]); setCurrentStep(0); setIsRunning(false); setExecutionLogs([]);
                  setStatusText("Generated linked list with a cycle"); setCurrentCodeLine(0);
                  setPointerLabels({}); setDeletingIds(new Set());
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-red-800">
                <Repeat size={12} /> Create Cycle
              </button>
            </>
          ) : (
            <>
              <span className="text-bp-700">|</span>
              <button onClick={generateRandom}
                className="flex items-center gap-1.5 px-3 py-2 bg-bp-800 hover:bg-bp-750 text-slate-300 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-bp-700">
                <Shuffle size={12} /> Random
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">Size</span>
                <input type="range" min={3} max={12} value={nodeCount}
                  onChange={(e) => setNodeCount(Number(e.target.value))}
                  className="w-16 accent-accent cursor-pointer" />
                <span className="text-[10px] text-slate-400 font-mono w-4">{nodeCount}</span>
              </div>
            </>
          )}

          <span className="text-bp-700">|</span>
          <div className="flex items-center gap-2">
            <Timer size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-400 font-semibold">Speed</span>
            <input type="range" min={100} max={2000} step={100} value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-20 accent-accent cursor-pointer" />
            <span className="text-[10px] text-slate-400 font-mono w-16 text-right">{getSpeedLabel(speedMs)}</span>
          </div>
        </div>

        {/* ─── MAIN CONTENT ──────────────────────────────── */}
        <div className="linked-list-content flex flex-col xl:flex-row gap-4">

          {/* LEFT: Visualisation + Playback + Logs */}
          <div ref={containerRef} className="linked-list-stage flex-1 flex flex-col gap-3 min-w-0">

            {/* Algorithm Banner + SVG Canvas */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ListOrdered size={16} className="text-slate-400" /> {algorithmLabel}
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span>Step: <span className="text-slate-300 font-bold">{currentStep}/{Math.max(totalSteps - 1, 0)}</span></span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono min-h-[20px]">
                {stepData ? stepData.description : statusText}
              </div>

              {/* ═══ SVG VISUALISATION ═══ */}
              <div className="bg-bp-950/50 border border-bp-800 rounded-lg overflow-hidden">
                {displayNodes.length === 0 ? (
                  <div className="flex items-center justify-center" style={{ height: 320 }}>
                    <span className="text-sm text-[#59574f] italic">Empty list — generate or insert nodes to begin</span>
                  </div>
                ) : (
                  <svg width="100%" height="320" viewBox={`0 0 ${svgWidth} 320`}
                    preserveAspectRatio="xMidYMid meet" className="block select-none">

                    {/* Arrow marker definitions */}
                    <defs>
                      {[
                        { id: "ll-arr-default", fill: "#4a4940" },
                        { id: "ll-arr-green",   fill: "#568b68" },
                        { id: "ll-arr-red",     fill: "#ed8068" },
                        { id: "ll-arr-cycle",   fill: "#c39d18" },
                      ].map(({ id, fill }) => (
                        <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5"
                          markerWidth="7" markerHeight="7" orient="auto">
                          <path d="M 0 1 L 9 5 L 0 9 Z" fill={fill} />
                        </marker>
                      ))}
                    </defs>

                    {/* NULL terminator */}
                    {showNull && (
                      <g>
                        <motion.line
                          animate={{ x1: lastNode.x + NODE_W / 2, x2: lastNode.x + NODE_W / 2 + 30 }}
                          y1={lastNode.y} y2={lastNode.y}
                          stroke="#39372f" strokeWidth={2}
                          markerEnd="url(#ll-arr-default)"
                          transition={springArrow}
                        />
                        <motion.text
                          animate={{ x: lastNode.x + NODE_W / 2 + 52 }}
                          y={lastNode.y}
                          fill="#59574f" fontSize={10} fontWeight="bold" fontFamily="monospace"
                          textAnchor="middle" dominantBaseline="central"
                          transition={springArrow}
                        >NULL</motion.text>
                      </g>
                    )}

                    {/* Straight arrows between nodes */}
                    {straightArrows.map((a) => (
                      <motion.line
                        key={a.key}
                        animate={{ x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }}
                        stroke={a.color} strokeWidth={a.width}
                        strokeDasharray={a.dash}
                        markerEnd={`url(#ll-arr-${a.marker})`}
                        transition={springArrow}
                      />
                    ))}

                    {/* Cycle arrows (curved) */}
                    {cycleArrows.map((c) => (
                      <g key={c.key}>
                        <path d={c.d} fill="none" stroke="#c39d18" strokeWidth={2.5}
                          strokeDasharray="6 4" markerEnd="url(#ll-arr-cycle)" />
                        <text x={c.midX} y={c.midY + 16} fill="#c39d18" fontSize={10}
                          fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">cycle</text>
                      </g>
                    ))}

                    {/* ─── NODES ─── */}
                    <AnimatePresence>
                      {displayNodes.map((node) => {
                        const nid = node.id;
                        const label = activeLabels[nid] || "";
                        const isDeleting = deletingIds.has(nid);
                        const { bg, border, text: textColor } = getNodeStyle(label, isDeleting);
                        const lw = label ? estimateLabelWidth(label) : 0;

                        return (
                          <motion.g
                            key={nid}
                            initial={{ opacity: 0, scale: 0.4, x: node.x, y: node.y }}
                            animate={{
                              opacity: isDeleting ? 0.35 : 1,
                              scale: isDeleting ? 0.85 : 1,
                              x: node.x,
                              y: node.y,
                            }}
                            exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.3 } }}
                            transition={springNode}
                          >
                            {/* Glow ring for active nodes */}
                            {(label === "curr" || label === "slow" || label === "fast" || label === "slow/fast" ||
                              label === "newNode" || label === "target" || label === "found" || label === "middle") && (
                              <motion.rect
                                x={-NODE_W / 2 - 4} y={-NODE_H / 2 - 4}
                                width={NODE_W + 8} height={NODE_H + 8}
                                rx={NODE_R + 3}
                                fill="none"
                                initial={{ stroke: "transparent", strokeWidth: 0 }}
                                animate={{ stroke: bg, strokeWidth: 2.5, opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}

                            {/* Node rectangle */}
                            <motion.rect
                              x={-NODE_W / 2} y={-NODE_H / 2}
                              width={NODE_W} height={NODE_H} rx={NODE_R}
                              strokeWidth={2}
                              initial={{ fill: "#fffdf6", stroke: "#171717" }}
                              animate={{ fill: bg, stroke: border }}
                              transition={{ duration: 0.35 }}
                            />

                            {/* Value text */}
                            <text
                              textAnchor="middle" dominantBaseline="central"
                              fill={textColor}
                              fontSize={16} fontWeight="bold"
                              fontFamily="ui-monospace, SFMono-Regular, monospace"
                            >{node.label}</text>

                            {/* Deletion cross */}
                            {isDeleting && (
                              <motion.g
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                stroke="#171717" strokeWidth={3} strokeLinecap="round"
                              >
                                <line x1={-NODE_W / 2 + 6} y1={-NODE_H / 2 + 6}
                                      x2={ NODE_W / 2 - 6} y2={ NODE_H / 2 - 6} />
                                <line x1={ NODE_W / 2 - 6} y1={-NODE_H / 2 + 6}
                                      x2={-NODE_W / 2 + 6} y2={ NODE_H / 2 - 6} />
                              </motion.g>
                            )}

                            {/* Pointer label above node */}
                            <AnimatePresence mode="wait">
                              {label && (
                                <motion.g
                                  key={`label-${nid}-${label}`}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                                  transition={springLabel}
                                >
                                  <rect
                                    x={-lw / 2} y={-NODE_H / 2 - 24}
                                    width={lw} height={18} rx={4}
                                    fill="#fffdf6" stroke="#171717" strokeWidth={1}
                                  />
                                  <text
                                    y={-NODE_H / 2 - 15}
                                    textAnchor="middle" dominantBaseline="central"
                                    fill="#171717" fontSize={10} fontWeight="bold"
                                    fontFamily="system-ui, sans-serif"
                                  >{label}</text>
                                </motion.g>
                              )}
                            </AnimatePresence>
                          </motion.g>
                        );
                      })}
                    </AnimatePresence>
                  </svg>
                )}
              </div>
            </div>

            {/* ─── PLAYBACK CONTROLS ─────────────────────── */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <button onClick={stepBackward} disabled={isAtStart || totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Back (←)"><SkipBack size={14} /></button>
                <button onClick={togglePlayPause} disabled={totalSteps === 0}
                  className="p-3 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white rounded-md cursor-pointer transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-accent-emphasis"
                  title={isRunning ? "Pause (Space)" : "Play (Space)"}>
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={stepForward} disabled={isAtEnd || totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Forward (→)"><SkipForward size={14} /></button>
                <button onClick={resetVisualizer} disabled={totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Reset (R)"><RotateCcw size={14} /></button>
              </div>
              <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] text-slate-500 font-mono w-8 text-right">{currentStep}</span>
                <input type="range" min={0} max={Math.max(totalSteps - 1, 0)} value={currentStep}
                  onChange={(e) => seekToStep(Number(e.target.value))}
                  className="flex-1 accent-accent cursor-pointer h-1" />
                <span className="text-[10px] text-slate-500 font-mono w-8">{Math.max(totalSteps - 1, 0)}</span>
              </div>
            </div>

            {/* ─── EXECUTION LOG ─────────────────────────── */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <ListOrdered size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Execution Log</span>
                <span className="text-[10px] text-slate-600 font-mono">({executionLogs.length} steps)</span>
              </div>
              <div className="max-h-[120px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {executionLogs.length === 0 ? (
                  <span className="text-[10px] text-slate-600 italic">No steps recorded yet. Run an operation to begin.</span>
                ) : (
                  executionLogs.map((log, i) => (
                    <div key={i}
                      className={`text-[10px] font-mono leading-relaxed px-2 py-0.5 rounded ${
                        log.step === currentStep ? "bg-accent-muted text-accent" : "text-slate-500"
                      }`}>
                      <span className="text-slate-600 mr-1.5">{log.step}.</span>{log.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Code Panel + Legend + Info + Shortcuts */}
          <div className="linked-list-inspector xl:w-[380px] flex-shrink-0 flex flex-col gap-3">
            <CodePanel algorithm={algorithm} currentLine={currentCodeLine} title={algorithmLabel} kind="linked-list" />

            {/* Legend */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                {[
                  { dot: "bg-[#fffdf6] border-[#171717]", label: "Default" },
                  { dot: "bg-[#ffdf3e] border-[#171717]", label: "Current (curr/slow/fast)" },
                  { dot: "bg-[#f0c2a3] border-[#171717]", label: "Temp Pointer" },
                  { dot: "bg-[#c5b6e7] border-[#171717]", label: "Target / Found" },
                  { dot: "bg-[#a9d4bb] border-[#171717]", label: "New / Inserted" },
                  { dot: "bg-[#ed8068] border-[#171717]", label: "Deleted / Bypassed" },
                  { dot: "bg-[#c5b6e7] border-[#171717]", label: "Head / Tail" },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded border ${dot}`} />
                    <span className="text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">List Info</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nodes:</span>
                  <span className="text-slate-300 font-mono">{nodesData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Head:</span>
                  <span className="text-slate-300 font-mono">{nodesData.length > 0 ? nodesData[0].label : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tail:</span>
                  <span className="text-slate-300 font-mono">{nodesData.length > 0 ? nodesData[nodesData.length - 1].label : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="text-green-400 font-mono">{COMPLEXITY_INFO[algorithm]?.time || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Space:</span>
                  <span className="text-blue-400 font-mono">{COMPLEXITY_INFO[algorithm]?.space || "—"}</span>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Keyboard size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Shortcuts</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                <span><kbd className="text-slate-300 bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-[9px]">Space</kbd> Play/Pause</span>
                <span><kbd className="text-slate-300 bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-[9px]">→</kbd> Step Forward</span>
                <span><kbd className="text-slate-300 bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-[9px]">←</kbd> Step Back</span>
                <span><kbd className="text-slate-300 bg-bp-800 border border-bp-700 px-1.5 py-0.5 rounded text-[9px]">R</kbd> Reset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
