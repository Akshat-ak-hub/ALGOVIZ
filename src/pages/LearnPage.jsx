import React, { useState } from "react";
import { BookOpen } from "lucide-react";

export default function LearnPage() {
  const [codeTab, setCodeTab] = useState("trees");

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-130px)] px-6 py-12 max-w-5xl mx-auto w-full flex flex-col gap-12 font-sans">
      <section className="flex flex-col gap-4 text-center">
        <h1 className="font-extrabold text-3xl md:text-5xl text-slate-100 tracking-tight flex items-center justify-center gap-3">
          <BookOpen className="text-cyan-400" size={32} />
          Algorithm & Complexity Manual
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Master interview-critical data structures, operational formulas, and asymptotic complexities.
        </p>
      </section>

      {/* Tabs */}
      <section className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-lg">
        <div className="border-b border-[#2e2e2e] bg-[#161616] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-200 text-sm">Complexity Summaries</h2>
          <div className="flex gap-2">
            {["trees", "graphs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCodeTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 ${
                  codeTab === tab
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    : "border border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {codeTab === "trees" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121212] border border-[#2e2e2e] p-4 rounded-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-2">🌳 Traversals & BST</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                DFS Traversals visit every vertex recursively, taking <strong>O(N)</strong> time. BST inserts, deletes, and searches run in <strong>O(log N)</strong> on balanced trees, but degrade to <strong>O(N)</strong> on skewed, unbalanced tree paths.
              </p>
            </div>
            <div className="bg-[#121212] border border-[#2e2e2e] p-4 rounded-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-2">⚡ Binary Lifting (LCA)</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                By precalculating ancestor jumps of powers of 2 (up[u][i]), we query LCA in <strong>O(log N)</strong> time, utilizing <strong>O(N log N)</strong> space to store the ancestor jump lookup matrix.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121212] border border-[#2e2e2e] p-4 rounded-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-2">🕸 MST (Kruskal's) & DSU</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Kruskal's sorts edges in <strong>O(E log E)</strong>. Union-Find operations with path compression and rank optimization take nearly constant time <strong>O(α(V))</strong>, making Kruskal's run at <strong>O(E log E)</strong>.
              </p>
            </div>
            <div className="bg-[#121212] border border-[#2e2e2e] p-4 rounded-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-2">📌 Tarjan Bridges & Kosaraju SCC</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Tarjan's single-pass DFS computes DFN/Low in <strong>O(V + E)</strong>. Kosaraju's SCC runs two DFS passes (pass 1 on original, pass 2 on transposed), sorting components in <strong>O(V + E)</strong> time.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
