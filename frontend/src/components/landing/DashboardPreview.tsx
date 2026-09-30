import { Link } from 'react-router-dom';
import { Reveal } from '../motion/Reveal';
import { ErrorState, Skeleton } from '../ui/states';
import { RiskRanking, type RankedRisk } from '../intelligence/RiskRanking';
import { useCountUp } from '../../hooks/useAsync';
import type { LandingData } from './useLandingData';

export function DashboardPreview({ data }: { data: LandingData }) {
  const stat = data.dayStats.find((s) => s.day === data.leadDay);
  const meanConfidence = useCountUp(stat?.meanConfidence ?? 0, 800);
  const highRisk = data.regions.filter((r) => r.bust_probability >= 0.5).length;
  const ranked: RankedRisk[] = [...data.regions]
    .sort((a, b) => b.bust_probability - a.bust_probability)
    .slice(0, 6)
    .map((r) => ({
      region_id: r.region_id,
      name: r.name,
      admin1: r.admin1,
      lead_day: r.lead_day,
      bust_probability: r.bust_probability,
      confidence: r.confidence,
    }));

  return (
    <section id="preview" className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-300 to-transparent" />
        <div className="absolute right-[-10%] top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.3),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Product preview</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-4xl">
                A real intelligence engine underneath.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                A live excerpt of the dashboard: confidence, risk ranking and lead-day state for the current
                analysis.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="nrk-magnetic inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Enter the dashboard
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-ice-200 bg-white shadow-lift">
            {/* faux product chrome */}
            <div className="flex items-center justify-between gap-3 border-b border-ice-100 bg-ice-25/70 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" aria-hidden="true" />
                <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-800">
                  Reliability dashboard
                </span>
              </div>
              <span className="text-[11.5px] text-slate-400">Lead day {data.leadDay}</span>
            </div>

            {data.loading ? (
              <div className="grid gap-4 p-5 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-56 w-full" />
                </div>
                <Skeleton className="h-80 w-full" />
              </div>
            ) : data.unavailable ? (
              <div className="p-5">
                <ErrorState
                  title="Dashboard excerpt unavailable"
                  description="The analysis service could not be reached, so no dashboard values are shown."
                  onRetry={data.reload}
                />
              </div>
            ) : (
              <div className="grid gap-4 p-5 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatTile label="Regions analysed" value={String(data.regions.length)} />
                    <StatTile label="Mean confidence" value={`${meanConfidence.toFixed(1)}%`} accent="blue" />
                    <StatTile label="High-risk regions" value={String(highRisk)} accent="risk" />
                  </div>

                  <div className="rounded-2xl border border-ice-100 bg-ice-25/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="eyebrow">Confidence by lead day</span>
                      <span className="text-[11px] text-slate-400">0–100 scale</span>
                    </div>
                    <div className="flex items-end gap-1.5" aria-hidden="true">
                      {data.dayStats.map((s) => {
                        const active = s.day === data.leadDay;
                        return (
                          <div key={s.day} className="flex flex-1 flex-col items-center gap-1">
                            <span
                              className={`w-full rounded-t-sm transition-all duration-500 ${active ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-blue-200'}`}
                              style={{ height: `${Math.max(6, s.meanConfidence) * 0.8}px` }}
                            />
                            <span className={`text-[9.5px] font-semibold ${active ? 'text-blue-700' : 'text-slate-400'}`}>
                              D{s.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-ice-100 bg-white p-4">
                  <div className="eyebrow mb-3">Highest bust risk</div>
                  <RiskRanking items={ranked} limit={6} />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-ice-100 bg-ice-25/50 px-5 py-4">
              <Link
                to="/map"
                className="rounded-lg border border-ice-200 bg-white px-4 py-2 text-[13px] font-semibold text-navy-800 transition-colors hover:border-blue-300 hover:bg-ice-50"
              >
                Open the map
              </Link>
              <Link
                to="/analytics"
                className="rounded-lg border border-ice-200 bg-white px-4 py-2 text-[13px] font-semibold text-navy-800 transition-colors hover:border-blue-300 hover:bg-ice-50"
              >
                Verification &amp; analytics
              </Link>
              <span className="ml-auto text-[11.5px] text-slate-400">
                Excerpt reflects the current analysis service response.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatTile({ label, value, accent = 'default' }: { label: string; value: string; accent?: 'default' | 'blue' | 'risk' }) {
  return (
    <div className="rounded-2xl border border-ice-100 bg-white p-4 shadow-soft">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div
        className={`mt-1.5 font-mono text-2xl font-extrabold tabular-nums ${
          accent === 'blue' ? 'text-blue-600' : accent === 'risk' ? 'text-orange-600' : 'text-navy-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
