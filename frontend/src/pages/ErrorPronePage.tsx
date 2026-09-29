import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { RiskRanking } from '../components/intelligence/RiskRanking';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { BackendBanner, ChartSkeleton, SkeletonPanel } from '../components/ui/states';
import { Stat, Badge, SectionTitle, InfoTip, Button } from '../components/ui/primitives';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useMapMetrics } from '../hooks/useMapMetrics';
import { useAppStore } from '../store/useAppStore';
import { useAsync } from '../hooks/useAsync';
import {
  DEMO_FORCED,
  demoHistory,
  demoRegionDetails,
  getHistoricalAnalogues,
  getRegionDetails,
} from '../services/api';
import { mapConcurrent } from '../utils/async';
import { confidenceColor, confidenceLabel, riskLabel } from '../utils/risk';
import { IconActivity, IconArrowRight, IconRefresh } from '../components/ui/icons';

interface ErrorProneRow {
  region_id: string;
  name: string;
  admin1?: string;
  lead_day: number;
  confidence: number;
  bust_probability: number;
  meanError: number;
  samples: number;
  topDriver: string;
}

export default function ErrorPronePage() {
  const { leadDay, isDemo, map, risk } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { selectRegion, selectedRegionId, mode, backendState } = useAppStore();
  const [limit, setLimit] = useState(12);

  const useLive = !isDemo && !DEMO_FORCED;
  const regions = map.data?.regions ?? [];
  const { metrics, loading: metricsLoading, label: metricLabel } = useMapMetrics('error', regions, leadDay);

  const rows = useAsync(async () => {
    const candidates = [...(map.data?.regions ?? [])]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, limit);

    const out: ErrorProneRow[] = [];
    await mapConcurrent(candidates, 4, async (r) => {
      const [history, analysis] = await Promise.all([
        useLive ? getHistoricalAnalogues(r.region_id, 30) : Promise.resolve(demoHistory(r.region_id, 30)),
        useLive ? getRegionDetails(r.region_id, leadDay) : Promise.resolve(demoRegionDetails(r.region_id, leadDay)),
      ]);
      const meanError = history.length ? history.reduce((s, h) => s + h.actual_error, 0) / history.length : 0;
      out.push({
        region_id: r.region_id,
        name: r.name,
        admin1: r.admin1,
        lead_day: r.lead_day,
        confidence: r.confidence,
        bust_probability: r.bust_probability,
        meanError,
        samples: history.length,
        topDriver: analysis.reasons[0]?.feature ?? analysis.plain_reasons[0] ?? 'no dominant driver',
      });
    });
    return out.sort((a, b) => b.meanError - a.meanError);
  }, [limit, leadDay, useLive, isDemo]);

  const ranked = useMemo(() => (risk.data ?? []).slice(0, 20), [risk.data]);
  const worstConfidence = rows.data?.[0];
  const totalSamples = rows.data?.reduce((s, r) => s + r.samples, 0) ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Error-Prone Areas"
        description="Locations where the medium-range forecast has historically realised the largest errors, and where the current run is least trustworthy."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls showThresholds />}
        actions={
          <Button variant="secondary" onClick={() => rows.reload()}>
            <IconRefresh width={15} height={15} /> Recompute
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

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Regions screened" value={regions.length} animate />
        <Stat label="Verification samples" value={totalSamples} animate sub="across screened regions" />
        <Stat
          label="Mean realised error"
          value={rows.data ? (rows.data.reduce((s, r) => s + r.meanError, 0) / (rows.data.length || 1)).toFixed(2) : '-'}
          sub={metricLabel ?? 'leading weather variable'}
          tone={rows.data && rows.data[0]?.meanError > 3 ? 'risk' : 'default'}
        />
        <Stat
          label={`Weakest region (day ${leadDay})`}
          value={worstConfidence?.confidence ?? '-'}
          suffix={worstConfidence ? '%' : undefined}
          sub={worstConfidence?.name}
          tone="risk"
        />
      </div>

      <section className="mb-5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
            <IconActivity width={16} height={16} className="text-blue-600" />
            Realised historical error by region
            <InfoTip text="Mean absolute forecast error computed from the verification history returned by /history. Missing history is reported as zero samples, never as an invented value." />
          </h2>
          <div className="flex items-center gap-3">
            {metricsLoading && (
              <span className="text-[11px] font-semibold text-amber-600">Aggregating history…</span>
            )}
            <div className="flex gap-1.5">
              {[8, 12, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setLimit(n)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition ${
                    limit === n
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-ice-200 bg-white text-slate-500 hover:border-blue-200'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AsyncSection
          state={rows}
          skeleton={<ChartSkeleton height={280} />}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No verification history for these regions."
          emptyDescription="The reference dataset has not been loaded for this deployment, so no error statistics are shown."
        >
          {(data) => {
            const max = Math.max(1, ...data.map((r) => r.meanError));
            return (
              <div className="panel p-4">
                <div className="space-y-2">
                  {data.map((r) => (
                    <button
                      key={r.region_id}
                      onClick={() => selectRegion(r.region_id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-ice-100 bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-ice-50"
                    >
                      <span className="w-6 shrink-0 text-center text-[11px] font-bold text-slate-400">
                        {data.indexOf(r) + 1}
                      </span>
                      <span className="w-44 shrink-0 truncate text-[13px] font-semibold text-navy-900">{r.name}</span>
                      <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-ice-100">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${(r.meanError / max) * 100}%`,
                            background: r.meanError > max * 0.66 ? '#ef9455' : '#5aa8e4',
                          }}
                        />
                      </span>
                      <span className="data-value w-16 shrink-0 text-right text-[12px] font-bold text-navy-900">
                        {r.meanError.toFixed(2)}
                      </span>
                      <span className="hidden w-40 shrink-0 truncate text-[11px] text-slate-500 sm:block">
                        n={r.samples}
                      </span>
                      <span className="hidden shrink-0 lg:block">
                        <Badge tone={r.confidence >= 60 ? 'low' : r.confidence >= 40 ? 'moderate' : 'critical'}>
                          {r.confidence}%
                        </Badge>
                      </span>
                      <IconArrowRight width={14} height={14} className="shrink-0 text-slate-300" />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                  Bar length is the mean absolute forecast error from historical verification for that location; it is
                  not a model prediction. Driver shown in the drawer is SHAP-derived model output.
                </p>
              </div>
            );
          }}
        </AsyncSection>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle
            title="Lowest current confidence"
            subtitle={`Ranked for day ${leadDay} using the calibrated bust probability of the current run.`}
          />
          <div className="mt-3">
            <AsyncSection
              state={risk}
              skeleton={<SkeletonPanel lines={7} />}
              isEmpty={() => ranked.length === 0}
              emptyTitle="No regions ranked for this lead day."
            >
              {() => (
                <RiskRanking
                  items={ranked.map((r) => ({
                    region_id: r.region_id,
                    name: r.name,
                    admin1: r.admin1,
                    lead_day: r.lead_day,
                    bust_probability: r.bust_probability,
                    confidence: r.confidence,
                  }))}
                  onSelect={selectRegion}
                  selectedId={selectedRegionId}
                  limit={20}
                />
              )}
            </AsyncSection>
          </div>
        </div>

        <div>
          <SectionTitle
            title="Derived error layer"
            subtitle="Feed the realised error back onto the national map."
          />
          <div className="mt-3 panel p-4">
            {metricsLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ) : metrics ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-navy-800">{metricLabel}</span>
                  <Badge tone="neutral">{Object.keys(metrics).length} regions</Badge>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(metrics)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([id, v]) => {
                      const region = regions.find((r) => r.region_id === id);
                      return (
                        <div key={id} className="flex items-center gap-3">
                          <button
                            onClick={() => selectRegion(id)}
                            className="w-40 truncate text-left text-[12px] font-medium text-navy-800 hover:text-blue-600"
                          >
                            {region?.name ?? id}
                          </button>
                          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ice-100">
                            <span
                              className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                              style={{ width: `${Math.max(3, v * 100)}%` }}
                            />
                          </span>
                          <span className="data-value w-12 text-right text-[11px] font-bold text-slate-500">
                            {v.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" onClick={() => useAppStore.getState().setMapLayer('error')}>
                    Open on map
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[12px] leading-relaxed text-slate-500">
                The derived error layer could not be computed for this deployment — the history endpoint returned no
                usable samples. No synthetic values are substituted.
              </p>
            )}
          </div>

          <div className="mt-3 panel p-4">
            <div className="eyebrow mb-2">Confidence legend</div>
            <div className="flex flex-wrap gap-2.5 text-[11px] font-semibold text-slate-600">
              {[
                { c: 88, l: 'High' },
                { c: 70, l: 'Moderate' },
                { c: 50, l: 'Low' },
                { c: 30, l: 'Very low' },
              ].map((b) => (
                <span key={b.l} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded" style={{ background: confidenceColor(b.c), opacity: 0.55 }} />
                  {b.l} ({b.c}% = {confidenceLabel(b.c)})
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Selected region: {selectedRegionId ?? 'none'} - day {leadDay} - risk band{' '}
              {ranked[0] ? riskLabel(ranked[0].bust_probability) : 'n/a'}.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Source mode: {mode} / backend {backendState}.
            </p>
          </div>
        </div>
      </section>

      <RegionDrawer />
    </>
  );
}
