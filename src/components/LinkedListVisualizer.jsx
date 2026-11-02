import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Shuffle, Timer, Plus, Trash2, Search, ArrowLeftRight,
  ListOrdered, Keyboard, Split, Repeat, Info,
} from "lucide-react";
import { LinkedListModel } from "../models/LinkedListModel";
import { ALGORITHM_NAMES, ALGORITHM_IDS } from "../algorithms/linkedListAlgorithmCode";
import CodePanel from "./CodePanel";
import { useToast } from "../hooks/useToast";

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

export default function LinkedListVisualizer() {
  const canvasRef = useRef(null);
  const listRef = useRef(new LinkedListModel());
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

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

  useEffect(() => {
    generateRandom();
  }, [generateRandom]);

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

  useEffect(() => {
    if (!stepData) return;
    const desc = `${currentStep}. ${stepData.description}`;
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

  useEffect(() => {
    if (stepData) {
      setCurrentCodeLine(stepData.codeLine || 0);
      setPointerLabels(stepData.pointerLabels || {});
      if (stepData.deleteId) {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.add(stepData.deleteId);
          return next;
        });
      }
    }
  }, [stepData]);

  const computeLayout = (nodes, canvasWidth) => {
    const totalWidth = nodes.length * 120 - 20;
    const startX = Math.max(60, (canvasWidth - totalWidth) / 2);
    nodes.forEach((node, i) => {
      node.x = startX + i * 120;
      node.y = 140;
    });
  };

  const drawLinkedList = () => {
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

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, r) {
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
      };
    }

    let displayNodes;
    if (stepData && stepData.nodesSnapshot && stepData.nodesSnapshot.length > 0) {
      displayNodes = stepData.nodesSnapshot.map((n) => ({ ...n }));
    } else {
      displayNodes = nodesData.map((n) => ({ ...n }));
    }

    if (displayNodes.length === 0) {
      ctx.fillStyle = "#59574f";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Empty list — generate or insert nodes to begin", w / 2, h / 2);
      return;
    }

    computeLayout(displayNodes, w);

    const rw = 70;
    const rh = 42;

    // Draw NULL pointer at end (only if last node has no nextId)
    const lastNode = displayNodes[displayNodes.length - 1];
    if (lastNode && (lastNode.nextId === null || lastNode.nextId === undefined)) {
      const nullX = lastNode.x + rw / 2 + 30;
      const nullY = lastNode.y;
      ctx.strokeStyle = "#39372f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lastNode.x + rw / 2, lastNode.y);
      ctx.lineTo(nullX, nullY);
      ctx.stroke();
      drawArrowhead(ctx, lastNode.x + rw / 2, lastNode.y, nullX, nullY, "#39372f");
      ctx.fillStyle = "#59574f";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("NULL", nullX + 18, nullY);
    }

    // Draw arrows first (behind nodes)
    const action = stepData?.action;
    const deleteId = stepData?.deleteId;
    const labels = stepData?.pointerLabels || {};

    for (const node of displayNodes) {
      const nextId = node.nextId;
      if (nextId === null || nextId === undefined) continue;
      const nextNode = displayNodes.find((n) => n.id === nextId);
      if (!nextNode) continue;

      const startX = node.x + rw / 2;
      const startY = node.y;
      const endX = nextNode.x - rw / 2;
      const endY = nextNode.y;

      // Determine arrow styling based on action and labels
      const nodeLabel = labels[node.id] || "";
      const isTempNode = nodeLabel === "temp";
      const isPrevNode = nodeLabel === "prev";
      const isNextNode = labels[nextNode.id] === "next";

      let arrowColor = "#39372f";
      let arrowWidth = 2;
      let arrowDash = [];

      if (action === "delete" && (deleteId === node.id || deleteId === nextNode.id)) {
        arrowColor = "#ed8068";
        arrowWidth = 3;
        arrowDash = [6, 4];
      } else if (action === "relink" && isPrevNode && isNextNode) {
        arrowColor = "#568b68";
        arrowWidth = 3;
      } else if (action === "relink" && isTempNode) {
        arrowColor = "#ed8068";
        arrowWidth = 2;
        arrowDash = [4, 4];
      } else if (action === "delete" && isTempNode) {
        arrowColor = "#ed8068";
        arrowWidth = 3;
        arrowDash = [6, 4];
      }

      // Check if this is a backward arrow (cycle)
      const isCycleArrow = nextNode.x <= node.x;

      if (isCycleArrow) {
        const midY = node.y + rh / 2 + 40;
        ctx.strokeStyle = arrowColor === "#568b68" ? "#568b68" : "#c39d18";
        ctx.lineWidth = arrowColor === "#568b68" ? 3 : 2.5;
        ctx.setLineDash(arrowColor === "#568b68" ? [] : [6, 4]);
        ctx.beginPath();
        ctx.moveTo(node.x + rw / 2, node.y + rh / 2);
        ctx.quadraticCurveTo(node.x + rw / 2, midY, (node.x + nextNode.x) / 2, midY);
        ctx.quadraticCurveTo(nextNode.x - rw / 2, midY, nextNode.x - rw / 2, nextNode.y + rh / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        drawArrowhead(ctx, (node.x + nextNode.x) / 2, midY, nextNode.x - rw / 2, nextNode.y + rh / 2, ctx.strokeStyle);
        ctx.fillStyle = "#c39d18";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("cycle", (node.x + nextNode.x) / 2, midY + 14);
      } else {
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = arrowWidth;
        ctx.setLineDash(arrowDash);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        drawArrowhead(ctx, startX, startY, endX, endY, arrowColor);
      }
    }

    // Draw nodes
    for (const node of displayNodes) {
      const nodeId = node.id;
      const isDeleting = deletingIds.has(nodeId);
      const isTarget = pointerLabels[nodeId] === "target" || pointerLabels[nodeId] === "found";
      const isCurrent = pointerLabels[nodeId] === "curr" || pointerLabels[nodeId] === "slow" || pointerLabels[nodeId] === "fast";
      const isTemp = pointerLabels[nodeId] === "temp";
      const isNewNode = stepData && stepData.action === "insert" && (stepData.pointerLabels?.[nodeId] === "newNode" || pointerLabels[nodeId] === "newNode");
      const isHead = pointerLabels[nodeId] === "head" || pointerLabels[nodeId] === "head/tail";
      const isTail = pointerLabels[nodeId] === "tail";

      let bgColor, borderColor, textColor;
      const x = node.x - rw / 2;
      const y = node.y - rh / 2;

      if (isDeleting) {
        bgColor = "#ed8068"; borderColor = "#171717"; textColor = "#171717";
      } else if (isTemp) {
        bgColor = "#f0c2a3"; borderColor = "#171717"; textColor = "#171717";
      } else if (isTarget) {
        bgColor = "#c5b6e7"; borderColor = "#171717"; textColor = "#171717";
      } else if (isCurrent) {
        bgColor = "#ffdf3e"; borderColor = "#171717"; textColor = "#171717";
      } else if (isNewNode) {
        bgColor = "#a9d4bb"; borderColor = "#171717"; textColor = "#171717";
      } else if (isHead || isTail) {
        bgColor = "#c5b6e7"; borderColor = "#171717"; textColor = "#171717";
      } else {
        bgColor = "#fffdf6"; borderColor = "#171717"; textColor = "#171717";
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(x, y, rw, rh, 8);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, rw, rh, 8);
      ctx.stroke();

      if (isDeleting) {
        ctx.strokeStyle = "#171717";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + rw - 4, y + rh - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + rw - 4, y + 4);
        ctx.lineTo(x + 4, y + rh - 4);
        ctx.stroke();
      }

      ctx.fillStyle = textColor;
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);

      const label = pointerLabels[nodeId];
      if (label) {
        const labelFontSize = 10;
        ctx.font = `bold ${labelFontSize}px sans-serif`;
        const labelW = ctx.measureText(label).width;
        const labelX = node.x;
        const labelY = node.y - 34;

        ctx.fillStyle = "#fffdf6";
        ctx.beginPath();
        ctx.roundRect(labelX - labelW / 2 - 4, labelY - 5, labelW + 8, 15, 3);
        ctx.fill();
        ctx.strokeStyle = "#171717";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#171717";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX, labelY + 2);
      }
    }
  };

  const drawArrowhead = (ctx, fromX, fromY, toX, toY, color) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLen = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - 0.35), toY - headLen * Math.sin(angle - 0.35));
    ctx.lineTo(toX - headLen * Math.cos(angle + 0.35), toY - headLen * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    drawLinkedList();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => drawLinkedList());
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const runOperation = (value) => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
      case "insert-head":
        newSteps = model.insertAtHead(val);
        break;
      case "insert-tail":
        newSteps = model.insertAtTail(val);
        break;
      case "insert-position": {
        const pos = parseInt(positionValue, 10);
        if (Number.isNaN(pos)) {
          showToast("Please enter a valid position", "warning");
          return;
        }
        newSteps = model.insertAtPosition(val, pos);
        break;
      }
      case "delete-head":
        newSteps = model.deleteHead();
        break;
      case "delete-tail":
        newSteps = model.deleteTail();
        break;
      case "delete-value":
        if (Number.isNaN(val)) return;
        newSteps = model.deleteByValue(val);
        break;
      case "reverse":
        newSteps = model.reverse();
        break;
      case "detect-cycle":
        newSteps = model.detectCycle();
        break;
      case "find-middle":
        newSteps = model.getMiddle();
        break;
      case "search":
        if (Number.isNaN(val)) return;
        newSteps = model.search(val);
        break;
    }

    setNodesData(model.toNodesData());
    setSteps(newSteps);
    setCurrentStep(0);
    setExecutionLogs([]);
    setCurrentCodeLine(0);
    setStatusText(`Running ${algorithmLabel}...`);
    setIsRunning(true);
  };

  const togglePlayPause = useCallback(() => {
    if (totalSteps === 0) return;
    if (isAtEnd && !isRunning) {
      setCurrentStep(0);
      setIsRunning(true);
      return;
    }
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
    const currStep = steps[currentStep];

    if (currStep && currStep.deleteId != null) {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(currStep.deleteId);
        return next;
      });
    }

    setCurrentStep(currentStep - 1);
  }, [isAtStart, currentStep, steps]);

  const resetVisualizer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSteps([]);
    setCurrentStep(0);
    setExecutionLogs([]);
    setStatusText("Reset — ready to replay");
    setCurrentCodeLine(0);
    setPointerLabels({});
    setDeletingIds(new Set());
    setNodesData(listRef.current.toNodesData());
  }, []);

  const seekToStep = useCallback((idx) => {
    setIsRunning(false);
    const targetIdx = Math.max(0, Math.min(idx, totalSteps - 1));

    const currentDeleting = new Set();
    for (let i = 0; i <= targetIdx; i++) {
      const s = steps[i];
      if (s && s.action === "delete" && s.deleteId != null) {
        currentDeleting.add(s.deleteId);
      }
    }
    setDeletingIds(currentDeleting);

    setCurrentStep(targetIdx);
  }, [totalSteps, steps]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetVisualizer();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, stepForward, stepBackward, resetVisualizer]);

  const getSpeedLabel = (ms) => {
    const entry = SPEED_LABELS.find((s) => s.ms === ms);
    return entry ? entry.label : "Custom";
  };

  const operationIcons = {
    "insert-head": <Plus size={14} />,
    "insert-tail": <Plus size={14} />,
    "insert-position": <Plus size={14} />,
    "delete-head": <Trash2 size={14} />,
    "delete-tail": <Trash2 size={14} />,
    "delete-value": <Trash2 size={14} />,
    reverse: <ArrowLeftRight size={14} />,
    "detect-cycle": <Repeat size={14} />,
    "find-middle": <Split size={14} />,
    search: <Search size={14} />,
  };

  return (
    <div className="linked-list-workbench bg-bp-950 min-h-[calc(100vh-130px)] p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* Top Controls Bar */}
        <div className="linked-list-controls flex flex-wrap items-center gap-3 bg-bp-900 border border-bp-800 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ListOrdered size={14} className="text-slate-400" />
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none min-w-[140px]"
            >
              {ALGORITHM_IDS.map((id) => (
                <option key={id} value={id}>{ALGORITHM_NAMES[id]}</option>
              ))}
            </select>
          </div>

          <span className="text-bp-700">|</span>

          {needsInput && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={OPERATIONS_WITH_INPUT[algorithm].placeholder}
                className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 w-28 outline-none font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") runOperation(inputValue);
                }}
              />
              {needsPos && (
                <input
                  type="number"
                  value={positionValue}
                  onChange={(e) => setPositionValue(e.target.value)}
                  placeholder={OPERATIONS_WITH_INPUT[algorithm].posPlaceholder}
                  className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 w-24 outline-none font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runOperation(inputValue);
                  }}
                />
              )}
              <button
                onClick={() => runOperation(inputValue)}
                className="flex items-center gap-1.5 px-3 py-2 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-accent-emphasis"
              >
                {operationIcons[algorithm]}
                Run
              </button>
            </div>
          )}

          {!needsInput && (
            <button
              onClick={() => runOperation()}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-accent-emphasis"
            >
              {operationIcons[algorithm]}
              Run
            </button>
          )}

          {algorithm === "detect-cycle" ? (
            <>
              <span className="text-bp-700">|</span>
              <button
                onClick={generateRandom}
                className="flex items-center gap-1.5 px-3 py-2 bg-bp-800 hover:bg-bp-750 text-slate-300 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-bp-700"
              >
                <Shuffle size={12} />
                Random
              </button>
              <span className="text-bp-700">|</span>
              <button
                onClick={() => {
                  listRef.current.createCycle();
                  setNodesData(listRef.current.toNodesData());
                  setSteps([]);
                  setCurrentStep(0);
                  setIsRunning(false);
                  setExecutionLogs([]);
                  setStatusText("Generated linked list with a cycle");
                  setCurrentCodeLine(0);
                  setPointerLabels({});
                  setDeletingIds(new Set());
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-red-800"
              >
                <Repeat size={12} />
                Create Cycle
              </button>
            </>
          ) : (
            <>
              <span className="text-bp-700">|</span>
              <button
                onClick={generateRandom}
                className="flex items-center gap-1.5 px-3 py-2 bg-bp-800 hover:bg-bp-750 text-slate-300 text-xs font-bold rounded-md cursor-pointer transition duration-200 border border-bp-700"
              >
                <Shuffle size={12} />
                Random
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">Size</span>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={nodeCount}
                  onChange={(e) => setNodeCount(Number(e.target.value))}
                  className="w-16 accent-accent cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono w-4">{nodeCount}</span>
              </div>
            </>
          )}

          <span className="text-bp-700">|</span>

          <div className="flex items-center gap-2">
            <Timer size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-400 font-semibold">Speed</span>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-20 accent-accent cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono w-16 text-right">{getSpeedLabel(speedMs)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="linked-list-content flex flex-col xl:flex-row gap-4">
          {/* Left: Canvas + Playback + Logs */}
          <div ref={containerRef} className="linked-list-stage flex-1 flex flex-col gap-3 min-w-0">
            {/* Algorithm Banner + Canvas */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ListOrdered size={16} className="text-slate-400" />
                  {algorithmLabel}
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span>Step: <span className="text-slate-300 font-bold">{currentStep}/{Math.max(totalSteps - 1, 0)}</span></span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono min-h-[20px]">
                {stepData ? stepData.description : statusText}
              </div>

              <div className="bg-bp-950/50 border border-bp-800 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[320px] block cursor-default"
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={stepBackward}
                  disabled={isAtStart || totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Back (←)"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  onClick={togglePlayPause}
                  disabled={totalSteps === 0}
                  className="p-3 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white rounded-md cursor-pointer transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-accent-emphasis"
                  title={isRunning ? "Pause (Space)" : "Play (Space)"}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={isAtEnd || totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Forward (→)"
                >
                  <SkipForward size={14} />
                </button>
                <button
                  onClick={resetVisualizer}
                  disabled={totalSteps === 0}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Reset (R)"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] text-slate-500 font-mono w-8 text-right">{currentStep}</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(totalSteps - 1, 0)}
                  value={currentStep}
                  onChange={(e) => seekToStep(Number(e.target.value))}
                  className="flex-1 accent-accent cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 font-mono w-8">{Math.max(totalSteps - 1, 0)}</span>
              </div>
            </div>

            {/* Execution Log */}
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
                    <div
                      key={i}
                      className={`text-[10px] font-mono leading-relaxed px-2 py-0.5 rounded ${
                        log.step === currentStep
                          ? "bg-accent-muted text-accent"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="text-slate-600 mr-1.5">{log.step}.</span>
                      {log.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Code Panel + Legend */}
          <div className="linked-list-inspector xl:w-[380px] flex-shrink-0 flex flex-col gap-3">
            <CodePanel
              algorithm={algorithm}
              currentLine={currentCodeLine}
              title={algorithmLabel}
              kind="linked-list"
            />

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
