import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Code, 
  Clock, 
  Cpu, 
  Check, 
  Copy, 
  ChevronRight, 
  Info, 
  Terminal 
} from "lucide-react";
import { ALGORITHMS } from "../data/algorithmsData";

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlgoId, setSelectedAlgoId] = useState("tree-dfs");
  const [activeTab, setActiveTab] = useState("concept");
  const [copied, setCopied] = useState(false);

  // Filter algorithms based on search query and category
  const filteredAlgos = ALGORITHMS.filter((algo) => {
    const matchesCategory = activeCategory === "all" || algo.category === activeCategory;
    const matchesSearch =
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Determine currently selected algorithm (fallback to first in filtered if current is filtered out)
  const selectedAlgo = filteredAlgos.find((a) => a.id === selectedAlgoId) || filteredAlgos[0];

  // Reset selected algorithm if category or search causes the current one to disappear
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (filteredAlgos.length > 0 && !filteredAlgos.some((a) => a.id === selectedAlgoId)) {
      setSelectedAlgoId(filteredAlgos[0].id);
    }
  }, [activeCategory, searchQuery, filteredAlgos, selectedAlgoId]);

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b0d0f] min-h-[calc(100vh-130px)] px-4 md:px-8 py-10 max-w-7xl mx-auto w-full flex flex-col gap-8 font-sans">
      
      {/* Page Header */}
      <section className="flex flex-col gap-3 text-center md:text-left md:flex-row md:items-center md:justify-between border-b border-navy-800 pb-8">
        <div>
          <h1 className="font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <BookOpen className="text-neon-cyan animate-pulse" size={32} />
            Algorithm Manual
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            In-depth concepts, operational complexities, step-by-step algorithms, and clean pseudocode for tree and graph traversals.
          </p>
        </div>
        <div className="text-xs bg-navy-800 border border-navy-700 text-slate-300 px-4 py-2 rounded-xl self-center md:self-auto font-mono">
          Total Algorithms: <span className="text-neon-cyan font-bold">{ALGORITHMS.length}</span>
        </div>
      </section>

      {/* Control Bar: Search & Category Pills */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-navy-900 border border-navy-800 p-4 rounded-2xl shadow-lg">
        {/* Category Pills */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "trees", "graphs"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan shadow-[0_0_15px_rgba(36,211,188,0.15)]"
                  : "bg-navy-800 border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-800 border border-navy-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>
      </section>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Algorithm List (Master) */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3 max-h-[650px] overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">
            Matching ({filteredAlgos.length})
          </div>

          {filteredAlgos.length === 0 ? (
            <div className="text-center py-12 px-4 flex flex-col items-center gap-3">
              <Search size={32} className="text-slate-600" />
              <p className="text-slate-400 text-sm">No algorithms found matching "{searchQuery}"</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-xs text-neon-cyan hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredAlgos.map((algo) => (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgoId(algo.id);
                  setCopied(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 group cursor-pointer ${
                  selectedAlgoId === algo.id
                    ? "bg-gradient-to-r from-navy-800 to-navy-850 border-neon-cyan/40 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-navy-800/50 hover:border-navy-700"
                }`}
              >
                <div className="flex flex-col gap-1.5 min-w-0 pr-2">
                  <span className={`font-bold text-sm truncate ${
                    selectedAlgoId === algo.id ? "text-neon-cyan" : "text-slate-300 group-hover:text-slate-200"
                  }`}>
                    {algo.name}
                  </span>
                  <span className="text-slate-500 text-xs truncate max-w-[280px]">
                    {algo.summary}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-navy-950 border border-navy-700 text-slate-400 px-2 py-0.5 rounded-md">
                    {algo.complexity}
                  </span>
                  <ChevronRight 
                    size={14} 
                    className={`transition-transform duration-200 ${
                      selectedAlgoId === algo.id 
                        ? "translate-x-0.5 text-neon-cyan" 
                        : "text-slate-600 group-hover:text-slate-400"
                    }`} 
                  />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Side: Algorithm Detail (Detail) */}
        <div className="lg:col-span-8">
          {selectedAlgo ? (
            <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              
              {/* Detail Header */}
              <div className="p-6 border-b border-navy-800 bg-gradient-to-r from-navy-900 via-navy-900 to-navy-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                      selectedAlgo.category === "trees"
                        ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                        : "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                    }`}>
                      {selectedAlgo.category}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">ID: {selectedAlgo.id}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                    {selectedAlgo.name}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-navy-950 border border-navy-800 px-3.5 py-2 rounded-xl">
                    <Clock size={14} className="text-neon-cyan" />
                    <span className="font-mono">Time: {selectedAlgo.complexity}</span>
                  </div>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-navy-800 bg-navy-900/50 px-4">
                {[
                  { id: "concept", label: "Concept & Analysis", icon: Info },
                  { id: "steps", label: "Execution Steps", icon: Terminal },
                  { id: "pseudocode", label: "Pseudocode", icon: Code }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                        activeTab === tab.id
                          ? "border-neon-cyan text-neon-cyan bg-navy-900"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Detail Content */}
              <div className="p-6 bg-navy-900">
                
                {/* Tab: Concept */}
                {activeTab === "concept" && (
                  <div className="flex flex-col gap-6 animate-fadeIn">
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedAlgo.explanation}
                    </div>

                    <div className="mt-4 border-t border-navy-800 pt-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Cpu size={14} className="text-neon-cyan" />
                        Complexity Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Time Complexity Card */}
                        <div className="bg-navy-950 border border-navy-800 p-4 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time Complexity</span>
                          <div className="mt-3 flex flex-col gap-2 font-mono text-xs">
                            <div className="flex justify-between border-b border-navy-800/40 pb-1.5">
                              <span className="text-slate-400">Best Case</span>
                              <span className="text-neon-green font-bold">{selectedAlgo.timeComplexity.best}</span>
                            </div>
                            <div className="flex justify-between border-b border-navy-800/40 pb-1.5">
                              <span className="text-slate-400">Average Case</span>
                              <span className="text-neon-yellow font-bold">{selectedAlgo.timeComplexity.average}</span>
                            </div>
                            <div className="flex justify-between pt-0.5">
                              <span className="text-slate-400">Worst Case</span>
                              <span className="text-neon-orange font-bold">{selectedAlgo.timeComplexity.worst}</span>
                            </div>
                          </div>
                        </div>

                        {/* Space Complexity Card */}
                        <div className="bg-navy-950 border border-navy-800 p-4 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Space Complexity</span>
                            <span className="text-neon-cyan font-mono text-sm font-bold block mt-3">
                              {selectedAlgo.spaceComplexity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal mt-2">
                            Represents memory consumed by secondary structures like parent maps, lookup grids, DSU lists, or execution call stacks.
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Steps */}
                {activeTab === "steps" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <h3 className="text-sm font-bold text-slate-200 mb-2">Algorithm Execution Flow</h3>
                    <div className="flex flex-col gap-3">
                      {selectedAlgo.steps.map((step, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-4 p-3.5 bg-navy-950 border border-navy-800 rounded-xl hover:border-navy-700 transition-colors"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-slate-300 text-xs md:text-sm leading-relaxed mt-0.5">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Pseudocode */}
                {activeTab === "pseudocode" && (
                  <div className="flex flex-col gap-4 animate-fadeIn relative">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs font-mono">pseudocode.py</span>
                      <button
                        onClick={() => handleCopyCode(selectedAlgo.pseudocode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                          copied
                            ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                            : "bg-navy-950 border-navy-800 text-slate-400 hover:text-slate-200 hover:bg-navy-850"
                        }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                    </div>

                    <div className="bg-navy-950 border border-navy-800 rounded-xl overflow-hidden shadow-inner p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto custom-scrollbar select-text">
                      <pre className="text-slate-300">
                        <code>{selectedAlgo.pseudocode}</code>
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4 shadow-lg">
              <BookOpen size={48} className="text-slate-600 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">No Algorithm Selected</h3>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Select an algorithm from the sidebar to inspect its concept, execution logic, complexity, and pseudocode.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
