import { Binary, GitMerge, Split, Network, ArrowUpDown, MousePointer2, Hand, Move, ZoomIn, Camera ,TreePine, BarChart3} from "lucide-react";
import AnimatedHeroBackground from "../components/home/AnimatedHeroBackground";
import MiniPreview from "../components/home/MiniPreview";
import StatsCounter from "../components/home/StatsCounter";
import HowItWorks from "../components/home/HowItWorks";
import CodeSnippet from "../components/home/CodeSnippet";

export default function HomePage({ setCurrentPage }) {
  return (
    <div className="bg-bp-950 min-h-[calc(100vh-130px)] flex flex-col">
      {/* ── Hero ── */}
      <section className="relative px-6 py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden border-b border-bp-800">
        <AnimatedHeroBackground />

        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-bp-700 bg-bp-900 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-bp-300">
            Interactive Algorithm Visualizer
          </span>
        </div>

        <h1 className="relative z-10 font-sans font-extrabold text-4xl md:text-6xl text-slate-100 tracking-tight leading-tight max-w-4xl">
          Visualizing Data Structures & <br className="hidden sm:inline" />
          <span className="text-accent">Algorithms</span>
        </h1>
        <p className="relative z-10 mt-6 text-bp-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
          Unlock intuitive understanding of Trees, Graphs, and Sorting. Step through insertion models, DSU partitions, Kosaraju SCC colors, and sort animations in real-time.
        </p>

        <div className="relative z-10 mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setCurrentPage("tree-visualizer")}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-accent-emphasis hover:bg-[#1f6feb]/90 text-white font-semibold rounded-lg shadow-sm border border-accent-emphasis transition-all duration-200 cursor-pointer text-sm"
          >
            <TreePine size={16} />
            Tree Visualizer
          </button>

          <button
            onClick={() => setCurrentPage("graph-visualizer")}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-accent-emphasis hover:bg-[#1f6feb]/90 text-white font-semibold rounded-lg shadow-sm border border-accent-emphasis transition-all duration-200 cursor-pointer text-sm"
          >
            <Network size={16} />
            Graph Visualizer
          </button>

          <button
            onClick={() => setCurrentPage("sorting-visualizer")}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-accent-emphasis hover:bg-[#1f6feb]/90 text-white font-semibold rounded-lg shadow-sm border border-accent-emphasis transition-all duration-200 cursor-pointer text-sm"
          >
            <BarChart3 size={16} />
            Sorting Visualizer
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full border-b border-bp-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-accent">
              <StatsCounter end={27} suffix="+" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Algorithms</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-accent">
              <StatsCounter end={3} />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Structures</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-accent">
              <StatsCounter end={100} suffix="%" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Step-through</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-accent">
              <StatsCounter end={0} prefix="$" />
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Open Source</div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Feature Grid ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-3">
          Engineered for LeetCode & Interview Success
        </h2>
        <p className="text-center text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-12">
          Hover or just watch — every card is alive.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="group relative bg-bp-900 border border-bp-800 p-5 rounded-lg flex flex-col gap-3 hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200 pl-6">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-accent rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex justify-center bg-bp-950/60 rounded-lg py-3 border border-bp-800/50">
              <MiniPreview type="tree" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <Binary size={16} className="text-accent" /> Tree Traversals
            </h3>
            <p className="text-bp-300 text-xs leading-relaxed font-sans">
              Step preorder, inorder, postorder, and BFS level-order processes recursively. Visualize call nodes color-changing on active visits.
            </p>
          </div>

          <div className="group relative bg-bp-900 border border-bp-800 p-5 rounded-lg flex flex-col gap-3 hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200 pl-6">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-accent rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex justify-center bg-bp-950/60 rounded-lg py-3 border border-bp-800/50">
              <MiniPreview type="dfs" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <GitMerge size={16} className="text-accent" /> DFS & BFS
            </h3>
            <p className="text-bp-300 text-xs leading-relaxed font-sans">
              Watch depth-first recursion or breadth-first queue traversal light up the graph, with backtracking shown edge-by-edge.
            </p>
          </div>

          <div className="group relative bg-bp-900 border border-bp-800 p-5 rounded-lg flex flex-col gap-3 hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200 pl-6">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-accent rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex justify-center bg-bp-950/60 rounded-lg py-3 border border-bp-800/50">
              <MiniPreview type="dijkstra" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <Split size={16} className="text-accent" /> Dijkstra & MST
            </h3>
            <p className="text-bp-300 text-xs leading-relaxed font-sans">
              Animate shortest-path relaxation and Kruskal's edge-sorting. Inspect representative parents and rank weights in real-time.
            </p>
          </div>

          <div className="group relative bg-bp-900 border border-bp-800 p-5 rounded-lg flex flex-col gap-3 hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200 pl-6">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-accent rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex justify-center bg-bp-950/60 rounded-lg py-3 border border-bp-800/50">
              <MiniPreview type="tarjan" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <Network size={16} className="text-accent" /> Tarjan & Kosaraju
            </h3>
            <p className="text-bp-300 text-xs leading-relaxed font-sans">
              Inspect discovery DFN/Low maps to locate bridges and articulations. Watch SCCs get colored as the transpose pass resolves.
            </p>
          </div>

          <div className="group relative bg-bp-900 border border-bp-800 p-5 rounded-lg flex flex-col gap-3 hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200 pl-6">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-accent rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex justify-center bg-bp-950/60 rounded-lg py-3 border border-bp-800/50">
              <MiniPreview type="sorting" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <ArrowUpDown size={16} className="text-accent" /> Sorting Algorithms
            </h3>
            <p className="text-bp-300 text-xs leading-relaxed font-sans">
              Animate Bubble, Quick, Merge, Heap, and more. Watch cards swap positions as each algorithm runs step-by-step.
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: MousePointer2, label: "Click empty", desc: "Add node" },
            { icon: Hand, label: "Drag node", desc: "Reposition" },
            { icon: Camera, label: "Right-click", desc: "Delete node" },
            { icon: Move, label: "Middle-click", desc: "Pan canvas" },
            { icon: ZoomIn, label: "Scroll / pinch", desc: "Zoom in/out" },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.label}
                className="bg-bp-900 border border-bp-800 rounded-lg p-4 flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Icon size={18} className="text-accent" />
                <div className="mt-2.5 text-[11px] font-bold text-slate-200">{it.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{it.desc}</div>
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
