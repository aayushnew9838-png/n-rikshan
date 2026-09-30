import { Reveal } from '../motion/Reveal';

const INPUTS = [
  { label: 'Forecast', detail: 'Medium-range NWP output' },
  { label: 'Uncertainty', detail: 'Multi-model disagreement' },
  { label: 'Historical error', detail: 'Verified past performance' },
  { label: 'Spatial context', detail: 'Regional behaviour' },
];

const STAGES_BEFORE = ['Forecast available', 'Uncertainty', 'Unknown reliability'];

export function ProblemSection() {
  return (
    <section id="problem" className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.4),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <p className="eyebrow">The problem</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-5xl">
            A forecast can be right.
            <br />
            <span className="text-slate-400">A forecast can be wrong.</span>
          </h2>
          <p className="mt-5 text-lg font-semibold text-blue-700 sm:text-xl">But the real question is: “How reliable is it?”</p>
        </Reveal>

        {/* transformation chain */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STAGES_BEFORE.map((s, i) => (
            <Reveal key={s} delay={i * 110}>
              <div className="relative flex h-full items-center gap-4 rounded-2xl border border-ice-200 bg-white p-5 shadow-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ice-100 font-mono text-[13px] font-bold text-blue-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-800">{s}</span>
                {i < STAGES_BEFORE.length - 1 && (
                  <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-ice-200 bg-white text-blue-500 shadow-soft md:flex">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* the transformation */}
        <Reveal delay={120}>
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-ice-50 to-blue-50/70 p-6 shadow-soft sm:p-9">
            <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-500">Nirikshan</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
                  Reliability
                  <br />
                  intelligence
                </div>
                <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {INPUTS.map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 shadow-soft backdrop-blur">
                      <div className="text-[13px] font-bold text-navy-900">{item.label}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{item.detail}</div>
                    </div>
                    {i === INPUTS.length - 1 ? (
                      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-soft">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                      </span>
                    ) : (
                      <span aria-hidden="true" className="text-blue-300">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
