import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-[#2e2e2e] bg-[#161616] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 font-bold text-sm">⚡</span>
        <span className="text-xs font-semibold text-slate-400">
          Algo<span className="text-cyan-400">Flow</span>
        </span>
        <span className="text-[10px] text-slate-600">•</span>
        <span className="text-[10px] text-slate-500">Interactive Algorithm Visualizer</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-slate-500">Built for students & interview prep</span>
        <span className="text-[10px] text-slate-600">•</span>
        <span className="text-[10px] text-slate-500">Trees • Graphs • DSA</span>
      </div>
    </footer>
  );
}
