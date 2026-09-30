import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SplineHero } from '../spline/SplineHero';
import { usePrefersReducedMotion } from '../../hooks/useAsync';
import { cn } from '../../utils/cn';

const TITLE = 'NIRIKSHAN'.split('');

/**
 * Structural telemetry around the atmospheric object.
 * These are interface parameters (lead window, scale, model set) — never
 * presented as live measurements.
 */
const TELEMETRY: { label: string; value: string; className?: string }[] = [
  { label: 'Lead window', value: 'D+1 → D+10', className: 'left-0 top-6 sm:top-10' },
  { label: 'Confidence scale', value: '0 – 100', className: 'right-0 top-0 sm:top-4' },
  { label: 'Risk bands', value: 'LOW → CRITICAL', className: 'left-0 bottom-16 sm:bottom-24' },
  { label: 'Model centres', value: 'GFS · ECMWF · ICON · GEM', className: 'right-0 bottom-6 sm:bottom-14 hidden sm:block' },
];

export function HeroSection() {
  const reduced = usePrefersReducedMotion();
  const parallaxRef = useRef<HTMLDivElement>(null);

  // subtle, scientific pointer parallax — disabled for reduced motion / touch
  useEffect(() => {
    if (reduced) return;
    const el = parallaxRef.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      el.style.setProperty('--nrk-px-x', `${(dx * 2.6).toFixed(2)}deg`);
      el.style.setProperty('--nrk-px-y', `${(-dy * 2).toFixed(2)}deg`);
      el.style.setProperty('--nrk-tx', `${(dx * 6).toFixed(1)}px`);
      el.style.setProperty('--nrk-ty', `${(dy * 6).toFixed(1)}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <section id="overview" className="relative isolate overflow-hidden">
      {/* atmosphere: white space + invisible atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-paper opacity-[0.55] [mask-image:radial-gradient(120%_90%_at_70%_20%,black,transparent_75%)]" />
        <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.35),transparent_65%)] blur-2xl" />
        <div className="absolute right-[-12%] top-[8%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.5),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-[-18%] left-1/3 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(207,225,255,0.55),transparent_65%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ice-50" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-[1400px] items-center gap-10 px-5 pb-16 pt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-20 lg:pt-24">
        {/* ------------------------------------------------------------ copy */}
        <div className="relative">
          <div className="nrk-reveal nrk-reveal--in mb-6 inline-flex items-center gap-2.5 rounded-full border border-ice-200 bg-white/80 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-soft backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
            </span>
            Forecast reliability intelligence
          </div>

          <h1 className="flex text-[clamp(3rem,9vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.035em] text-navy-900" aria-label="Nirikshan">
            {TITLE.map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="nrk-letter nrk-letter--in inline-block"
                style={{ animationDelay: `${120 + i * 55}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>

          <p className="nrk-reveal nrk-reveal--in mt-5 max-w-xl text-xl font-semibold leading-snug text-blue-700 sm:text-2xl" style={{ '--nrk-reveal-delay': '620ms' } as React.CSSProperties}>
            Know When Not to Trust the Forecast.
          </p>

          <p className="nrk-reveal nrk-reveal--in mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600" style={{ '--nrk-reveal-delay': '740ms' } as React.CSSProperties}>
            AI-powered intelligence that detects forecast-bust risk, maps regional confidence and explains
            why medium-range weather predictions may become unreliable.
          </p>

          <div className="nrk-reveal nrk-reveal--in mt-8 flex flex-wrap items-center gap-3" style={{ '--nrk-reveal-delay': '860ms' } as React.CSSProperties}>
            <a href="#intelligence" className="nrk-magnetic" onClick={(e) => { e.preventDefault(); document.getElementById('intelligence')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_30px_-12px_rgba(37,99,235,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                Explore Intelligence
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </span>
            </a>
            <a href="#pipeline" className="nrk-magnetic" onClick={(e) => { e.preventDefault(); document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="inline-flex items-center gap-2 rounded-lg border border-ice-200 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-ice-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                See How It Works
              </span>
            </a>
          </div>

          <div className="nrk-reveal nrk-reveal--in mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ice-200 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400" style={{ '--nrk-reveal-delay': '980ms' } as React.CSSProperties}>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />GFS · ECMWF · ICON · GEM</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />127 verified locations</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />Calibrated · Explainable</span>
          </div>
        </div>

        {/* ---------------------------------------------------------- visual */}
        <div className="relative lg:pl-2">
          <div ref={parallaxRef} className={cn('nrk-parallax relative', reduced && 'nrk-parallax--off')}>
            <div className="nrk-glow-ring" aria-hidden="true" />
            <SplineHero className="relative z-10 h-[360px] w-full rounded-[26px] sm:h-[440px] lg:h-[540px]" />

            {/* telemetry HUD — structural interface parameters */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {TELEMETRY.map((t) => (
                <div
                  key={t.label}
                  className={cn('nrk-float absolute hidden rounded-xl border border-white/70 bg-white/70 px-3 py-2 shadow-soft backdrop-blur-md sm:block', t.className)}
                  style={{ animationDelay: `${TELEMETRY.indexOf(t) * 700}ms` }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{t.label}</div>
                  <div className="mt-0.5 font-mono text-[12.5px] font-semibold text-navy-900">{t.value}</div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-blue-200/60" />
          </div>

          <p className="mt-3 text-center text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Interface parameters · not live measurements
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center lg:flex" aria-hidden="true">
        <div className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Scroll
          <span className="h-9 w-px bg-gradient-to-b from-blue-400 to-transparent" />
        </div>
      </div>

      <div className="sr-only">
        <Link to="/dashboard">Open the Nirikshan intelligence dashboard</Link>
      </div>
    </section>
  );
}
