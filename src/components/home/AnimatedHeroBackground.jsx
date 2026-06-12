import { useEffect, useRef } from "react";

/* ── Floating nodes + connecting edges, drawn on canvas ── */
export default function AnimatedHeroBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();

    const init = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const count = Math.min(38, Math.max(18, Math.floor((w * h) / 28000)));
      const palette = [
        "rgba(88,166,255,",  // accent blue (#58a6ff)
        "rgba(31,111,235,",  // accent emphasis blue (#1f6feb)
        "rgba(139,148,158,", // bp-400 slate-gray (#8b949e)
      ];
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.5 + Math.random() * 2.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
      }));
    };

    init();
    window.addEventListener("resize", () => {
      resize();
      init();
    });

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const linkDist = 140;

      // Edges
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.18;
            ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const pulse = 0.5 + 0.5 * Math.sin(p.phase);
        const alpha = 0.35 + pulse * 0.4;
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `${p.color}${alpha * 0.18})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (3 + pulse * 1.5), 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
