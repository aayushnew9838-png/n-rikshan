import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ForecastVerificationChart } from '../components/charts/ForecastVerificationChart';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { BackendBanner, ChartSkeleton, SkeletonPanel, TableSkeleton, EmptyState } from '../components/ui/states';
import { Badge, Button, Stat, Panel, SectionTitle, InfoTip, ConfidenceRing } from '../components/ui/primitives';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { DEMO_FORCED, demoHistory, getForecastVerification } from '../services/api';
import { LEAD_DAY_STATS, TEMPORAL_TEST, EVAL_GENERATED_AT, NATIONAL_POS_RATE } from '../data/demo/evalReport';
import type { VerificationPoint } from '../types';
import { pct, formatUtc, num } from '../utils/format';
import { IconCompare, IconCheck, IconAlert, IconFile } from '../components/ui/icons';

function toPoints(history: Awaited<ReturnType<typeof demoHistory>>): VerificationPoint[] {
  return history.map((h) => ({
    valid_time: h.valid_time,
    lead_day: h.lead_day,
    predicted_bust_probability: h.bust_probability,
    actual_error: h.actual_error,
    was_bust: h.was_bust,
  }));
}

function metric(value: number | undefined, digits = 3): string {
  if (value === undefined || !Number.isFinite(value)) return '-';
  return value.toFixed(digits);
}

