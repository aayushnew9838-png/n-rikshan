import { Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ConfidenceStrip } from '../components/forecast/ConfidenceStrip';
import { ConfidenceMap } from '../components/map/ConfidenceMap';
import { RiskRanking } from '../components/intelligence/RiskRanking';
import { AlertPanel } from '../components/intelligence/AlertPanel';
import { Stat, Button, InfoTip } from '../components/ui/primitives';
import { StatusBanner, MapSkeleton, SkeletonPanel, ChartSkeleton } from '../components/ui/states';
import { Reveal } from '../components/motion/Reveal';
import { useForecastData, useShell } from '../hooks/useForecastData';
import { useAppStore } from '../store/useAppStore';
import { riskColor, riskLabel } from '../utils/risk';
import type { ReliabilityCell } from '../types';
import { IconTarget, IconAlert, IconActivity, IconArrowRight, IconGrid } from '../components/ui/icons';

const AtmosphereGlobe = lazy(() =>
  import('../components/three/AtmosphereGlobe').then((m) => ({ default: m.AtmosphereGlobe })),
);

const BANDS = [
  { key: 'critical', label: 'Critical', hint: '75%+', color: riskColor(0.85), min: 0.75, max: 1 },
  { key: 'high', label: 'High', hint: '50–74%', color: riskColor(0.6), min: 0.5, max: 0.75 },
  { key: 'moderate', label: 'Moderate', hint: '25–49%', color: riskColor(0.35), min: 0.25, max: 0.5 },
  { key: 'low', label: 'Low', hint: '<25%', color: riskColor(0.1), min: 0, max: 0.25 },
];

