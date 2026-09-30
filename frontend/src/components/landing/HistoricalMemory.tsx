import { Reveal } from '../motion/Reveal';
import { ErrorState, Skeleton } from '../ui/states';
import type { RegionAnalysis } from '../../types';

const FLOW = [
  { label: 'Current forecast', detail: 'Fresh NWP guidance' },
  { label: 'Searching historical patterns', detail: 'Similar situations in the record' },
  { label: 'Similar situations', detail: 'Matched analogues' },
  { label: 'Realized forecast error', detail: 'What actually happened' },
  { label: 'Current risk', detail: 'Calibrated bust probability' },
];

export function HistoricalMemory({
  analysis,
  loading,
  unavailable,
  regionName,
  onRetry,
}: {
  analysis: RegionAnalysis | null;
  loading: boolean;
  unavailable: boolean;
  regionName: string | null;
  onRetry: () => void;
}) {
  const analogs = analysis?.historical_analogs ?? null;
  const hasData = Boolean(analogs && analogs.n_analogs > 0);

  return (
    <section className="relative py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <p className="eyebrow">Historical memory</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-4xl">
            Every forecast is measured against the situations that came before it.
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* flow */}
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-ice-200 bg-white p-6 shadow-soft">
              <div aria-hidden="true" className="grid-paper absolute inset-0 opacity-50" />
              <ol className="nrk-stagger relative space-y-3">
                {FLOW.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-ice-50 font-mono text-[11px] font-bold text-blue-600">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-ice-100 bg-ice-25/70 px-4 py-2.5">
                      <span className="truncate text-[13px] font-semibold text-navy-900">{step.label}</span>
                      <span className="hidden truncate text-[11.5px] text-slate-400 sm:block">{step.detail}</span>
                    </span>
                    {i < FLOW.length - 1 && (
                      <span aria-hidden="true" className="shrink-0 rotate-90 text-blue-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* numbers */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-ice-50 to-blue-50/70 p-6 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <div className="eyebrow !text-blue-600">Matched record</div>
                <div className="text-[11.5px] text-slate-400">{regionName ?? '—'}</div>
              </div>

              {loading && !analysis ? (
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : unavailable && !analysis ? (
                <div className="mt-5">
                  <ErrorState
                    title="Historical record unavailable"
                    description="The analysis service did not respond, so no analogue values are shown."
                    onRetry={onRetry}
                  />
                </div>
              ) : hasData && analogs ? (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Similar cases</div>
                      <div className="mt-1 font-mono text-3xl font-extrabold text-navy-900 tabular-nums">
                        {analogs.n_analogs}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Historical bust rate</div>
                      <div className="mt-1 font-mono text-3xl font-extrabold text-risk-high tabular-nums">
                        {Math.round(analogs.historical_bust_rate * 100)}%
                      </div>
                    </div>
                  </div>
                  {analogs.summary_statement && (
                    <p className="mt-3 rounded-xl border border-blue-100 bg-white/85 p-3.5 text-[12.5px] leading-relaxed text-navy-800">
                      {analogs.summary_statement}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-5 flex flex-1 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-white/60 px-5 py-10 text-center text-sm text-slate-500">
                  No matched historical situations for this region and lead day.
                </div>
              )}

              <p className="mt-auto pt-4 text-[11.5px] leading-relaxed text-slate-400">
                Values shown only when the service returns a matched record — nothing is inferred here.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
