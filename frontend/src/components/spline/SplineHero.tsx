import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { SPLINE_SCENE } from '../../services/api';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { cn } from '../../utils/cn';

const Spline = SPLINE_SCENE ? lazy(() => import('@splinetool/react-spline')) : null;

class SplineErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Hero 3D / atmospheric visual.
 *  - Lazy: only mounts when scrolled into view.
 *  - Optional: loads a Spline scene when `VITE_SPLINE_SCENE` is configured.
 *  - Resilient: any failure (CORS, unsupported runtime, slow network) falls
 *    back to the local animated canvas so the hero never breaks.
 *  - Mobile: uses the canvas fallback to protect first paint.
 */
export function SplineHero({ className, compact = false }: { className?: string; compact?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(!Spline);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fallback = (
    <div className="absolute inset-0">
      <AtmosphereCanvas className="h-full w-full" intensity={compact ? 0.85 : 1} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ice-50/70" />
    </div>
  );

  const showSpline = Boolean(Spline) && visible && !failed && !mobile;

  return (
    <div
      ref={hostRef}
      className={cn('relative overflow-hidden rounded-2xl border border-ice-200 bg-gradient-to-br from-white via-ice-50 to-blue-100/60', className)}
      role="img"
      aria-label="Animated atmospheric forecast visualisation"
    >
      {fallback}

      {showSpline && Spline && (
        <div className="absolute inset-0 z-10">
          <SplineErrorBoundary fallback={fallback}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                </div>
              }
            >
              <Spline scene={SPLINE_SCENE} onError={() => setFailed(true)} className="h-full w-full" />
            </Suspense>
          </SplineErrorBoundary>
        </div>
      )}

      {/* instrument ticks — reinforces the command-centre language */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 0 h22 M0 0 v22" stroke="#94a5b7" strokeWidth="1" fill="none" />
          <path d="M100% 0 h-22 M100% 0 v22" stroke="#94a5b7" strokeWidth="1" fill="none" transform="translate(0,0)" />
        </svg>
        <div className="absolute left-0 top-0 h-6 w-6 border-l border-t border-slate-400/60" />
        <div className="absolute right-0 top-0 h-6 w-6 border-r border-t border-slate-400/60" />
        <div className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-slate-400/60" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-slate-400/60" />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-4 z-30 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        {Spline && showSpline ? 'Spline atmosphere' : 'Atmospheric contour field'}
      </div>
    </div>
  );
}
