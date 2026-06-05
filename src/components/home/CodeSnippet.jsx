import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tokenizeLine, TOKEN_COLOR } from "../../utils/syntaxHighlight";

const sampleDFS = [
  "function dfs(graph, start) {",
  "  const visited = new Set();",
  "  const stack = [start];",
  "",
  "  while (stack.length > 0) {",
  "    const node = stack.pop();        // pop current",
  "    if (visited.has(node)) continue;",
  "    visited.add(node);              // mark visited",
  "    for (const n of graph[node]) {",
  "      if (!visited.has(n)) stack.push(n);",
  "    }",
  "  }",
  "  return visited;",
  "}",
];

const sampleBST = [
  "function bstInsert(root, val) {",
  "  if (!root) return new Node(val);",
  "  if (val < root.value) {",
  "    root.left = bstInsert(root.left, val);",
  "  } else {",
  "    root.right = bstInsert(root.right, val);",
  "  }",
  "  return root;                       // preserve BST",
  "}",
];

const samples = [
  { id: "dfs", label: "DFS (Iterative)", code: sampleDFS, highlightLines: [2, 5, 7, 9] },
  { id: "bst", label: "BST Insert", code: sampleBST, highlightLines: [1, 3, 8] },
];

export default function CodeSnippet() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = samples[activeIdx];

  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % samples.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto w-full">
      <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-3">
        Algorithms Under the Hood
      </h2>
      <p className="text-center text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-10">
        Real implementations. Highlighted lines correspond to the active step in the visualizer.
      </p>

      <div className="bg-navy-900 border border-navy-600 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.06)]">
        <div className="flex items-center gap-1 bg-navy-950 border-b border-navy-600 px-3 py-2">
          <div className="flex items-center gap-1.5 mr-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          {samples.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveIdx(i)}
                className={`relative px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-cyan-300" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s.label}
                {isActive && (
                  <motion.span
                    layoutId="code-tab-underline"
                    className="absolute left-2 right-2 -bottom-2.5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.pre
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-5 text-xs font-mono overflow-x-auto leading-6"
          >
            <code>
              {active.code.map((line, idx) => {
                const lineNo = idx + 1;
                const highlighted = active.highlightLines.includes(lineNo);
                return (
                  <div
                    key={lineNo}
                    className={`flex gap-4 px-2 -mx-2 rounded transition-colors duration-200 ${
                      highlighted ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <span className={`select-none w-6 text-right flex-shrink-0 ${highlighted ? "text-cyan-400" : "text-slate-600"}`}>
                      {lineNo}
                    </span>
                    <span className="whitespace-pre">
                      {tokenizeLine(line).map((tok, j) => (
                        <span key={j} className={TOKEN_COLOR[tok.type]}>
                          {tok.text}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </section>
  );
}
