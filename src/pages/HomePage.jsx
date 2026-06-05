import { Binary, GitMerge, Split, Network, MousePointer2, Hand, Move, ZoomIn, Camera } from "lucide-react";
import AnimatedHeroBackground from "../components/home/AnimatedHeroBackground";
import MiniPreview from "../components/home/MiniPreview";
import StatsCounter from "../components/home/StatsCounter";
import HowItWorks from "../components/home/HowItWorks";
import CodeSnippet from "../components/home/CodeSnippet";

export default function HomePage({ setCurrentPage }) {
  return (
    <div className="bg-navy-950 min-h-[calc(100vh-130px)] flex flex-col">
      {/* ── Hero ── */}
      <section className="relative px-6 py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden border-b border-navy-800">
        <AnimatedHeroBackground />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            Interactive Algorithm Visualizer
          </span>
        </div>

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

      {/* ── Stats ── */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full border-b border-navy-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              <StatsCounter end={12} suffix="+" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Algorithms</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              <StatsCounter end={2} />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Structures</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
              <StatsCounter end={100} suffix="%" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Step-through</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              <StatsCounter end={0} prefix="$" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Open Source</div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Feature Grid (now with mini previews) ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-3">
          Engineered for LeetCode & Interview Success
        </h2>
        <p className="text-center text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-12">
          Hover or just watch — every card is alive.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-navy-800 border border-navy-600 p-5 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all duration-300">
            <div className="flex justify-center bg-navy-900/60 rounded-lg py-3 border border-navy-700/50">
              <MiniPreview type="tree" />
            </div>
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-sans">
              <Binary size={16} /> Tree Traversals
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Step preorder, inorder, postorder, and BFS level-order processes recursively. Visualize call nodes color-changing on active visits.
            </p>
          </div>

          <div className="group bg-navy-800 border border-navy-600 p-5 rounded-2xl flex flex-col gap-3 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300">
            <div className="flex justify-center bg-navy-900/60 rounded-lg py-3 border border-navy-700/50">
              <MiniPreview type="dfs" />
            </div>
            <h3 className="font-bold text-sm text-purple-400 flex items-center gap-1.5 font-sans">
              <GitMerge size={16} /> DFS & BFS
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Watch depth-first recursion or breadth-first queue traversal light up the graph, with backtracking shown edge-by-edge.
            </p>
          </div>

          <div className="group bg-navy-800 border border-navy-600 p-5 rounded-2xl flex flex-col gap-3 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)] transition-all duration-300">
            <div className="flex justify-center bg-navy-900/60 rounded-lg py-3 border border-navy-700/50">
              <MiniPreview type="dijkstra" />
            </div>
            <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-1.5 font-sans">
              <Split size={16} /> Dijkstra & MST
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Animate shortest-path relaxation and Kruskal's edge-sorting. Inspect representative parents and rank weights in real-time.
            </p>
          </div>

          <div className="group bg-navy-800 border border-navy-600 p-5 rounded-2xl flex flex-col gap-3 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.12)] transition-all duration-300">
            <div className="flex justify-center bg-navy-900/60 rounded-lg py-3 border border-navy-700/50">
              <MiniPreview type="tarjan" />
            </div>
            <h3 className="font-bold text-sm text-rose-400 flex items-center gap-1.5 font-sans">
              <Network size={16} /> Tarjan & Kosaraju
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Inspect discovery DFN/Low maps to locate bridges and articulations. Watch SCCs get colored as the transpose pass resolves.
            </p>
          </div>
        </div>
      </section>

      {/* ── Canvas Interaction Cheatsheet ── */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full">
        <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-3">
          Canvas-First Interaction
        </h2>
        <p className="text-center text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-8">
          Every visualizer shares the same intuitive controls.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: MousePointer2, label: "Click empty", desc: "Add node", color: "emerald" },
            { icon: Hand, label: "Drag node", desc: "Reposition", color: "cyan" },
            { icon: Camera, label: "Right-click", desc: "Delete node", color: "rose" },
            { icon: Move, label: "Middle-click", desc: "Pan canvas", color: "purple" },
            { icon: ZoomIn, label: "Scroll / pinch", desc: "Zoom in/out", color: "amber" },
          ].map((it) => {
            const colorMap = {
              emerald: "text-emerald-400 border-emerald-500/30",
              cyan: "text-cyan-400 border-cyan-500/30",
              rose: "text-rose-400 border-rose-500/30",
              purple: "text-purple-400 border-purple-500/30",
              amber: "text-amber-400 border-amber-500/30",
            };
            const Icon = it.icon;
            return (
              <div
                key={it.label}
                className={`bg-navy-800/60 border ${colorMap[it.color]} rounded-xl p-3 flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-0.5`}
              >
                <Icon size={18} className={colorMap[it.color].split(" ")[0]} />
                <div className="mt-2 text-[11px] font-bold text-slate-200">{it.label}</div>
                <div className="text-[10px] text-slate-500">{it.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Code Snippet ── */}
      <CodeSnippet />
    </div>
  );
}
