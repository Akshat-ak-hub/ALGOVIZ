/**
 * VisualizerWorkspace — reusable 3-panel IDE-style shell for the
 * algorithm visualizers ("AlgoVisual" layout):
 *
 *   ┌──────────┬────────────────────┬──────────────┐
 *   │  left    │      center        │    right     │
 *   │ (browser)│  (canvas + extras) │ (code/params)│
 *   └──────────┴────────────────────┴──────────────┘
 *
 * On small screens the columns stack vertically.
 *
 * Props:
 *  - left     : ReactNode — algorithm browser / editor controls
 *  - right    : ReactNode — code panel + parameters inspector
 *  - children : ReactNode — center column (canvas + tables/logs)
 *  - leftWidth / rightWidth : optional Tailwind width classes
 */
export default function VisualizerWorkspace({
  left,
  right,
  children,
  leftWidth = "lg:w-[280px] xl:w-[300px]",
  rightWidth = "lg:w-[340px] xl:w-[400px]",
}) {
  return (
    <div className="bg-bp-950 min-h-[calc(100vh-68px)] flex flex-col xl:flex-row p-4 gap-4 select-none font-sans">
      {/* Left — algorithm browser / editor */}
      {left && (
        <aside
          className={`w-full ${leftWidth} flex flex-col gap-3 overflow-y-auto xl:max-h-[calc(100vh-100px)] flex-shrink-0 pr-1 min-w-0`}
        >
          {left}
        </aside>
      )}

      {/* Center — canvas + extras */}
      <main className="flex-grow flex flex-col gap-4 xl:max-h-[calc(100vh-100px)] xl:overflow-y-auto pr-1 min-w-0">
        {children}
      </main>

      {/* Right — inspector (code + params) */}
      {right && (
        <aside
          className={`w-full ${rightWidth} flex flex-col gap-4 xl:max-h-[calc(100vh-100px)] xl:overflow-y-auto flex-shrink-0 min-w-0`}
        >
          {right}
        </aside>
      )}
    </div>
  );
}