export default function Dashboard() {
  const { leadDay, overview, map, dayWise, risk, alerts, reloadAll } = useForecastData();
  const { retry } = useShell();
  const { selectRegion, selectedRegionId, acknowledgeAlert, toggleWatchlist, regions, setRegions, mapLayer, setLeadDay, acknowledged } =
    useAppStore();

  const cells = dayWise.data?.cells ?? [];

  /** Strip subject: selected region if any, otherwise network mean per day. */
  const stripCells: (ReliabilityCell & { label?: string })[] = (() => {
    if (selectedRegionId) {
      const mine = cells.filter((c) => c.region_id === selectedRegionId).sort((a, b) => a.lead_day - b.lead_day);
      if (mine.length) return mine;
    }
    const days = dayWise.data?.days ?? Array.from({ length: 10 }, (_, i) => i + 1);
    return days.map((d) => {
      const day = cells.filter((c) => c.lead_day === d);
      const conf = day.length ? Math.round(day.reduce((s, c) => s + c.confidence, 0) / day.length) : 0;
      const bust = day.length ? day.reduce((s, c) => s + c.bust_probability, 0) / day.length : 0;
      return {
        region_id: 'MEAN',
        lead_day: d,
        confidence: conf,
        bust_probability: Math.round(bust * 1000) / 1000,
        confidence_category: 'HIGH_CONFIDENCE' as const,
        bust_risk: 'low' as const,
      };
    });
  })();

  const selectedName =
    (selectedRegionId && (regions.find((r) => r.region_id === selectedRegionId)?.name ?? selectedRegionId)) || null;

  const globeMarkers = useMemo(
    () =>
      (map.data?.regions ?? []).map((r) => ({
        region_id: r.region_id,
        name: r.name,
        lat: r.lat,
        lon: r.lon,
        bust_probability: r.bust_probability,
        confidence: r.confidence,
      })),
    [map.data],
  );

  const bandCounts = useMemo(() => {
    const list = map.data?.regions ?? [];
    return BANDS.map((b) => ({
      ...b,
      count: list.filter((r) => r.bust_probability >= b.min && r.bust_probability < b.max).length,
    }));
  }, [map.data]);

  const bandMax = Math.max(1, ...bandCounts.map((b) => b.count));
  const openAlerts = (alerts.data ?? []).filter((a) => !acknowledged.includes(a.id)).length;

  return (
    <>
      <div className="nrk-aurora mb-4 h-[3px] rounded-full opacity-70" aria-hidden="true" />

      <PageHeader
        eyebrow="Operations"
        title="Forecast Reliability Dashboard"
        description="Where, when and why medium-range forecasts are likely to fail. Select a region on the map to open its full intelligence panel."
        actions={
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/explainability">
              <Button variant="secondary">Explainability</Button>
            </Link>
            <Link to="/lead-time">
              <Button variant="primary">Day 1–10 matrix</Button>
            </Link>
          </div>
        }
        controls={<ForecastControls showThresholds showLayer />}
      />

      <StatusBanner className="mb-4" notes={map.data?.notes} onRetry={retry} />

      {/* --------------------------------------------------- map + summary */}
      <Reveal delay={40}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
          <section aria-label="India confidence map" className="min-w-0">
            <AsyncSection state={map} skeleton={<MapSkeleton />} className="min-h-[520px]">
              {(data) => (
                <div className="relative">
                  <ConfidenceMap
                    regions={data.regions}
                    layer={mapLayer}
                    selectedId={selectedRegionId}
                    onSelect={selectRegion}
                    height={540}
                  />
                  <div className="pointer-events-none absolute bottom-6 right-3 z-[600] rounded-lg border border-ice-200 bg-white/92 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-soft backdrop-blur">
                    {data.total} regions · {data.high_risk_count} high risk · Day {leadDay}
                  </div>
                </div>
              )}
            </AsyncSection>
          </section>

          <aside className="flex min-w-0 flex-col gap-4" aria-label="Reliability summary">
            <AsyncSection state={overview} skeleton={<SkeletonPanel lines={4} />}>
              {(data) => (
                <div className="nrk-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Stat
                    label="Forecasts analysed"
                    value={data.stats.forecasts_analysed}
                    sub={`Region × Day ${leadDay} reliability cells`}
                    animate
                    icon={<IconGrid width={15} height={15} />}
                  />
                  <Stat
                    label="High-risk regions"
                    value={data.stats.high_risk_regions}
                    sub="Bust probability ≥ 0.50"
                    tone={data.stats.high_risk_regions > 0 ? 'risk' : 'calm'}
                    animate
                    icon={<IconAlert width={15} height={15} />}
                  />
                  <Stat
                    label="Lowest confidence"
                    value={data.stats.lowest_confidence?.confidence ?? 0}
                    suffix="%"
                    tone="risk"
                    animate
                    sub={data.stats.lowest_confidence ? data.stats.lowest_confidence.region_name : '—'}
                    icon={<IconTarget width={15} height={15} />}
                  />
                  <Stat
                    label="Highest bust probability"
                    value={data.stats.highest_bust_probability ? data.stats.highest_bust_probability.bust_probability * 100 : 0}
                    suffix="%"
                    tone="risk"
                    animate
                    sub={data.stats.highest_bust_probability?.region_name ?? '—'}
                    icon={<IconActivity width={15} height={15} />}
                  />
                </div>
              )}
            </AsyncSection>

            <AsyncSection state={alerts} skeleton={<SkeletonPanel lines={3} />} className="min-h-[220px]">
              {(data) => (
                <section className="panel p-4">
                  <div
                    className={`mb-3 flex items-center justify-between rounded-lg px-2 py-1 ${
                      openAlerts ? 'nrk-sweep bg-amber-50' : ''
                    }`}
                  >
                    <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                      <span className="nrk-dot text-amber-500" aria-hidden="true" />
                      Attention required
                      {openAlerts > 0 && (
                        <span className="data-value rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          <span className="nrk-roll" key={openAlerts}>
                            {openAlerts}
                          </span>
                        </span>
                      )}
                      <InfoTip text="Alerts are derived from the same calibrated probabilities shown on the map." />
                    </h2>
                    <Link to="/alerts" className="text-[11px] font-semibold text-blue-600 hover:underline">
                      All alerts →
                    </Link>
                  </div>
                  <AlertPanel
                    alerts={data}
                    acknowledged={acknowledged}
                    onAcknowledge={acknowledgeAlert}
                    onOpen={selectRegion}
                    onWatch={toggleWatchlist}
                    limit={4}
                  />
                </section>
              )}
            </AsyncSection>
          </aside>
        </div>
      </Reveal>

      {/* --------------------------------------------------------- strip */}
      <Reveal delay={120} className="mt-4">
        <AsyncSection state={dayWise} skeleton={<ChartSkeleton height={140} />}>
          {() => (
            <ConfidenceStrip
              cells={stripCells}
              selectedDay={leadDay}
              onSelectDay={setLeadDay}
              title={selectedName ? `Confidence evolution — ${selectedName}` : 'Confidence evolution — network mean'}
              subtitle="Each day shows confidence %, calibrated bust probability and risk category."
            />
          )}
        </AsyncSection>
      </Reveal>

      {/* ------------------------------------------------- 3D risk field */}
      <Reveal delay={180} className="mt-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
          <section className="panel relative overflow-hidden" aria-label="Three dimensional risk field">
            <header className="flex items-center justify-between border-b border-ice-100 px-4 py-3">
              <div>
                <div className="eyebrow flex items-center gap-2">
                  <span className="nrk-dot text-teal-500" aria-hidden="true" />
                  Regional risk field
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {globeMarkers.length} plotted regions · Day {leadDay}
                </p>
              </div>
              <div className="nrk-orbit h-9 w-9 rounded-full" aria-hidden="true" />
            </header>

            <div className="relative h-[300px] bg-[radial-gradient(circle_at_30%_25%,#ffffff,#f3f9fe)]">
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-2 border-ice-200" />
                    <div className="absolute h-44 w-44 animate-pulseRing rounded-full border border-blue-200" />
                  </div>
                }
              >
                <AtmosphereGlobe
                  markers={globeMarkers}
                  selectedId={selectedRegionId}
                  onSelect={selectRegion}
                  className="absolute inset-0"
                />
              </Suspense>
            </div>

            <footer className="flex flex-wrap items-center gap-3 border-t border-ice-100 px-4 py-2.5 text-[10px] font-semibold text-slate-500">
              {BANDS.map((b) => (
                <span key={b.key} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                  {b.label}
                </span>
              ))}
            </footer>
          </section>

          <section className="panel p-4" aria-labelledby="field-dist">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 id="field-dist" className="text-sm font-bold text-navy-900">
                  Bust probability distribution
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  How many regions sit in each risk band for Day {leadDay}
                </p>
              </div>
              <Link to="/bust-probability">
                <Button variant="ghost" className="!px-2 !py-1 !text-[11px]">
                  Open matrix <IconArrowRight width={13} height={13} />
                </Button>
              </Link>
            </div>

            <AsyncSection state={map} skeleton={<SkeletonPanel lines={4} />}>
              {(data) => (
                <>
                  <div className="space-y-3">
                    {bandCounts.map((b, i) => (
                      <div key={b.key}>
                        <div className="mb-1 flex items-baseline justify-between">
                          <span className="text-[12px] font-semibold text-navy-800">
                            {b.label}
                            <span className="data-value ml-2 text-[10px] font-normal text-slate-400">{b.hint}</span>
                          </span>
                          <span className="data-value text-[13px] font-bold text-navy-900">
                            <span className="nrk-roll" key={`${b.key}-${b.count}`}>
                              {b.count}
                            </span>
                            <span className="ml-1 text-[10px] font-normal text-slate-400">
                              {data.total ? Math.round((b.count / data.total) * 100) : 0}%
                            </span>
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-ice-100">
                          <div
                            className="nrk-bar h-full rounded-full"
                            style={{
                              width: `${Math.max(2, (b.count / bandMax) * 100)}%`,
                              background: b.color,
                              animationDelay: `${i * 90}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ice-100 pt-3">
                    <div className="nrk-float">
                      <div className="eyebrow">Plotted</div>
                      <div className="data-value mt-0.5 text-lg font-bold text-navy-900">
                        <span className="nrk-roll" key={`t-${data.total}`}>
                          {data.total}
                        </span>
                      </div>
                    </div>
                    <div className="nrk-float" style={{ animationDelay: '900ms' }}>
                      <div className="eyebrow">High risk</div>
                      <div className="data-value mt-0.5 text-lg font-bold text-risk-critical">
                        <span className="nrk-roll" key={`h-${data.high_risk_count}`}>
                          {data.high_risk_count}
                        </span>
                      </div>
                    </div>
                    <div className="nrk-float" style={{ animationDelay: '1800ms' }}>
                      <div className="eyebrow">Mean confidence</div>
                      <div className="data-value mt-0.5 text-lg font-bold text-navy-900">
                        <span className="nrk-roll" key={`c-${data.total}`}>
                          {data.regions.length
                            ? Math.round(data.regions.reduce((s, r) => s + r.confidence, 0) / data.regions.length)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                    Bands use the calibrated bust probability for the active lead day. Click a globe marker or a
                    ranking row to open the region dossier.
                  </p>
                </>
              )}
            </AsyncSection>
          </section>
        </div>
      </Reveal>

      {/* --------------------------------------------- risk + error areas */}
      <Reveal delay={240} className="mt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-4" aria-labelledby="top-error">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 id="top-error" className="text-sm font-bold text-navy-900">
                  Top error-prone areas
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Ranked by calibrated bust probability · Day {leadDay}</p>
              </div>
              <Link to="/error-prone">
                <Button variant="ghost" className="!px-2 !py-1 !text-[11px]">
                  Full ranking <IconArrowRight width={13} height={13} />
                </Button>
              </Link>
            </div>
            <AsyncSection
              state={risk}
              skeleton={<SkeletonPanel lines={6} />}
              isEmpty={(d) => d.length === 0}
              emptyTitle="No high-risk regions detected for the selected lead time."
            >
              {(data) => (
                <RiskRanking items={data} onSelect={selectRegion} selectedId={selectedRegionId} limit={8} />
              )}
            </AsyncSection>
          </section>

          <section className="panel p-4" aria-labelledby="degradation">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 id="degradation" className="text-sm font-bold text-navy-900">
                  Where confidence is deteriorating fastest
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Confidence drop between Day {Math.max(1, leadDay - 1)} and Day {leadDay}
                </p>
              </div>
              <Link to="/bust-probability">
                <Button variant="ghost" className="!px-2 !py-1 !text-[11px]">
                  Bust view <IconArrowRight width={13} height={13} />
                </Button>
              </Link>
            </div>
            <AsyncSection
              state={dayWise}
              skeleton={<SkeletonPanel lines={6} />}
              isEmpty={(d) => d.cells.length === 0}
              emptyTitle="No reliability cells available for this lead time."
            >
              {(data) => {
                const prevDay = Math.max(1, leadDay - 1);
                const now = data.cells.filter((c) => c.lead_day === leadDay);
                const before = data.cells.filter((c) => c.lead_day === prevDay);
                const rows = now
                  .map((c) => {
                    const prev = before.find((b) => b.region_id === c.region_id);
                    return {
                      region_id: c.region_id,
                      name: data.regions.find((r) => r.region_id === c.region_id)?.name ?? c.region_id,
                      admin1: data.regions.find((r) => r.region_id === c.region_id)?.admin1,
                      lead_day: c.lead_day,
                      bust_probability: c.bust_probability,
                      confidence: c.confidence,
                      drop: prev ? prev.confidence - c.confidence : 0,
                    };
                  })
                  .filter((r) => r.drop > 0)
                  .sort((a, b) => b.drop - a.drop);

                if (!rows.length) {
                  return (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ice-300 bg-ice-25 px-5 py-10 text-center">
                      <p className="text-sm font-semibold text-navy-900">
                        No confidence deterioration detected between these lead days.
                      </p>
                      <p className="max-w-sm text-xs text-slate-500">
                        This is a valid state — it means reliability is stable across the selected lead-time window.
                      </p>
                    </div>
                  );
                }

                const maxDrop = Math.max(...rows.map((r) => r.drop), 1);
                return (
                  <ol className="nrk-stagger space-y-2">
                    {rows.slice(0, 8).map((r) => (
                      <li key={r.region_id}>
                        <button
                          onClick={() => selectRegion(r.region_id)}
                          className="flex w-full items-center gap-3 rounded-lg border border-ice-200 bg-white px-3 py-2 text-left transition hover:border-blue-300 hover:shadow-soft"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-navy-900">{r.name}</span>
                            <span className="block truncate text-[10px] text-slate-400">{r.admin1}</span>
                          </span>
                          <span className="w-28 shrink-0">
                            <span className="block h-1.5 overflow-hidden rounded-full bg-ice-100">
                              <span
                                className="nrk-bar block h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                                style={{ width: `${(r.drop / maxDrop) * 100}%` }}
                              />
                            </span>
                          </span>
                          <span className="data-value w-20 shrink-0 text-right text-[12px] font-bold text-risk-critical">
                            −{Math.round(r.drop)} pts
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                );
              }}
            </AsyncSection>
          </section>
        </div>
      </Reveal>

      <Reveal delay={300} className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ice-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="nrk-dot text-teal-500" aria-hidden="true" />
            <div>
              <div className="text-[13px] font-bold text-navy-900">Field summary</div>
              <p className="text-[11px] text-slate-500">
                {riskLabel(risk.data?.[0]?.bust_probability ?? 0)} band leading ·{' '}
                <span className="data-value">{alerts.data?.length ?? 0}</span> alerts generated for Day {leadDay}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={reloadAll}>
              Refresh all data
            </Button>
            <Link to="/analytics">
              <Button variant="ghost">Analytics</Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
