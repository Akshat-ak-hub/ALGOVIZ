import React from "react";
import { Binary, GitMerge, Split, Network, TreePine } from "lucide-react";

export default function HomePage({ setCurrentPage }) {
  return (
    <div className="bg-navy-950 min-h-[calc(100vh-130px)] flex flex-col">
      <section className="relative px-6 py-20 md:py-24 flex flex-col items-center justify-center text-center overflow-hidden border-b border-navy-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <h1 className="relative z-10 font-sans font-extrabold text-4xl md:text-6xl text-slate-100 tracking-tight leading-tight max-w-4xl">
          Visualizing Data Structures & <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            Algorithms
          </span>
        </h1>
        <p className="relative z-10 mt-6 text-slate-400 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
          Unlock intuitive understanding of Trees and Graphs. Step through insertion models, DSU partitions, Kosaraju SCC colors, and Tarjan DFN tracking in real-time.
        </p>

        <div className="relative z-10 mt-10 flex flex-wrap gap-6 justify-center">
          <button
            onClick={() => setCurrentPage("tree-visualizer")}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(16,185,129,0.2)] cursor-pointer text-xs uppercase tracking-wider"
          >
             Tree Visualizer
          </button>
          <button
            onClick={() => setCurrentPage("graph-visualizer")}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(6,182,212,0.2)] cursor-pointer text-xs uppercase tracking-wider"
          >
             Graph Visualizer
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-12">
          Engineered for LeetCode & Interview Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-navy-800 border border-navy-600 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-sm text-neon-cyan flex items-center gap-1.5 font-sans">
              <Binary size={16} /> Tree Traversals
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Step preorder, inorder, postorder, and BFS level-order processes recursively. Visualize call nodes color-changing on active visits.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-600 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-sm text-purple-400 flex items-center gap-1.5 font-sans">
              <GitMerge size={16} /> LCA & Lifting
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Animate Lowest Common Ancestors and precomputed Binary Lifting exponent lookup parent tables up to 2^i ancestors.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-600 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-sans">
              <Split size={16} /> Kruskal & DSU
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Watch Kruskal sort edges and union-find partitions step-by-step. Inspect Representative parents and Rank weights.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-600 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-sm text-rose-400 flex items-center gap-1.5 font-sans">
              <Network size={16} /> Tarjan & Kosaraju
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Inspect discovery DFN/Low maps to locate Bridges/Articulations. Run Kosaraju's pass transpose loops to isolate SCC groupings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
