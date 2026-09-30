import { Suspense, lazy, useMemo, useState } from 'react';
import { Reveal } from '../motion/Reveal';
import { ErrorState, MapSkeleton, Skeleton } from '../ui/states';
import { useCountUp } from '../../hooks/useAsync';
import { cn } from '../../utils/cn';
import type { LandingData } from './useLandingData';

const ConfidenceMap = lazy(() =>
  import('../map/ConfidenceMap').then((m) => ({ default: m.ConfidenceMap })),
);

const RISK_STOPS = [
  { label: 'Low', className: 'bg-blue-500' },
  { label: 'Moderate', className: 'bg-amber-400' },
  { label: 'High', className: 'bg-orange-500' },
  { label: 'Critical', className: 'bg-red-500' },
];

export function IndiaIntelligence({ data }: { data: LandingData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => data.regions.find((r) => r.region_id === selectedId) ?? data.topRisk,
    [data.regions, selectedId, data.topRisk],
  );

  const stat = data.dayStats.find((s) => s.day === data.leadDay);
  const meanConfidence = useCountUp(stat?.meanConfidence ?? 0, 600);
  const meanBust = useCountUp((stat?.meanBustProbability ?? 0) * 100, 600);

  return (
    <section id="intelligence" className="relative py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Regional intelligence</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-5xl">
                See where confidence breaks
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                Calibrated bust probability and confidence for every analysed region — steered by the day-1 to
                day-10 timeline below.
              </p>
            </div>
            {data.unavailable && (
              <button
                type="button"
                onClick={data.reload}
                className="rounded-lg border border-ice-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 shadow-soft transition-colors hover:border-blue-300 hover:bg-ice-50"
              >
                Retry connection
              </button>
            )}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* map + timeline */}
          <Reveal className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-ice-200 bg-white shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-ice-100 px-4 py-3">
                <div>
                  <div className="eyebrow">India confidence field</div>
                  <div className="mt-0.5 text-[11.5px] text-slate-400">
                    Hover a region for values · click to inspect
                  </div>
                </div>
                <div className="flex items-center gap-2" aria-hidden="true">
                  {RISK_STOPS.map((s) => (
                    <span key={s.label} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <span className={cn('h-2 w-4 rounded-sm', s.className)} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                {data.loading ? (
                  <div className="p-4">
                    <MapSkeleton />
                  </div>
                ) : data.unavailable ? (
                  <div className="p-4">
                    <ErrorState
                      title="Regional intelligence unavailable"
                      description="The analysis service could not be reached, so no regional values are shown."
                      onRetry={data.reload}
                    />
                  </div>
                ) : (
                  <Suspense fallback={<div className="h-[440px] p-4"><MapSkeleton /></div>}>
                    <ConfidenceMap
                      regions={data.regions}
                      layer="bust"
                      selectedId={selected?.region_id ?? null}
                      onSelect={setSelectedId}
                      height={440}
                    />
                  </Suspense>
                )}
              </div>

              {/* ------------------------------------------------ timeline */}
              <div className="border-t border-ice-100 bg-ice-25/60 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Forecast confidence decays with time
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11.5px] font-semibold tabular-nums text-slate-500">
                    <span>
                      Mean confidence{' '}
                      <span className="text-blue-600">{stat ? `${meanConfidence.toFixed(1)}%` : '—'}</span>
                    </span>
                    <span>
                      Mean bust risk{' '}
                      <span className="text-orange-600">{stat ? `${meanBust.toFixed(1)}%` : '—'}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-stretch gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Select forecast lead day">
                  {(data.days.length ? data.days : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((d) => {
                    const ds = data.dayStats.find((s) => s.day === d);
                    const active = d === data.leadDay;
                    const height = ds ? Math.max(12, Math.min(100, ds.meanConfidence)) : 0;
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={data.loading || data.unavailable}
                        onClick={() => data.setLeadDay(d)}
                        aria-pressed={active}
                        className={cn(
                          'group flex min-w-[46px] flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50',
                          active ? 'bg-white shadow-soft ring-1 ring-blue-300' : 'hover:bg-white/70',
                        )}
                      >
                        <span className={cn('text-[11px] font-bold', active ? 'text-blue-700' : 'text-slate-500')}>D{d}</span>
                        <span className="relative flex h-14 w-full items-end justify-center rounded bg-ice-100/80" aria-hidden="true">
                          <span
                            className={cn(
                              'w-full rounded-sm transition-[height,background-color] duration-500 ease-out',
                              active ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-blue-300/80 group-hover:bg-blue-400/80',
                            )}
                            style={{ height: `${height}%` }}
                          />
                        </span>
                        <span className="font-mono text-[9.5px] tabular-nums text-slate-400">
                          {ds ? `${Math.round(ds.meanConfidence)}` : '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* mini intelligence panel */}
          <Reveal delay={120}>
            <div className="nrk-interactive flex h-full flex-col rounded-2xl border border-ice-200 bg-white p-5 shadow-soft">
              <div className="eyebrow">Region readout</div>
              {data.loading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : data.unavailable || !selected ? (
                <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-dashed border-ice-300 bg-ice-25 px-4 py-8 text-center text-[13px] text-slate-500">
                  {data.unavailable
                    ? 'No values available while the service is unreachable.'
                    : 'Select a region on the map.'}
                </div>
              ) : (
                <>
                  <div className="mt-3">
                    <div className="text-lg font-extrabold tracking-tight text-navy-900">{selected.name}</div>
                    <div className="text-[11.5px] text-slate-400">
                      {selected.admin1 ?? 'India'} · Day {selected.lead_day}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Readout
                      label="Bust probability"
                      value={`${Math.round(selected.bust_probability * 100)}%`}
                      tone="risk"
                      pct={selected.bust_probability * 100}
                    />
                    <Readout label="Confidence" value={`${selected.confidence}%`} tone="blue" pct={selected.confidence} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-ice-100 pt-3 text-[12px]">
                    <span className="text-slate-500">Risk level</span>
                    <span className="font-bold uppercase tracking-wider text-navy-900">{selected.bust_risk}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-navy-800">
                      {selected.confidence_category.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  <div className="mt-auto pt-4">
                    <a
                      href="/dashboard"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      Full regional analysis
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                    </a>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: 'risk' | 'blue' }) {
  return (
    <div className="rounded-xl border border-ice-100 bg-ice-25/70 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-slate-500">{label}</span>
        <span className={`font-mono text-lg font-extrabold tabular-nums ${tone === 'risk' ? 'text-orange-600' : 'text-blue-600'}`}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-ice-200">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone === 'risk' ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
