import React from "react";

export default function NavBarHeader({ currentPage, setCurrentPage }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#2e2e2e] bg-[#1a1a1a]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => setCurrentPage("home")}
      >
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
  <img
    src="image copy.png"
    alt="AlgoVIZ Logo"
    className="w-10 h-10 object-contain"
  />
</div>
        <span className="font-sans font-bold text-lg text-slate-100 tracking-wide group-hover:text-cyan-400 transition-colors duration-300">
          Algo<span className="text-cyan-400">VIZ</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setCurrentPage("home")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${currentPage === "home"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]"
            }`}
        >
          Home
        </button>

        <button
          onClick={() => setCurrentPage("tree-visualizer")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${currentPage === "tree-visualizer"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]"
            }`}
        >
          Tree Visualizer
        </button>

        <button
          onClick={() => setCurrentPage("graph-visualizer")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${currentPage === "graph-visualizer"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]"
            }`}
        >
          Graph Visualizer
        </button>

        <button
          onClick={() => setCurrentPage("learn")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${currentPage === "learn"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]"
            }`}
        >
          Learn
        </button>
      </div>
    </nav>
  );
}
