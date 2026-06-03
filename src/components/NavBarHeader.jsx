import React from "react";
import { Home, GitBranch, Network, BookOpen } from "lucide-react";

export default function NavBarHeader({ currentPage, setCurrentPage }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home size={16} />,
    },
    {
      id: "tree-visualizer",
      label: "Tree Visualizer",
      icon: <GitBranch size={16} />,
    },
    {
      id: "graph-visualizer",
      label: "Graph Visualizer",
      icon: <Network size={16} />,
    },
    {
      id: "learn",
      label: "Learn",
      icon: <BookOpen size={16} />,
    },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient Border */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <nav className="backdrop-blur-xl bg-[#121212]/80 border-b border-white/5 px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setCurrentPage("home")}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-400/5 border border-cyan-500/30 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110">
              <img
                src="image copy.png"
                alt="AlgoVIZ"
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          <h1 className="font-black text-xl tracking-tight text-slate-100">
            Algo
            <span className="text-cyan-400">VIZ</span>
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 bg-[#1b1b1b]/70 border border-[#2e2e2e] rounded-2xl p-1.5">
          {navItems.map((item) => {
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                  
                  ${
                    active
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-white"
                  }
                `}
              >
                {/* Active Background */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]" />
                )}

                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>

                {/* Underline Animation */}
                <span
                  className={`absolute left-3 right-3 bottom-1 h-[2px] rounded-full transition-all duration-300
                    ${
                      active
                        ? "bg-cyan-400 opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}