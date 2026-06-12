import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { tokenizeLine, TOKEN_COLOR } from "../utils/syntaxHighlight";
import { getTreeCode } from "../algorithms/treeAlgorithmCode";
import { getGraphCode } from "../algorithms/graphAlgorithmCode";
import { getSortingCode } from "../algorithms/sortingAlgorithmCode";

const LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
];

export default function CodePanel({ algorithm, traversalType, currentLine, title, codeArray, kind = "tree" }) {
  const [language, setLanguage] = useState("cpp");
  const code =
    codeArray ||
    (kind === "graph"
      ? getGraphCode(algorithm, language)
      : kind === "sorting"
      ? getSortingCode(algorithm, language)
      : getTreeCode(algorithm, language, traversalType));
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  // Auto-scroll the active line into view
  useEffect(() => {
    if (!currentLine || !lineRefs.current[currentLine]) return;
    const el = lineRefs.current[currentLine];
    const container = containerRef.current;
    if (!el || !container) return;
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    if (elTop < viewTop || elBottom > viewBottom) {
      container.scrollTo({
        top: elTop - container.clientHeight / 2 + el.offsetHeight / 2,
        behavior: "smooth",
      });
    }
  }, [currentLine]);

  return (
    <div className="bg-bp-900 border border-bp-800 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-bp-950 border-b border-bp-800 px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Code2 size={13} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {title || "Algorithm Code"}
          </span>
        </div>
        {/* Language tabs */}
        <div className="flex items-center gap-0.5 bg-bp-900 border border-bp-800 rounded-md p-0.5">
          {LANGUAGES.map((l) => {
            const isActive = l.id === language;
            return (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`relative px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-accent" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="code-panel-lang-underline"
                    className="absolute left-1 right-1 -bottom-2 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Code */}
      <div ref={containerRef} className="relative overflow-y-auto flex-grow px-3 py-2 font-mono text-[11px] leading-6">
        <AnimatePresence mode="wait">
          <motion.pre
            key={`${language}-${algorithm}-${traversalType || ""}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <code>
              {code && code.map((line, idx) => {
                const lineNo = idx + 1;
                const isActive = lineNo === currentLine;
                return (
                  <div
                    key={lineNo}
                    ref={(el) => {
                      if (el) lineRefs.current[lineNo] = el;
                    }}
                    className={`relative flex items-center gap-2 pl-2 pr-2 -ml-2 -mr-2 rounded transition-colors duration-200 ${
                      isActive ? "bg-accent-muted" : ""
                    }`}
                  >
                    {/* Left vertical bar — INSIDE the line, at the very left edge */}
                    {isActive && (
                      <motion.span
                        layoutId="code-panel-pointer-bar"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      />
                    )}

                    {/* Pointer arrow — INSIDE the line, in a fixed-width gutter before the line number */}
                    <span className="relative w-3 flex-shrink-0 text-accent text-[12px] font-bold leading-none text-center select-none">
                      {isActive && (
                        <motion.span
                          key={`arrow-${lineNo}`}
                          initial={{ opacity: 0, x: -2 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          ▸
                        </motion.span>
                      )}
                    </span>

                    {/* Line number — fixed width, right-aligned */}
                    <span
                      className={`select-none w-6 text-right flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-accent font-bold" : "text-slate-600"
                      }`}
                    >
                      {lineNo}
                    </span>

                    {/* Code content */}
                    <span className="whitespace-pre flex-1">
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

        {!code && (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
            Select an algorithm to view its code.
          </div>
        )}
      </div>
    </div>
  );
}
