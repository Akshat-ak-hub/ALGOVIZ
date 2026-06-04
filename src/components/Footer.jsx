import React from "react";
import { ArrowRight, BookOpen, ExternalLink, Zap } from "lucide-react";

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="border-t border-navy-600 bg-navy-900 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
          <Zap size={14} className="text-neon-cyan" />
        <span className="text-xs font-semibold text-slate-400">
          Algo<span className="text-cyan-400">VIZ</span>
        </span>
        <span className="text-[10px] text-slate-600">•</span>
        <span className="text-[10px] text-slate-500">Interactive Algorithm Visualizer</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <a
          href="https://leetcode.com/problemset/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-neon-cyan transition-colors duration-200"
        >
          <ExternalLink size={10} />
          LeetCode
        </a>
        <a
          href="https://neetcode.io/roadmap"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-neon-cyan transition-colors duration-200"
        >
          <ExternalLink size={10} />
          NeetCode
        </a>
        <a
          href="https://cp-algorithms.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-neon-cyan transition-colors duration-200"
        >
          <ExternalLink size={10} />
          CP Algorithms
        </a>
        <span className="text-[10px] text-slate-600 hidden md:inline">•</span>
        <button
          onClick={() => setCurrentPage("learn")}
          className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 cursor-pointer bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-1.5"
        >
          <BookOpen size={11} />
          Start Learning
          <ArrowRight size={10} />
        </button>
      </div>
    </footer>
  );
}
