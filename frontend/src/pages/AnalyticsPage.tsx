import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { BackendBanner, ChartSkeleton, SkeletonPanel, TableSkeleton } from '../components/ui/states';
import { Badge, Button, Stat, Panel, SectionTitle, InfoTip, Select, SegmentedControl } from '../components/ui/primitives';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { DEMO_FORCED, demoAnalytics, getAnalytics } from '../services/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { pct, num } from '../utils/format';
import { riskColor, confidenceColor } from '../utils/risk';
import { IconChart, IconGrid, IconDownload, IconInfo } from '../components/ui/icons';

const AXIS = { stroke: '#c8d3de', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' };
const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid #d3e8f8',
  boxShadow: '0 10px 30px -12px rgba(11,31,56,.35)',
  fontSize: 12,
};

type View = 'overview' | 'calibration' | 'regional';

export default function AnalyticsPage() {
  const { leadDay, isDemo, dayWise } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { variable, setLeadDay } = useAppStore();
  const [view, setView] = useState<View>('overview');
  const [windowDays, setWindowDays] = useState(10);

  const useLive = !isDemo && !DEMO_FORCED;
  const analytics = useAsync(async () => (useLive ? getAnalytics(windowDays) : Promise.resolve(demoAnalytics())), [
    windowDays,
    useLive,
  ]);

  const leadSeries = useMemo(() => {
    const a = analytics.data;
    if (!a) return [];
    return a.bust_rate_by_lead.map((b) => ({
      day: b.lead_day,
      bustRate: Math.round(b.bust_rate * 1000) / 10,
      n: b.n,
      confidence: a.confidence_by_lead.find((c) => c.lead_day === b.lead_day)?.mean_confidence ?? null,
      expected: Math.round((100 * (1 - b.bust_rate)) * 10) / 10,
    }));
  }, [analytics.data]);

  const calibration = useMemo(() => {
    const c = analytics.data?.calibration ?? [];
    return c.map((p) => ({ predicted: Math.round(p.predicted * 100), observed: Math.round(p.observed * 100), n: p.count }));
  }, [analytics.data]);

  const regional = useMemo(() => (analytics.data?.regional_risk ?? []).slice(0, 18), [analytics.data]);

  const errorDist = analytics.data?.error_distribution ?? [];
  const maxErr = Math.max(1, ...errorDist.map((e) => e.count));

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Analytics"
        description="Aggregated performance, calibration and regional risk - computed by the backend, never re-stated as a hard-coded claim."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls showThresholds />}
        actions={
          <>
            <SegmentedControl
              ariaLabel="Analytics view"
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'calibration', label: 'Calibration' },
                { value: 'regional', label: 'Regional' },
              ]}
              value={view}
              onChange={setView}
            />
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(analytics.data ?? {}, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nirikshan-analytics-day${leadDay}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Download the currently loaded analytics bundle"
            >
              <IconDownload width={15} height={15} /> Export
            </Button>
          </>
        }
      />

      <div className="mb-4">
        {isDemo ? (
          <BackendBanner mode="demo" onRetry={retry} />
        ) : (
          <BackendBanner mode="live" onEnableDemo={enableDemo} onRetry={retry} notes={analytics.data?.notes} />
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Select
          label="Aggregation window"
          value={String(windowDays)}
          onChange={(e) => setWindowDays(Number(e.target.value))}
        >
          {[5, 7, 10].map((d) => (
            <option key={d} value={d}>
              {d} lead days
            </option>
          ))}
        </Select>
        <div className="text-[11px] leading-relaxed text-slate-500">
          Source: <span className="data-value font-semibold">{analytics.data?.source ?? '-'}</span> - variable{' '}
          <span className="data-value font-semibold">{variable}</span> - active lead day{' '}
          <span className="data-value font-semibold">{leadDay}</span>
        </div>
      </div>

      <AsyncSection
        state={analytics}
        skeleton={<ChartSkeleton height={300} />}
        showUnavailableAction
        onEnableDemo={enableDemo}
      >
        {(data) => (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                label="Mean bust rate"
                value={
                  leadSeries.length
                    ? Math.round((leadSeries.reduce((s, r) => s + r.bustRate, 0) / leadSeries.length) * 10) / 10
                    : '-'
                }
                suffix={leadSeries.length ? '%' : undefined}
                sub={`across ${windowDays} lead days`}
                tone="risk"
              />
              <Stat
                label="Best lead day"
                value={
                  leadSeries.length
                    ? `D${[...leadSeries].sort((a, b) => b.confidence! - a.confidence!)[0].day}`
                    : '-'
                }
                sub="highest mean confidence"
                tone="calm"
              />
              <Stat
                label="Calibration points"
                value={calibration.length}
                sub="reliability-diagram bins"
              />
              <Stat
                label="Regional rows"
                value={regional.length}
                sub="admin areas aggregated"
              />
            </div>

            {view === 'overview' && (
              <>
                <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                  <Panel className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="eyebrow">Bust rate vs confidence by lead day</div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Bars are the realised bust rate; the line is the mean confidence the system stated.
                        </p>
                      </div>
                      <IconChart width={16} height={16} className="text-slate-300" />
                    </div>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={leadSeries} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                          <CartesianGrid stroke="#eef4fa" vertical={false} />
                          <XAxis dataKey="day" tick={AXIS} tickLine={false} />
                          <YAxis tick={AXIS} tickLine={false} unit="%" domain={[0, 100]} />
                          <Tooltip contentStyle={TOOLTIP} formatter={(v: number, n: string) => [`${v}%`, n]} />
                          <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="bustRate" name="Bust rate" fill="#ef9455" radius={[4, 4, 0, 0]} barSize={20} />
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            name="Mean confidence"
                            stroke="#1c6fb2"
                            strokeWidth={2.4}
                            dot={{ r: 3, fill: '#1c6fb2', strokeWidth: 0 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>

                  <Panel className="p-4">
                    <div className="eyebrow mb-1">Error distribution</div>
                    <p className="mb-3 text-xs text-slate-500">
                      Count of verification records per realised-error bin.
                    </p>
                    {errorDist.length ? (
                      <div className="flex h-[260px] items-end gap-2">
                        {errorDist.map((e, i) => (
                          <div key={e.bin} className="flex flex-1 flex-col items-center gap-2">
                            <span className="data-value text-[10px] font-bold text-navy-800">{e.count}</span>
                            <div
                              className="w-full rounded-t-md"
                              style={{
                                height: `${(e.count / maxErr) * 190 + 4}px`,
                                background: riskColor(Math.min(1, i / Math.max(1, errorDist.length - 1))),
                                opacity: 0.85,
                              }}
                              title={`${e.bin}: ${e.count}`}
                            />
                            <span className="text-[9px] font-semibold text-slate-500">{e.bin}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-slate-500">
                        The backend did not return an error distribution for this deployment.
                      </p>
                    )}
                  </Panel>
                </section>

                <section className="mb-5 grid gap-4 lg:grid-cols-2">
                  <Panel className="p-4">
                    <div className="eyebrow mb-3">Day-wise confidence trend</div>
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={leadSeries} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                          <defs>
                            <linearGradient id="conf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4fa8dd" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#4fa8dd" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#eef4fa" vertical={false} />
                          <XAxis dataKey="day" tick={AXIS} tickLine={false} />
                          <YAxis tick={AXIS} tickLine={false} domain={[0, 100]} unit="%" />
                          <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [`${v}%`, 'Mean confidence']} />
                          <Area
                            type="monotone"
                            dataKey="confidence"
                            stroke="#1c6fb2"
                            strokeWidth={2.2}
                            fill="url(#conf)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                      Confidence should rise as the bust rate falls. Where the two lines converge, the system is
                      behaving conservatively for that lead time.
                    </p>
                  </Panel>

                  <Panel className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="eyebrow">Model comparison</div>
                      <Badge tone="neutral">{data.model_comparison?.length ?? 0} models</Badge>
                    </div>
                    <div className="no-scrollbar overflow-x-auto">
                      <table className="w-full border-collapse text-left text-[12px]">
                        <thead>
                          <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                            <th className="px-3 py-2">Model</th>
                            <th className="px-3 py-2">ROC AUC</th>
                            <th className="px-3 py-2">PR AUC</th>
                            <th className="px-3 py-2">Brier</th>
                            <th className="px-3 py-2">F1</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.model_comparison ?? []).map((m) => (
                            <tr key={m.model} className="border-b border-ice-50 last:border-0">
                              <td className="px-3 py-2 font-semibold text-navy-900">{m.model}</td>
                              <td className="data-value px-3 py-2 text-slate-600">{num(m.roc_auc)}</td>
                              <td className="data-value px-3 py-2 text-slate-600">{num(m.pr_auc)}</td>
                              <td className="data-value px-3 py-2 text-slate-600">{num(m.brier)}</td>
                              <td className="data-value px-3 py-2 text-slate-600">{num(m.f1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!data.model_comparison?.length && (
                        <p className="mt-3 text-[12px] text-slate-500">
                          No cross-model comparison is published by this backend.
                        </p>
                      )}
                    </div>
                  </Panel>
                </section>
              </>
            )}

            {view === 'calibration' && (
              <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
                <Panel className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="eyebrow">Reliability diagram</div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Stated probability against realised frequency. The diagonal is perfect calibration.
                      </p>
                    </div>
                    <InfoTip text="A point on the diagonal means the stated probability was exactly realised." />
                  </div>
                  {calibration.length ? (
                    <div style={{ height: 340 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 16, bottom: 8, left: -12 }}>
                          <CartesianGrid stroke="#eef4fa" />
                          <XAxis type="number" dataKey="predicted" name="Stated" unit="%" tick={AXIS} domain={[0, 100]} />
                          <YAxis type="number" dataKey="observed" name="Realised" unit="%" tick={AXIS} domain={[0, 100]} />
                          <ZAxis type="number" dataKey="n" range={[40, 400]} name="Count" />
                          <Tooltip
                            contentStyle={TOOLTIP}
                            formatter={(v: number, n: string) => [`${v}%`, n === 'n' ? 'Records' : n]}
                          />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                          <Scatter
                            data={[
                              { predicted: 0, observed: 0 },
                              { predicted: 25, observed: 25 },
                              { predicted: 50, observed: 50 },
                              { predicted: 75, observed: 75 },
                              { predicted: 100, observed: 100 },
                            ]}
                            dataKey="observed"
                            line
                            fill="none"
                            stroke="#b9c6d4"
                            strokeDasharray="5 5"
                            name="Perfect calibration"
                          />
                          <Scatter data={calibration} fill="#1c6fb2" name="Bins" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-[12px] text-slate-500">
                      No calibration bins returned by this backend.
                    </div>
                  )}
                </Panel>

                <div className="space-y-4">
                  <Panel className="p-4">
                    <div className="eyebrow mb-2">Variable performance</div>
                    <div className="space-y-2.5">
                      {(data.variable_performance ?? []).map((v) => (
                        <div key={v.variable}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-navy-800">{v.variable}</span>
                            <span className="data-value text-slate-500">ROC {num(v.roc_auc)}</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-ice-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.max(3, (v.roc_auc ?? 0) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {!data.variable_performance?.length && (
                      <p className="text-[12px] text-slate-500">No per-variable metrics published.</p>
                    )}
                  </Panel>

                  <Panel className="p-4">
                    <div className="eyebrow mb-2">Reading calibration</div>
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      Expected calibration error (ECE) summarises the average gap between stated and realised
                      frequency. A small ECE with a modest discrimination score is a well-behaved probabilistic
                      system: its numbers are honest even when its ranking is imperfect.
                    </p>
                  </Panel>
                </div>
              </section>
            )}

            {view === 'regional' && (
              <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)]">
                <Panel className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="eyebrow">Mean bust probability by region</div>
                      <p className="mt-0.5 text-xs text-slate-500">Highest first - click to set the active lead day.</p>
                    </div>
                    <IconGrid width={16} height={16} className="text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    {regional.map((r) => (
                      <button
                        key={r.region_id}
                        onClick={() => setLeadDay(Math.min(10, Math.max(1, leadDay)))}
                        className="flex w-full items-center gap-3 rounded-lg border border-ice-100 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-ice-50"
                      >
                        <span className="w-40 shrink-0 truncate text-[12px] font-semibold text-navy-900">
                          {r.region_name}
                        </span>
                        <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ice-100">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${Math.max(3, r.mean_bust_probability * 100)}%`,
                              background: riskColor(r.mean_bust_probability),
                            }}
                          />
                        </span>
                        <span className="data-value w-12 shrink-0 text-right text-[11px] font-bold text-navy-900">
                          {pct(r.mean_bust_probability)}
                        </span>
                        <span className="hidden w-10 shrink-0 text-right text-[10px] text-slate-400 sm:block">
                          n={r.n}
                        </span>
                      </button>
                    ))}
                  </div>
                  {!regional.length && (
                    <p className="text-[12px] text-slate-500">No regional aggregation returned.</p>
                  )}
                </Panel>

                <div className="space-y-4">
                  <Panel className="p-4">
                    <div className="eyebrow mb-3">Lead-day risk curve</div>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={leadSeries} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                          <defs>
                            <linearGradient id="bust" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#dd5145" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#dd5145" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#eef4fa" vertical={false} />
                          <XAxis dataKey="day" tick={AXIS} tickLine={false} />
                          <YAxis tick={AXIS} tickLine={false} unit="%" />
                          <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [`${v}%`, 'Bust rate']} />
                          <Area type="monotone" dataKey="bustRate" stroke="#dd5145" strokeWidth={2.2} fill="url(#bust)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>

                  <Panel className="p-4">
                    <SectionTitle eyebrow="Provenance" title="Where these numbers come from" />
                    <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-600">
                      <li className="flex gap-2">
                        <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-blue-500" />
                        Lead-day and regional aggregates are computed server-side by the analytics endpoint.
                      </li>
                      <li className="flex gap-2">
                        <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-blue-500" />
                        Calibration and model-comparison tables come from the ML evaluation report.
                      </li>
                      <li className="flex gap-2">
                        <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-amber-500" />
                        In demo mode the same aggregates are rebuilt from the documented demo dataset and the real
                        evaluation report - still not hand-written numbers.
                      </li>
                    </ul>
                  </Panel>
                </div>
              </section>
            )}

            {data.notes.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-800">
                <div className="eyebrow mb-1 !text-amber-700">Notes from the analytics service</div>
                {data.notes.map((n) => (
                  <p key={n}>- {n}</p>
                ))}
              </div>
            )}

            <p className="mt-4 text-[11px] text-slate-400">
              Day-wise cells loaded: {dayWise.data?.cells.length ?? 0} - confidence values shown use the definition
              confidence = 100 x (1 - calibrated bust probability).
            </p>
          </>
        )}
      </AsyncSection>
    </>
  );
}
