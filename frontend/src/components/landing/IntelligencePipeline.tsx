import { Reveal } from '../motion/Reveal';

const STAGES = [
  { title: 'Forecast', body: 'Medium-range NWP guidance for every region.' },
  { title: 'Uncertainty', body: 'Disagreement between forecast centres and ensemble spread.' },
  { title: 'Error history', body: 'Verified past performance for the same region and lead time.' },
  { title: 'AI risk model', body: 'Calibrated classifier trained on historical bust events.' },
  { title: 'Confidence', body: 'A single 0–100 score per region, per lead day.' },
  { title: 'Explanation', body: 'SHAP-ranked risk drivers behind every low-confidence verdict.' },
  { title: 'Regional intelligence', body: 'Where risk concentrates across India, day by day.' },
];

export function IntelligencePipeline() {
  return (
    <section id="pipeline" className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.3),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-4xl">
            Seven stages from raw forecast to regional intelligence.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            Every stage is auditable: inputs are forecast products, outputs are calibrated probabilities with
            explanations attached.
          </p>
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className={i === 6 ? 'sm:col-span-2 lg:col-span-4' : ''}>
              <div className="nrk-stage group relative h-full overflow-hidden rounded-2xl border border-ice-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lift">
                <div aria-hidden="true" className="absolute right-4 top-3 font-mono text-[42px] font-extrabold leading-none text-ice-100 transition-colors duration-300 group-hover:text-blue-100">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-ice-100 text-blue-600 ring-1 ring-inset ring-blue-100">
                    <StageIcon index={i} />
                  </div>
                  <h3 className="mt-3.5 text-[15px] font-bold tracking-tight text-navy-900">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{s.body}</p>
                </div>
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StageIcon({ index }: { index: number }) {
  const paths = [
    <path key="0" d="M3 12h4l3 8 4-16 3 8h4" />,
    <path key="1" d="M4 12h4m8 0h4M12 4v4m0 8v4" />,
    <path key="2" d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 7.5V12l3 2" />,
    <path key="3" d="M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M17 10h4" />,
    <path key="4" d="M4 18V9M10 18V5M16 18v-7M22 18H2" />,
    <path key="5" d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.3 2h4.6c.2-.8.7-1.5 1.3-2A6 6 0 0 0 12 3Z" />,
    <path key="6" d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" />,
  ];
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[index]}
    </svg>
  );
}
