import { useCountUp } from '../../hooks/useAsync';
import { Reveal } from '../motion/Reveal';
import { ErrorState, Skeleton } from '../ui/states';
import type { RegionAnalysis } from '../../types';

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ice-100 py-3 last:border-0">
      <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
      <span className={`text-right text-sm ${strong ? 'font-bold text-navy-900' : 'font-semibold text-navy-800'}`}>{value}</span>
    </div>
  );
}

export function BeforeAfter({
  analysis,
  loading,
  unavailable,
  regionName,
  leadDay,
  onRetry,
}: {
  analysis: RegionAnalysis | null;
  loading: boolean;
  unavailable: boolean;
  regionName: string | null;
  leadDay: number;
  onRetry: () => void;
}) {
  const bust = useCountUp(analysis ? Math.round(analysis.bust_probability * 100) : 0, 900);
  const confidence = useCountUp(analysis ? Math.round(analysis.confidence) : 0, 900);
  const cases = useCountUp(analysis?.historical_analogs?.n_analogs ?? 0, 900);

  const driver = analysis?.plain_reasons?.[0] ?? analysis?.reasons?.[0]?.reason ?? null;
  const ready = Boolean(analysis);

  return (
    <section className="relative py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <p className="eyebrow">Forecast → confidence</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-4xl">
            From a raw forecast statement to a quantified, explained verdict.
          </h2>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* BEFORE */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-ice-200 bg-white p-6 shadow-soft sm:p-7">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Before</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Partial
                </span>
              </div>
              <div className="mt-6 flex flex-1 flex-col justify-center gap-5">
                <div className="rounded-2xl border border-ice-200 bg-ice-50 p-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Forecast</div>
                  <p className="mt-1.5 text-lg font-bold text-navy-900">“Heavy rainfall expected”</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-blue-300 text-2xl font-extrabold text-blue-400">
                    ?
                  </span>
                  <p className="text-sm font-semibold leading-snug text-slate-500">
                    How confident are we?
                    <span className="mt-0.5 block text-[12.5px] font-normal text-slate-400">
                      No probability, no drivers, no history.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* connector */}
          <div className="hidden items-center lg:flex" aria-hidden="true">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lift">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </div>
          </div>

          {/* AFTER */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-6 shadow-soft sm:p-7">
              <div className="flex items-center justify-between gap-2">
                <span className="eyebrow !text-blue-600">After Nirikshan</span>
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Complete
                </span>
              </div>

              {unavailable && !ready ? (
                <div className="mt-5 flex-1">
                  <ErrorState
                    title="Worked example unavailable"
                    description="The analysis service did not respond, so no example values are shown."
                    onRetry={onRetry}
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              ) : (
                <div className="mt-5 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-blue-100 bg-white/80 px-4 py-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-500">Worked example</span>
                    <span className="text-[11.5px] font-semibold text-slate-500">
                      {regionName ?? 'Selecting region…'} · Day {leadDay}
                    </span>
                  </div>

                  <div className="mt-3">
                    {loading && !analysis ? (
                      <div className="space-y-3 py-2">
                        {[0, 1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-9 w-full" />
                        ))}
                      </div>
                    ) : ready && analysis ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-blue-100 bg-white p-4">
                            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Bust probability</div>
                            <div className="mt-1 font-mono text-3xl font-extrabold text-risk-high tabular-nums">{Math.round(bust)}%</div>
                          </div>
                          <div className="rounded-2xl border border-blue-100 bg-white p-4">
                            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Confidence</div>
                            <div className="mt-1 font-mono text-3xl font-extrabold text-blue-600 tabular-nums">{Math.round(confidence)}%</div>
                          </div>
                        </div>
                        <div className="mt-2 rounded-2xl border border-blue-100 bg-white px-4">
                          <Row label="Primary risk driver" value={driver ?? '—'} strong />
                          <Row label="Historical similarity" value={`${Math.round(cases)} similar cases`} />
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-ice-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                        Waiting for the analysis service…
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