export default function VerificationPage() {
  const { leadDay, isDemo, map } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { selectedRegionId, selectRegion, regions, setLeadDay } = useAppStore();
  const useLive = !isDemo && !DEMO_FORCED;
  const [showFull, setShowFull] = useState(false);

  const catalogue = regions.length ? regions : map.data?.regions ?? [];
  const subjectId = selectedRegionId ?? catalogue[0]?.region_id ?? null;
  const subjectName = catalogue.find((r) => r.region_id === subjectId)?.name ?? subjectId;

  const points = useAsync(async () => {
    if (!subjectId) return [];
    const history = useLive ? await getForecastVerification(subjectId) : toPoints(demoHistory(subjectId, 40));
    return history.sort((a, b) => a.valid_time.localeCompare(b.valid_time));
  }, [subjectId, useLive]);

  const stats = useMemo(() => {
    const rows = points.data ?? [];
    if (!rows.length) return null;
    const flagged = rows.filter((r) => r.predicted_bust_probability >= 0.5);
    const hits = flagged.filter((r) => r.was_bust);
    const busts = rows.filter((r) => r.was_bust);
    const mae = rows.reduce((s, r) => s + r.actual_error, 0) / rows.length;
    return {
      n: rows.length,
      precision: flagged.length ? hits.length / flagged.length : null,
      recall: busts.length ? hits.length / busts.length : null,
      realizedBustRate: busts.length / rows.length,
      flagged: flagged.length,
      mae,
    };
  }, [points.data]);

  const byDay = useMemo(() => {
    const rows = points.data ?? [];
    const days = [...new Set(rows.map((r) => r.lead_day))].sort((a, b) => a - b);
    return days.map((d) => {
      const subset = rows.filter((r) => r.lead_day === d);
      const flagged = subset.filter((r) => r.predicted_bust_probability >= 0.5);
      const hits = flagged.filter((r) => r.was_bust);
      return {
        lead_day: d,
        n: subset.length,
        meanPredicted: subset.reduce((s, r) => s + r.predicted_bust_probability, 0) / subset.length,
        meanError: subset.reduce((s, r) => s + r.actual_error, 0) / subset.length,
        precision: flagged.length ? hits.length / flagged.length : null,
        flagged: flagged.length,
      };
    });
  }, [points.data]);

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Forecast vs Verification"
        description="What the model predicted, and what actually happened - the only honest way to judge a reliability system."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls />}
        actions={
          <Button variant="secondary" onClick={() => points.reload()}>
            <IconCompare width={15} height={15} /> Re-fetch history
          </Button>
        }
      />

      <div className="mb-4">
        {isDemo ? (
          <BackendBanner mode="demo" onRetry={retry} />
        ) : (
          <BackendBanner mode="live" onEnableDemo={enableDemo} onRetry={retry} />
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow">Region</span>
        {catalogue.slice(0, 16).map((r) => (
          <button
            key={r.region_id}
            onClick={() => selectRegion(r.region_id)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
              r.region_id === subjectId
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-ice-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.1fr)]">
        <Stat label="Verified cases" value={stats?.n ?? 0} animate />
        <Stat
          label="Precision at 50%"
          value={stats?.precision === null || stats?.precision === undefined ? '-' : Math.round(stats.precision * 100)}
          suffix={stats?.precision === null ? undefined : '%'}
          sub={stats ? `${stats.flagged} flagged` : undefined}
          tone={stats?.precision !== null && (stats?.precision ?? 0) < 0.6 ? 'risk' : 'calm'}
        />
        <Stat
          label="Recall at 50%"
          value={stats?.recall === null || stats?.recall === undefined ? '-' : Math.round(stats.recall * 100)}
          suffix={stats?.recall === null ? undefined : '%'}
          sub="of realised busts caught"
        />
        <Stat label="Mean realised error" value={stats ? stats.mae.toFixed(2) : '-'} />
        <Panel className="flex items-center gap-4 p-4">
          <ConfidenceRing value={Math.round((stats?.realizedBustRate ?? 0) * 100)} size={78} label="bust rate" />
          <div className="min-w-0">
            <div className="eyebrow">Realised bust rate</div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              Share of verified cases in this history that crossed the bust threshold. Compared with the national test
              positive rate of <span className="data-value font-semibold">{pct(NATIONAL_POS_RATE, 1)}</span>.
            </p>
          </div>
        </Panel>
      </div>

      <section className="mb-5">
        <AsyncSection
          state={points}
          skeleton={<ChartSkeleton height={300} />}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No verification history for this region."
          emptyDescription="The backend returned no historical cases, so no chart is drawn. Switch to demo data to explore the module with documented sample records."
          showUnavailableAction
          onEnableDemo={enableDemo}
        >
          {(data) => <ForecastVerificationChart points={data} />}
        </AsyncSection>
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <SectionTitle
            eyebrow="Per lead day"
            title="Does precision hold as lead time grows?"
            subtitle="Computed from the fetched history for the selected region."
          />
          <div className="mt-3 no-scrollbar overflow-x-auto">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">n</th>
                  <th className="px-3 py-2">Mean predicted</th>
                  <th className="px-3 py-2">Mean error</th>
                  <th className="px-3 py-2">Flagged</th>
                  <th className="px-3 py-2">Precision</th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((d) => (
                  <tr key={d.lead_day} className="border-b border-ice-50 last:border-0">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setLeadDay(d.lead_day)}
                        className="data-value font-bold text-blue-600 hover:text-blue-800"
                      >
                        D{d.lead_day}
                      </button>
                    </td>
                    <td className="data-value px-3 py-2 text-slate-600">{d.n}</td>
                    <td className="data-value px-3 py-2 text-navy-900">{pct(d.meanPredicted, 1)}</td>
                    <td className="data-value px-3 py-2 text-slate-600">{d.meanError.toFixed(2)}</td>
                    <td className="data-value px-3 py-2 text-slate-600">{d.flagged}</td>
                    <td className="px-3 py-2">
                      {d.precision === null ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <Badge tone={d.precision >= 0.75 ? 'low' : d.precision >= 0.5 ? 'moderate' : 'critical'}>
                          {Math.round(d.precision * 100)}%
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!byDay.length && (
              <p className="mt-3 text-[12px] text-slate-500">No rows returned for {subjectName}.</p>
            )}
          </div>
        </Panel>

        <Panel className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionTitle
              eyebrow="Held-out evaluation"
              title="Temporal test split"
              subtitle={`Report generated ${EVAL_GENERATED_AT.slice(0, 10)} - transcribed from the ML evaluation report.`}
            />
            <Button variant="ghost" onClick={() => setShowFull((v) => !v)}>
              {showFull ? 'Hide detail' : 'Show detail'}
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="ROC AUC" value={num(TEMPORAL_TEST.roc_auc, 3)} tone="calm" />
            <Stat label="PR AUC" value={num(TEMPORAL_TEST.pr_auc, 3)} tone="calm" />
            <Stat label="Brier" value={num(TEMPORAL_TEST.brier_score, 3)} />
            <Stat label="ECE" value={num(TEMPORAL_TEST.ece, 3)} />
          </div>

          <div className="mt-3 space-y-1.5 text-[12px] text-slate-600">
            <p className="flex gap-2">
              <IconCheck width={14} height={14} className="mt-0.5 shrink-0 text-teal-500" />
              Precision {metric(TEMPORAL_TEST.precision)} / recall {metric(TEMPORAL_TEST.recall)} at the operating
              threshold, F1 {metric(TEMPORAL_TEST.f1)}.
            </p>
            <p className="flex gap-2">
              <IconFile width={14} height={14} className="mt-0.5 shrink-0 text-blue-500" />
              {TEMPORAL_TEST.n_samples.toLocaleString()} held-out samples, positive rate{' '}
              {pct(TEMPORAL_TEST.pos_rate, 2)}.
            </p>
            <p className="flex gap-2">
              <IconAlert width={14} height={14} className="mt-0.5 shrink-0 text-amber-500" />
              A low ECE means stated probabilities are trustworthy; a modest PR AUC means ranking is useful but not
              decisive at long lead times.
            </p>
          </div>

          {showFull && (
            <div className="mt-3 no-scrollbar max-h-64 overflow-auto rounded-lg border border-ice-200">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead className="sticky top-0 bg-ice-25">
                  <tr className="border-b border-ice-200 text-[9px] uppercase tracking-wider text-slate-500">
                    <th className="px-2.5 py-2">Day</th>
                    <th className="px-2.5 py-2">ROC</th>
                    <th className="px-2.5 py-2">PR</th>
                    <th className="px-2.5 py-2">Brier</th>
                    <th className="px-2.5 py-2">ECE</th>
                    <th className="px-2.5 py-2">F1</th>
                    <th className="px-2.5 py-2">n</th>
                  </tr>
                </thead>
                <tbody>
                  {LEAD_DAY_STATS.map((s) => (
                    <tr
                      key={s.lead_day}
                      className={`border-b border-ice-50 last:border-0 ${s.lead_day === leadDay ? 'bg-blue-50/70' : ''}`}
                    >
                      <td className="data-value px-2.5 py-1.5 font-bold text-navy-800">D{s.lead_day}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-600">{metric(s.roc_auc)}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-600">{metric(s.pr_auc)}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-600">{metric(s.brier_score)}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-600">{metric(s.ece)}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-600">{metric(s.f1)}</td>
                      <td className="data-value px-2.5 py-1.5 text-slate-500">{s.n_samples.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>

      <section className="mb-5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
            Raw verification record
            <InfoTip text="Every row is what /history returned for this region. Blank panels mean empty history, never invented values." />
          </h2>
          <span className="text-[11px] font-semibold text-slate-500">{points.data?.length ?? 0} records</span>
        </div>
        <AsyncSection
          state={points}
          skeleton={<TableSkeleton rows={6} />}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No verification records."
          emptyDescription="Nothing was returned for this region - the table stays empty rather than being padded with sample rows."
        >
          {(data) => (
            <div className="panel overflow-hidden">
              <div className="no-scrollbar max-h-96 overflow-auto">
                <table className="w-full border-collapse text-left text-[12px]">
                  <thead className="sticky top-0 z-10 bg-ice-25">
                    <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2.5">Valid time (UTC)</th>
                      <th className="px-3 py-2.5">Lead day</th>
                      <th className="px-3 py-2.5">Predicted bust prob.</th>
                      <th className="px-3 py-2.5">Realised error</th>
                      <th className="px-3 py-2.5">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p, i) => (
                      <tr key={`${p.valid_time}-${i}`} className="border-b border-ice-50 last:border-0 hover:bg-ice-50">
                        <td className="data-value px-4 py-2 text-slate-600">{formatUtc(p.valid_time)}</td>
                        <td className="data-value px-3 py-2 font-semibold text-navy-800">D{p.lead_day}</td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2">
                            <span className="relative h-2 w-24 overflow-hidden rounded-full bg-ice-100">
                              <span
                                className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                                style={{ width: `${p.predicted_bust_probability * 100}%` }}
                              />
                            </span>
                            <span className="data-value text-slate-700">{pct(p.predicted_bust_probability)}</span>
                          </span>
                        </td>
                        <td className="data-value px-3 py-2 text-slate-600">{p.actual_error.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <Badge tone={p.was_bust ? 'critical' : 'low'}>{p.was_bust ? 'BUST' : 'no bust'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AsyncSection>
      </section>

      {!points.data?.length && !points.loading && !points.error && (
        <EmptyState
          title="Nothing verified yet for this region."
          description="Pick another region, or switch the application to demo mode to exercise the module."
        />
      )}

      <RegionDrawer />
    </>
  );
}
