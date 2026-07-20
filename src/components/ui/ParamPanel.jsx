import { SlidersHorizontal, Minus, Plus } from "lucide-react";

/**
 * A reusable slider row for the parameters inspector.
 *
 * Props:
 *  - label       : string
 *  - value       : number  (raw slider value)
 *  - min, max, step
 *  - onChange(nextValue:number)
 *  - display     : string  — formatted value shown in the badge
 *  - leftHint, rightHint : optional end captions
 *  - disabled    : boolean
 *  - onDec, onInc : optional stepper handlers (render +/- buttons when provided)
 */
export function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  leftHint,
  rightHint,
  disabled = false,
  onDec,
  onInc,
}) {
  const hasSteppers = typeof onDec === "function" && typeof onInc === "function";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        {display != null && (
          <span className="bg-bp-950 border border-bp-700 px-2 py-0.5 rounded text-[10px] font-bold text-accent tabular-nums">
            {display}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {hasSteppers && (
          <button
            type="button"
            onClick={onDec}
            disabled={disabled || value <= min + 1e-6}
            aria-label={`Decrease ${label}`}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded bg-bp-700 hover:bg-bp-600 disabled:opacity-30 text-slate-200 cursor-pointer transition-colors duration-200"
          >
            <Minus size={12} />
          </button>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-bp-700 rounded appearance-none cursor-pointer accent-accent disabled:opacity-40"
        />
        {hasSteppers && (
          <button
            type="button"
            onClick={onInc}
            disabled={disabled || value >= max - 1e-6}
            aria-label={`Increase ${label}`}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded bg-bp-700 hover:bg-bp-600 disabled:opacity-30 text-slate-200 cursor-pointer transition-colors duration-200"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {(leftHint || rightHint) && (
        <div className="flex justify-between text-[9px] font-bold text-slate-500">
          <span>{leftHint}</span>
          <span>{rightHint}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Parameters inspector card ("AlgoVisual" right panel).
 * Wrap ParamSlider rows as children.
 */
export default function ParamPanel({ title = "Parameters", children }) {
  return (
    <div className="bg-bp-900 border border-bp-800 rounded-lg overflow-hidden shadow-sm flex flex-col">
      <div className="flex items-center gap-2 bg-bp-950 border-b border-bp-800 px-3 py-2 text-slate-300">
        <SlidersHorizontal size={13} className="text-accent" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}
