import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

/**
 * Floating segmented playback control ("AlgoVisual" style).
 * Overlays the bottom-center of a visualizer canvas.
 *
 * Props:
 *  - isPlaying    : boolean  — toggles Play/Pause icon
 *  - isRunning    : boolean  — whether an algorithm run is active
 *  - canBack      : boolean  — enable the Back button
 *  - canStep      : boolean  — enable the Step/Next button
 *  - stepLabel    : string   — optional "Step 3 / 12" caption
 *  - onBack, onPlayPause, onStep, onReset : handlers
 */
export default function PlaybackPill({
  isPlaying = false,
  isRunning = false,
  canBack = false,
  canStep = false,
  stepLabel = "",
  onBack,
  onPlayPause,
  onStep,
  onReset,
}) {
  const segBtn =
    "flex items-center justify-center gap-1.5 px-3.5 h-9 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5">
      {stepLabel && (
        <span className="pointer-events-none text-[10px] font-bold tabular-nums text-slate-300 bg-bp-950/70 backdrop-blur-sm border border-bp-700 rounded-full px-2.5 py-0.5">
          {stepLabel}
        </span>
      )}

      <div className="playback-pill pointer-events-auto flex items-center gap-1 rounded-xl p-1.5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          title="Step back"
          aria-label="Step back"
          className={`${segBtn} text-slate-300 hover:text-accent hover:bg-bp-800/70`}
        >
          <SkipBack size={14} />
        </button>

        <button
          type="button"
          onClick={onPlayPause}
          disabled={!isRunning}
          title={isPlaying ? "Pause" : "Play"}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`${segBtn} playback-pill-primary min-w-[92px] bg-accent-emphasis text-white hover:brightness-110`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={onStep}
          disabled={!canStep}
          title="Step forward"
          aria-label="Step forward"
          className={`${segBtn} text-slate-300 hover:text-accent hover:bg-bp-800/70`}
        >
          Step
          <SkipForward size={14} />
        </button>

        <span className="mx-0.5 h-5 w-px bg-bp-700" aria-hidden="true" />

        <button
          type="button"
          onClick={onReset}
          title="Reset"
          aria-label="Reset"
          className={`${segBtn} text-rose-400 hover:text-rose-300 hover:bg-rose-500/10`}
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
