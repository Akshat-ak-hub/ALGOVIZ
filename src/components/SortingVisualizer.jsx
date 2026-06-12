import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  ArrowUpDown,
  BarChart3,
  Timer,
  GripVertical,
  ListOrdered,
  Keyboard,
} from "lucide-react";
import { Vector } from "../algorithms/adt";
import { buildSortingSteps, ALGORITHM_NAMES } from "../algorithms/sortingAlgorithms";
import { isDivideAndConquer } from "../algorithms/sortTree";
import SortTree from "./SortTree";
import CodePanel from "./CodePanel";

const ALGORITHM_IDS = Object.keys(ALGORITHM_NAMES);

function generateRandomArray(size, maxVal = 99) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * maxVal) + 1);
}

function generateNearlySorted(size, maxVal = 99) {
  const arr = Array.from({ length: size }, (_, i) =>
    Math.floor((i / size) * maxVal) + 1 + Math.floor(Math.random() * 5 - 2)
  );
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 1) arr[i] = 1;
    if (arr[i] > maxVal) arr[i] = maxVal;
  }
  return arr;
}

function generateReversed(size, maxVal = 99) {
  return Array.from({ length: size }, (_, i) => maxVal - Math.floor((i * maxVal) / size));
}

function generateFewUnique(size, maxVal = 99) {
  const uniqueCount = Math.max(3, Math.floor(size / 4));
  const pool = Array.from({ length: uniqueCount }, () => Math.floor(Math.random() * maxVal) + 1);
  return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
}

function generateSmallRange(size, maxVal = 99) {
  const range = Math.max(5, Math.floor(size / 2));
  return Array.from({ length: size }, () => Math.floor(Math.random() * range) + 1);
}

