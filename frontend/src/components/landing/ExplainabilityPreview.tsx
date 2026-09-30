import { useMemo } from 'react';
import { Reveal } from '../motion/Reveal';
import { ErrorState, Skeleton } from '../ui/states';
import type { RegionAnalysis } from '../../types';

export function ExplainabilityPreview({
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
  const drivers = useMemo(() => {
    if (!analysis?.reasons?.length) return [];
    const sorted = [...analysis.reasons].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    const max = Math.max(0.0001, ...sorted.map((r) => Math.abs(r.contribution)));
    return sorted.slice(0, 5).map((r) => ({
      feature: r.feature.replace(/_/g, ' '),
      reason: r.reason,
      pct: (Math.abs(r.contribution) / max) * 100,
      positive: r.contribution > 0,
    }));
  }, [analysis]);

  const statements = analysis?.plain_reasons?.slice(0, 3) ?? [];

  return (
    <section id="explainability" className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.35),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <p className="eyebrow">Explainable AI</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-5xl">
            Don’t just flag the risk.
            <br />
            <span className="text-blue-600">Explain it.</span>
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* SHAP-style bars */}
          <Reveal>
            <div className="h-full rounded-2xl border border-ice-200 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="eyebrow">Risk drivers</div>
                <div className="text-[11.5px] text-slate-400">
                  {regionName ? `${regionName} · Day ${leadDay}` : 'Awaiting region'}
                </div>
              </div>

              {loading && !analysis ? (
                <div className="mt-5 space-y-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : unavailable && !analysis ? (
                <div className="mt-5">
                  <ErrorState
                    title="Explanations unavailable"
                    description="The analysis service did not respond, so no risk drivers are shown."
                    onRetry={onRetry}
                  />
                </div>
              ) : drivers.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-ice-300 bg-ice-25 px-5 py-10 text-center text-sm text-slate-500">
                  Waiting for the analysis service…
                </div>
              ) : (
                <ul className="mt-5 space-y-4">
                  {drivers.map((d, i) => (
                    <li key={d.feature}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13px] font-semibold capitalize text-navy-900">{d.feature}</span>
                        <span className="font-mono text-[11px] tabular-nums text-slate-400">
                          {d.positive ? '↑ risk' : '↓ risk'}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ice-100">
                        <div
                          className="nrk-bar h-full rounded-full"
                          style={{
                            width: `${Math.max(4, d.pct)}%`,
                            animationDelay: `${i * 90}ms`,
                            background: d.positive
                              ? 'linear-gradient(90deg, #f3b15c, #dd5145)'
                              : 'linear-gradient(90deg, #7ec8e8, #1c6fb2)',
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11.5px] leading-snug text-slate-400">{d.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* why is confidence low */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-ice-50 to-blue-50/70 p-6 shadow-soft">
              <div className="eyebrow !text-blue-600">Why is confidence low?</div>
              {statements.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {statements.map((s, i) => (
                    <li key={i} className="flex gap-3 rounded-xl border border-white/80 bg-white/85 p-3.5 shadow-soft backdrop-blur">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-relaxed text-navy-800">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 flex-1 rounded-xl border border-dashed border-blue-200 bg-white/60 px-5 py-10 text-center text-sm text-slate-500">
                  {loading ? 'Loading explanations…' : 'No explanation statements for this selection yet.'}
                </div>
              )}
              <p className="mt-auto pt-4 text-[11.5px] leading-relaxed text-slate-400">
                Contributions are SHAP values from the reliability model — each one is tied to this specific
                prediction, not a generic rule.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
