import { Link } from 'react-router-dom';
import { SplineHero } from '../components/spline/SplineHero';
import { IconArrowRight, IconShield, IconGrid, IconTarget, IconBulb } from '../components/ui/icons';
import { Button } from '../components/ui/primitives';
import { usePrefersReducedMotion } from '../hooks/useAsync';

const CONCEPTS = [
  {
    eyebrow: 'DAY 1–10',
    title: 'Confidence Intelligence',
    body: 'Track how forecast confidence decays across every lead day, for every region, on one continuous scale.',
    icon: IconGrid,
  },
  {
    eyebrow: 'REGIONAL',
    title: 'Bust-Risk Detection',
    body: 'Locate exactly where the medium-range forecast is most likely to fail, ranked by calibrated bust probability.',
    icon: IconTarget,
  },
  {
    eyebrow: 'EXPLAINABLE',
    title: 'Forecast Reliability',
    body: 'Every low-confidence verdict is accompanied by the model risk drivers that produced it — never a black box.',
    icon: IconBulb,
  },
];

const BEFORE = ['Forecast available', 'Uncertainty', 'Unknown reliability'];
const AFTER = ['Forecast', 'Nirikshan', 'Bust probability', 'Confidence', 'Why'];

export default function Landing() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="min-h-screen bg-ice-50">
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-40 border-b border-ice-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <NirikshanLogo />
            <span className="text-[15px] font-extrabold tracking-[0.16em] text-navy-900">NIRIKSHAN</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-medium text-slate-600 md:flex">
            <Link to="/how-it-works" className="transition-colors hover:text-blue-700">How it works</Link>
            <Link to="/system" className="transition-colors hover:text-blue-700">Model</Link>
            <Link to="/case-studies" className="transition-colors hover:text-blue-700">Case studies</Link>
            <Link to="/about" className="transition-colors hover:text-blue-700">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="primary">
                Open dashboard <IconArrowRight width={15} height={15} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-[1400px] items-center gap-8 px-5 pb-14 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="animate-fadeUp">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ice-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-soft">
            <IconShield width={13} height={13} className="text-blue-500" />
            SIH26079 · Forecast bust detection
          </div>

          <h1 className="text-[44px] font-extrabold leading-[0.95] tracking-[-0.03em] text-navy-900 sm:text-[64px]">
            NIRIKSHAN
          </h1>
          <p className="mt-4 max-w-xl text-xl font-semibold leading-snug text-blue-700 sm:text-2xl">
            Know When Not to Trust the Forecast.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Nirikshan is an AI-powered forecast reliability layer that evaluates medium-range Numerical Weather
            Prediction outputs and estimates <strong className="text-navy-900">where</strong>,{' '}
            <strong className="text-navy-900">when</strong>, and{' '}
            <strong className="text-navy-900">why</strong> forecast confidence may deteriorate.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" className="!px-6 !py-3">
                Open Intelligence Dashboard <IconArrowRight width={16} height={16} />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="secondary" className="!px-6 !py-3">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ice-200 pt-5 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> GFS · ECMWF IFS · ICON · GEM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> 127 verified Indian locations
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Calibrated probability · SHAP explainability
            </span>
          </div>
        </div>

        <div className={reduced ? 'animate-fadeIn' : 'animate-fadeUp'}>
          <SplineHero className="h-[340px] w-full sm:h-[420px] lg:h-[500px]" />
        </div>
      </section>

      {/* --------------------------------------------------------- concepts */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {CONCEPTS.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="panel panel-hover animate-fadeUp p-6"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{c.eyebrow}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice-100 text-blue-600">
                    <Icon width={18} height={18} />
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-navy-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------ before/after */}
      <section className="border-y border-ice-200 bg-white/70 py-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">From weather prediction to forecast intelligence</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Before → After Nirikshan
            </h2>
          </div>

          <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <FlowCard
              tone="before"
              label="Before Nirikshan"
              steps={BEFORE}
              note="The forecast exists, but nobody can quantify how far it can be trusted."
            />
            <div className="hidden items-center lg:flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lift">
                <IconArrowRight width={20} height={20} />
              </div>
            </div>
            <FlowCard
              tone="after"
              label="After Nirikshan"
              steps={AFTER}
              note="Every forecast carries a probability, a confidence score and an explanation."
            />
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm font-medium text-slate-500">
            Nirikshan does not replace the weather forecast. It measures how much the forecast should be trusted.
          </p>

          <div className="mt-8 flex justify-center">
            <Link to="/dashboard">
              <Button variant="primary" className="!px-6 !py-3">
                Explore the intelligence dashboard <IconArrowRight width={16} height={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-slate-500">
          <div className="flex items-center gap-2.5">
            <NirikshanLogo size={22} />
            <span className="font-semibold text-navy-800">NIRIKSHAN</span>
            <span>· Know when not to trust the forecast.</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/system" className="hover:text-blue-700">Model &amp; system</Link>
            <Link to="/about" className="hover:text-blue-700">About</Link>
            <Link to="/how-it-works" className="hover:text-blue-700">Pipeline</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FlowCard({ tone, label, steps, note }: { tone: 'before' | 'after'; label: string; steps: string[]; note: string }) {
  const isAfter = tone === 'after';
  return (
    <div
      className={`rounded-2xl border p-6 shadow-soft ${
        isAfter ? 'border-blue-200 bg-gradient-to-b from-blue-50/70 to-white' : 'border-ice-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`eyebrow ${isAfter ? '!text-blue-600' : ''}`}>{label}</span>
        {!isAfter && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Partial
          </span>
        )}
        {isAfter && (
          <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Complete
          </span>
        )}
      </div>

      <ol className="mt-5 space-y-0">
        {steps.map((s, i) => {
          const highlight = isAfter && i >= 2;
          return (
            <li key={s} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                    highlight ? 'bg-blue-600 text-white' : isAfter ? 'bg-ice-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className={`my-1 h-5 w-px ${highlight ? 'bg-blue-300' : 'bg-ice-200'}`} />}
              </div>
              <span
                className={`pt-1 text-sm font-semibold ${
                  highlight ? 'text-blue-700' : isAfter ? 'text-navy-900' : 'text-slate-500'
                }`}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 border-t border-ice-100 pt-3 text-[12px] leading-relaxed text-slate-500">{note}</p>
    </div>
  );
}

function NirikshanLogo({ size = 26 }: { size?: number }) {
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
