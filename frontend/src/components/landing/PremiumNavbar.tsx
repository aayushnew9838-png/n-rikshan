import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'pipeline', label: 'How It Works' },
  { id: 'explainability', label: 'Explainability' },
  { id: 'preview', label: 'Preview' },
] as const;

/**
 * Floating navigation: transparent over the hero, frosted white once the user
 * scrolls. A thin blue indicator tracks the section currently in view.
 */
export function PremiumNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>('overview');
  const location = useLocation();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 32);
        setProgress(h > 0 ? Math.min(1, y / h) : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.4, 0.7] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [location.pathname]);

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'transition-all duration-300 ease-smooth',
          scrolled
            ? 'border-b border-ice-200 bg-white/85 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 focus-visible:outline-none"
            aria-label="Nirikshan — back to top"
          >
            <NirikshanMark />
            <span className="text-[15px] font-extrabold tracking-[0.18em] text-navy-900">NIRIKSHAN</span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {SECTIONS.slice(1).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goto(s.id)}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
                  active === s.id ? 'text-navy-900' : 'text-slate-500 hover:text-navy-800',
                )}
              >
                {s.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-blue-500 transition-all duration-300 ease-smooth',
                    active === s.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
                  )}
                />
              </button>
            ))}
            <Link
              to="/analytics"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:text-navy-800"
            >
              Analytics
            </Link>
            <Link
              to="/about"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:text-navy-800"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="nrk-magnetic">
              <span className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-blue-700 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                Launch Dashboard
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* scroll progress hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-ice-200/70" aria-hidden="true">
          <div
            className="h-px bg-gradient-to-r from-blue-400 via-blue-600 to-cyan-400 transition-[width] duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}

export function NirikshanMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" fill="#e7f2fc" stroke="#b9d9f6" />
      <circle cx="20" cy="20" r="12" stroke="#2c7fbe" strokeWidth="1.6" opacity="0.75" />
      <circle cx="20" cy="20" r="7" stroke="#1c6fb2" strokeWidth="1.8" />
      <path d="M20 3.5v6M20 30.5v6M3.5 20h6M30.5 20h6" stroke="#5aa8e4" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="26.6" cy="13.4" r="3.4" fill="#dd5145" />
    </svg>
  );
}
