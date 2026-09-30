import { Link } from 'react-router-dom';
import { AtmosphereCanvas } from '../spline/AtmosphereCanvas';
import { Reveal } from '../motion/Reveal';
import { usePrefersReducedMotion } from '../../hooks/useAsync';

export function FinalCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {reduced ? (
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(186,230,253,0.55),rgba(248,251,255,0.9)_60%,#ffffff)]" />
        ) : (
          <AtmosphereCanvas className="absolute inset-0 h-full w-full opacity-70" intensity={0.7} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white" />
        <div className="absolute inset-0 grid-paper opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-5 text-center">
        <Reveal>
          <p className="eyebrow justify-center">Enter Nirikshan</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-navy-900 sm:text-6xl">
            Know when not to trust the forecast.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Turn forecast uncertainty into actionable intelligence.
          </p>

          <div className="mt-9 flex justify-center">
            <Link to="/dashboard" className="nrk-magnetic">
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-navy-900 px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_18px_40px_-16px_rgba(30,64,175,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                Enter Nirikshan
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