const GENERATORS = {
  random: { fn: generateRandomArray, label: "Random" },
  "nearly-sorted": { fn: generateNearlySorted, label: "Nearly Sorted" },
  reversed: { fn: generateReversed, label: "Reversed" },
  "few-unique": { fn: generateFewUnique, label: "Few Unique" },
  "small-range": { fn: generateSmallRange, label: "Small Range" },
};

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState("bubble");
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(300);
  const [array, setArray] = useState(() => generateRandomArray(12));
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState("Press Space to play, or step through manually");
  const [executionLogs, setExecutionLogs] = useState([]);
  const [activeGenType, setActiveGenType] = useState("random");
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const totalSteps = steps.length;
  const stepData = steps[currentStep] || null;
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep >= totalSteps - 1;
  const algorithmLabel = ALGORITHM_NAMES[algorithm] || algorithm;

  const generateArray = useCallback((type = "random") => {
    const gen = GENERATORS[type] || GENERATORS.random;
    const arr = gen.fn(arraySize);
    setArray(arr);
    const newSteps = buildSortingSteps(algorithm, arr);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsRunning(false);
    setActiveGenType(type);
    setExecutionLogs([]);
    setStatusText(`Generated ${gen.label} array of size ${arr.length}`);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [algorithm, arraySize]);

  useEffect(() => {
    generateArray("random");
  }, []);

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
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isAtEnd, totalSteps, speed]);

  // Collect logs as steps progress
  useEffect(() => {
    if (!stepData || !stepData.description) return;
    setExecutionLogs((prev) => {
      const last = prev[prev.length - 1];
      const desc = `${currentStep}. ${stepData.description}`;
      if (last && last.step === currentStep) {
        const updated = [...prev];
        updated[updated.length - 1] = { step: currentStep, text: stepData.description };
        return updated;
      }
      if (last && last.text === stepData.description) return prev;
      return [...prev, { step: currentStep, text: stepData.description }];
    });
  }, [currentStep, stepData]);

  const togglePlayPause = useCallback(() => {
    if (isAtEnd && !isRunning) {
      setCurrentStep(0);
      setIsRunning(true);
      return;
    }
    setIsRunning((p) => !p);
  }, [isAtEnd, isRunning]);

  const stepForward = useCallback(() => {
    if (isAtEnd) return;
    setIsRunning(false);
    setCurrentStep((p) => Math.min(p + 1, totalSteps - 1));
  }, [isAtEnd, totalSteps]);

  const stepBackward = useCallback(() => {
    if (isAtStart) return;
    setIsRunning(false);
    setCurrentStep((p) => Math.max(p - 1, 0));
  }, [isAtStart]);

  const seekToStep = useCallback((idx) => {
    setIsRunning(false);
    setCurrentStep(Math.max(0, Math.min(idx, totalSteps - 1)));
  }, [totalSteps]);

  const resetVisualizer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newSteps = buildSortingSteps(algorithm, array);
    setSteps(newSteps);
    setCurrentStep(0);
    setExecutionLogs([]);
    setStatusText("Reset — ready to replay");
  }, [algorithm, array]);

  const handleAlgorithmChange = useCallback((alg) => {
    setAlgorithm(alg);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newSteps = buildSortingSteps(alg, array);
    setSteps(newSteps);
    setCurrentStep(0);
    setExecutionLogs([]);
    setStatusText(`Switched to ${ALGORITHM_NAMES[alg]}`);
  }, [array]);

  const handleSizeChange = useCallback((size) => {
    setArraySize(size);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const gen = GENERATORS[activeGenType] || GENERATORS.random;
    const arr = gen.fn(size);
    setArray(arr);
    const newSteps = buildSortingSteps(algorithm, arr);
    setSteps(newSteps);
    setCurrentStep(0);
    setExecutionLogs([]);
  }, [algorithm, activeGenType]);

  // Keyboard shortcuts
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const rawArray = stepData ? stepData.array : array;
  const displayArray = rawArray instanceof Vector ? rawArray.toArray() : rawArray;
  const currentCodeLine = stepData ? stepData.codeLine : 0;
  const stepDescription = stepData ? stepData.description : "";
  const comparisons = stepData ? stepData.comparisons : 0;
  const swaps = stepData ? stepData.swaps : 0;
  const sortedSet = stepData ? stepData.sorted : new Set();
  const comparing = stepData ? stepData.comparing : [];
  const swapping = stepData ? stepData.swapping : [];
  const pivotIdx = stepData ? stepData.pivot : null;
  const merging = stepData ? stepData.merging : [];
  const ptr = stepData ? stepData.ptr : {};
  const currentPlace = stepData ? stepData.currentPlace : null;
  const placeLabel = stepData ? stepData.placeLabel : null;
  const digitValues = stepData ? stepData.digitValues : null;
  const countArray = stepData ? stepData.countArray : null;
  const countLabels = stepData ? stepData.countLabels : null;
  const outputArray = stepData ? stepData.outputArray : null;

  const getCardState = useCallback((idx) => {
    if (sortedSet.has(idx)) return "sorted";
    if (swapping.includes(idx)) return "swapping";
    if (comparing.includes(idx)) return "comparing";
    if (pivotIdx === idx) return "pivot";
    if (merging.includes(idx)) return "merging";
    return "default";
  }, [sortedSet, swapping, comparing, pivotIdx, merging]);

  const cardStateStyles = {
    default: "bg-bp-900 border-bp-700 text-bp-200 shadow-sm",
    comparing: "bg-[#d29922]/10 border-[#d29922] text-[#d29922] font-semibold",
    swapping: "bg-[#f85149]/10 border-[#f85149] text-[#f85149] font-semibold",
    sorted: "bg-[#3fb950]/10 border-[#3fb950] text-[#3fb950] font-semibold",
    pivot: "bg-[#1f6feb]/20 border-[#58a6ff] text-[#58a6ff] font-semibold",
    merging: "bg-[#58a6ff]/10 border-[#58a6ff]/50 text-[#58a6ff] font-semibold",
  };

  return (
    <div className="bg-bp-950 min-h-[calc(100vh-130px)] p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-bp-900 border border-bp-800 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={algorithm}
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              className="bg-bp-950 border border-bp-700 rounded-md text-slate-200 text-xs px-3 py-2 cursor-pointer outline-none min-w-[130px]"
            >
              {ALGORITHM_IDS.map((id) => (
                <option key={id} value={id}>{ALGORITHM_NAMES[id]}</option>
              ))}
            </select>
          </div>

          <span className="text-bp-700">|</span>

          {Object.entries(GENERATORS).map(([key, gen]) => (
            <button
              key={key}
              onClick={() => generateArray(key)}
              className={`flex items-center gap-1.5 font-bold text-[10px] py-2 px-3 rounded-md cursor-pointer transition duration-200 ${
                activeGenType === key
                  ? "bg-accent-emphasis text-white"
                  : "bg-bp-800 hover:bg-bp-750 text-slate-300"
              }`}
            >
              {key === "random" && <Shuffle size={12} />}
              {gen.label}
            </button>
          ))}

          <span className="text-bp-700">|</span>

          <div className="flex items-center gap-2">
            <GripVertical size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-400 font-semibold">Size</span>
            <input
              type="range"
              min={5}
              max={50}
              value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-20 accent-accent cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono w-6">{arraySize}</span>
          </div>

          <span className="text-bp-700">|</span>

          <div className="flex items-center gap-2">
            <Timer size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-400 font-semibold">Speed</span>
            <input
              type="range"
              min={20}
              max={1000}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 accent-accent cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono w-8">{speed}ms</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Left: Array Display + Playback + Logs */}
          <div ref={containerRef} className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Algorithm Banner */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <BarChart3 size={16} className="text-slate-400" />
                  {algorithmLabel}
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span>Comparisons: <span className="text-slate-300 font-bold">{comparisons}</span></span>
                  <span>Swaps: <span className="text-slate-300 font-bold">{swaps}</span></span>
                  <span>Step: <span className="text-slate-300 font-bold">{currentStep}/{Math.max(totalSteps - 1, 0)}</span></span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono min-h-[20px]">
                {stepDescription || statusText}
              </div>

              {/* Array Display */}
              {isDivideAndConquer(algorithm) ? (
                <div className="bg-bp-950/50 border border-bp-800 rounded-lg py-3 px-2">
                  <SortTree
                    array={displayArray}
                    algorithm={algorithm}
                    stepData={stepData}
                    sortedSet={sortedSet}
                  />
                </div>
              ) : (
                <div className="bg-bp-950/50 border border-bp-800 rounded-lg py-5 px-3 overflow-x-auto custom-scrollbar">
                  <div className="flex flex-col items-center gap-0 min-w-max mx-auto">
                    {/* Place label header */}
                    {placeLabel && (
                      <div className="mb-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        Sorting by <span className="text-slate-300">{placeLabel}</span> place
                      </div>
                    )}

                    {/* Digit Values Row (Radix / Counting Sort) */}
                    {digitValues && (
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {digitValues.map((digit, idx) => (
                          <div key={idx} className="w-11 text-center">
                            <span className="text-[9px] font-mono text-slate-500 bg-bp-850 border border-bp-700 px-1.5 py-0.5 rounded">
                              {digit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pointer Labels Row */}
                    <div className="flex items-center justify-center gap-1.5">
                      {displayArray.map((val, idx) => {
                        const ptrs = Object.entries(ptr)
                          .filter(([, i]) => i === idx)
                          .map(([label]) => label);
                        return (
                          <div key={idx} className="w-11 flex flex-col items-center min-h-[32px] justify-end">
                            {ptrs.length > 0 && (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[10px] font-bold text-accent leading-none">
                                  {ptrs.join("/")}
                                </span>
                                <span className="text-accent/70 text-[9px] leading-none">↓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Array Boxes Row */}
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      {displayArray.map((val, idx) => {
                        const state = getCardState(idx);
                        const style = cardStateStyles[state];
                        return (
                          <div
                            key={idx}
                            className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center select-none transition-all duration-200 ${style}`}
                          >
                            <span className="text-sm font-bold leading-none">{val}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Index Labels Row */}
                    <div className="flex items-center justify-center gap-1.5">
                      {displayArray.map((val, idx) => (
                        <div key={idx} className="w-11 text-center">
                          <span className="text-[7px] text-slate-600 font-mono">{idx}</span>
                        </div>
                      ))}
                    </div>

                    {/* Count / Prefix Array Row (Radix / Counting Sort) */}
                    {countArray && countLabels && (
                      <div className="mt-3 pt-3 border-t border-bp-800 w-full">
                        <div className="text-[9px] font-bold text-slate-600 mb-1.5 text-center tracking-wider">
                          {countArray.length <= 11 ? "COUNT / PREFIX" : "COUNT"}
                        </div>
                        <div className="flex items-center justify-center gap-0.5 flex-wrap">
                          {countArray.map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-mono text-slate-500">{countLabels[idx]}</span>
                              <div className="w-7 h-7 rounded-md border border-bp-700 bg-bp-800 flex items-center justify-center">
                                <span className="text-[10px] font-bold font-mono text-slate-400">{val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Output Array Row */}
                    {outputArray && (
                      <div className="mt-2 pt-2 border-t border-bp-800 w-full">
                        <div className="text-[9px] font-bold text-slate-600 mb-1.5 text-center tracking-wider">OUTPUT</div>
                        <div className="flex items-center justify-center gap-1">
                          {outputArray.map((val, idx) => (
                            <div
                              key={idx}
                              className={`w-10 h-8 rounded-md border flex items-center justify-center ${
                                val !== 0
                                  ? "bg-accent-muted border-accent/30"
                                  : "bg-bp-900 border-bp-800"
                              }`}
                            >
                              <span className={`text-[10px] font-bold font-mono ${val !== 0 ? "text-accent" : "text-bp-700"}`}>
                                {val !== 0 ? val : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={stepBackward}
                  disabled={isAtStart}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Back (←)"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-accent-emphasis hover:bg-[#1f6feb]/95 text-white rounded-md cursor-pointer transition duration-200 border border-accent-emphasis"
                  title={isRunning ? "Pause (Space)" : "Play (Space)"}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={isAtEnd}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 disabled:opacity-30 text-slate-300 rounded-md cursor-pointer transition duration-200 disabled:cursor-not-allowed border border-bp-700"
                  title="Step Forward (→)"
                >
                  <SkipForward size={14} />
                </button>
                <button
                  onClick={resetVisualizer}
                  className="p-2.5 bg-bp-800 hover:bg-bp-750 text-slate-300 rounded-md cursor-pointer transition duration-200 border border-bp-700"
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
                  <span className="text-[10px] text-slate-600 italic">No steps recorded yet. Play or step through to see the log.</span>
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
          <div className="xl:w-[380px] flex-shrink-0 flex flex-col gap-3">
            <CodePanel
              algorithm={algorithm}
              currentLine={currentCodeLine}
              title={algorithmLabel}
              kind="sorting"
            />

            {/* Legend */}
            <div className="bg-bp-900 border border-bp-800 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                {[
                  { color: "bg-bp-900 border-bp-700", label: "Default" },
                  { color: "bg-[#d29922]/10 border-[#d29922]", label: "Comparing" },
                  { color: "bg-[#f85149]/10 border-[#f85149]", label: "Swapping" },
                  { color: "bg-[#1f6feb]/20 border-[#58a6ff]", label: "Pivot" },
                  { color: "bg-[#3fb950]/10 border-[#3fb950]", label: "Sorted" },
                  { color: "bg-[#58a6ff]/10 border-[#58a6ff]/50", label: "Merging" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded border ${color}`} />
                    <span className="text-slate-400">{label}</span>
                  </div>
                ))}
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
