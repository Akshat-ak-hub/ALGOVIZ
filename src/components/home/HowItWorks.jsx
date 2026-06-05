import { MousePointerClick, PlayCircle, BookOpenCheck } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    color: "emerald",
    title: "Build",
    desc: "Click to add nodes. Drag to reposition. Right-click to remove. Pan and zoom freely.",
  },
  {
    icon: PlayCircle,
    color: "cyan",
    title: "Animate",
    desc: "Pick an algorithm and watch each step light up — active node in amber, visited in cyan, result in purple.",
  },
  {
    icon: BookOpenCheck,
    color: "purple",
    title: "Learn",
    desc: "Read the live log for step-by-step explanations. Inspect BFS queues, lifting tables, and DSU parents.",
  },
];

const colorMap = {
  emerald: { text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]" },
  cyan: { text: "text-cyan-400", border: "border-cyan-500/30", glow: "shadow-[0_0_30px_rgba(34,211,238,0.15)]" },
  purple: { text: "text-purple-400", border: "border-purple-500/30", glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]" },
};

export default function HowItWorks() {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto w-full">
      <h2 className="text-center font-bold text-2xl md:text-3xl text-slate-200 tracking-wide mb-3">
        How It Works
      </h2>
      <p className="text-center text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-12">
        Three steps from blank canvas to algorithmic intuition.
      </p>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-purple-500/40" />

        {steps.map((s, i) => {
          const c = colorMap[s.color];
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className={`relative bg-navy-800 border ${c.border} rounded-2xl p-6 flex flex-col items-center text-center ${c.glow} transition-transform duration-300 hover:-translate-y-1`}
            >
              <div className={`relative w-12 h-12 rounded-xl bg-navy-900 border ${c.border} flex items-center justify-center mb-4`}>
                <Icon size={20} className={c.text} />
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy-900 border ${c.border} text-[10px] font-bold ${c.text} flex items-center justify-center`}>
                  {i + 1}
                </span>
              </div>
              <h3 className={`font-bold text-sm ${c.text} mb-2 tracking-wider uppercase`}>
                {s.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
