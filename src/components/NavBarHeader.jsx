import { Home, GitBranch, Network, ArrowUpDown, BookOpen } from "lucide-react";

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
      id: "sorting-visualizer",
      label: "Sorting",
      icon: <ArrowUpDown size={16} />,
    },
    {
      id: "learn",
      label: "Learn",
      icon: <BookOpen size={16} />,
    },
  ];

  return (
    <header className="sticky top-0 z-50">
      <nav className="backdrop-blur-xl bg-bp-900/80 border-b border-bp-800 px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setCurrentPage("home")}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <div className="relative w-9 h-9 rounded-lg bg-bp-800 border border-bp-700 flex items-center justify-center overflow-hidden transition-all duration-200">
            <img
              src="image copy.png"
              alt="AlgoVIZ"
              className="w-7 h-7 object-contain rounded"
            />
          </div>

          <h1 className="font-extrabold text-lg tracking-tight text-slate-100">
            Algo
            <span className="text-accent">VIZ</span>
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 bg-bp-950 border border-bp-800 rounded-lg p-1">
          {navItems.map((item) => {
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer
                  ${active 
                    ? "text-accent bg-bp-800 border border-bp-700 shadow-sm" 
                    : "text-bp-300 hover:text-bp-100 hover:bg-bp-800/50 border border-transparent"
                  }
                `}
              >
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}