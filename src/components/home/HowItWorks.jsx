import { MousePointerClick, PlayCircle, BookOpenCheck } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    title: "Build",
    desc: "Click to add nodes. Drag to reposition. Right-click to remove. Pan and zoom freely.",
  },
  {
    icon: PlayCircle,
    title: "Animate",
    desc: "Pick an algorithm and watch each step light up — active nodes, visited paths, and results in real time.",
  },
  {
    icon: BookOpenCheck,
    title: "Learn",
    desc: "Read the live log for step-by-step explanations. Inspect BFS queues, tree structures, and sorting states.",
  },
];

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
        <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-bp-800" />

        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="relative bg-bp-900 border border-bp-800 rounded-lg p-6 flex flex-col items-center text-center hover:border-bp-700 hover:bg-bp-850/50 transition-all duration-200"
            >
              <div className="relative w-12 h-12 rounded-lg bg-bp-850 border border-bp-700 flex items-center justify-center mb-4">
                <Icon size={20} className="text-accent" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bp-900 border border-bp-700 text-[10px] font-bold text-accent flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-xs text-accent mb-2 tracking-wider uppercase">
                {s.title}
              </h3>
              <p className="text-bp-300 text-xs leading-relaxed">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
