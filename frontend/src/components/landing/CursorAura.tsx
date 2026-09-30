import { useEffect, useRef, useState } from 'react';

/**
 * Subtle cursor aura: a small blue halo that trails the pointer and expands
 * slightly over interactive elements. Disabled on touch devices, small
 * viewports and when the user prefers reduced motion.
 */
export function CursorAura() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 1024px)');
    const sync = () => setEnabled(fine.matches && !reduce.matches && wide.matches);
    sync();
    fine.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    wide.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
      wide.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement | null;
      setActive(Boolean(target?.closest('a, button, [role="button"], input, select, .nrk-interactive')));
    };

    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-blue-500/90 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
      />
      <div
        ref={ringRef}
        className={
          'absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-blue-400/40 bg-blue-400/5 transition-[width,height,margin,opacity,border-color] duration-200 ' +
          (active ? '-ml-7 -mt-7 h-14 w-14 border-blue-500/70 bg-blue-400/10' : '')
        }
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </div>
  );
}
