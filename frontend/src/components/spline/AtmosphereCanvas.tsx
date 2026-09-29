import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/useAsync';

/**
 * Local animated atmospheric fallback used when no Spline scene is configured
 * or when the 3D runtime cannot start. Draws a slowly evolving pressure-system
 * contour field — isobars, a graticule and drifting streamlines — so the hero
 * keeps its intended meteorological visual language without any network asset.
 */
export function AtmosphereCanvas({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const streamlines = Array.from({ length: 14 }, (_, i) => ({
      y: (i + 0.5) / 14,
      amp: 8 + (i % 4) * 7,
      speed: 0.16 + (i % 5) * 0.045,
      phase: i * 1.13,
      alpha: 0.06 + (i % 3) * 0.035,
    }));

    const draw = (t: number) => {
      const time = reduced ? 0 : t / 1000;
      ctx.clearRect(0, 0, width, height);

      // --- graticule ------------------------------------------------------
      ctx.strokeStyle = 'rgba(28,111,178,0.055)';
      ctx.lineWidth = 1;
      const step = 46;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- streamlines ----------------------------------------------------
      for (const s of streamlines) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const phase = (x / width) * Math.PI * 2.2 + time * s.speed + s.phase;
          const y = s.y * height + Math.sin(phase) * s.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(47,140,208,${s.alpha * intensity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // --- pressure system contours ---------------------------------------
      const cx = width * 0.52;
      const cy = height * 0.47;
      const base = Math.min(width, height) * 0.09;

      for (let ring = 1; ring <= 11; ring += 1) {
        const radius = base * ring * (0.92 + Math.sin(time * 0.35 + ring * 0.4) * 0.035);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.06; a += 0.07) {
          const warp =
            Math.sin(a * 3 + time * 0.4 + ring * 0.5) * (5 + ring * 0.9) +
            Math.cos(a * 5 - time * 0.28 + ring) * (3 + ring * 0.5);
          const r = radius + warp;
          const x = cx + Math.cos(a) * r * 1.16;
          const y = cy + Math.sin(a) * r * 0.82;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const t2 = ring / 11;
        const cold = ring <= 3;
        ctx.strokeStyle = cold
          ? `rgba(221,81,69,${(0.5 - t2 * 0.4) * intensity})`
          : `rgba(28,111,178,${(0.42 - t2 * 0.3) * intensity})`;
        ctx.lineWidth = cold ? 1.5 : 1.1;
        ctx.stroke();
      }

      // --- core ------------------------------------------------------------
      const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, base * 2.4);
      grd.addColorStop(0, `rgba(47,140,208,${0.2 * intensity})`);
      grd.addColorStop(1, 'rgba(47,140,208,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(cx, cy, base * 2.4 * 1.16, base * 2.4 * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- uncertainty halo ------------------------------------------------
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.8);
      ctx.beginPath();
      ctx.ellipse(cx, cy, base * (3.6 + pulse * 0.35) * 1.16, base * (3.6 + pulse * 0.35) * 0.82, 0, 0, Math.PI * 2);
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -time * 12;
      ctx.strokeStyle = `rgba(90,168,228,${0.3 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, intensity]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
