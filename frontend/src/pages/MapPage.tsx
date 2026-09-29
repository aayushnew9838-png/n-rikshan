import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ConfidenceMap, type LayerMetric } from '../components/map/ConfidenceMap';
import { RiskRanking } from '../components/intelligence/RiskRanking';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { Button, SectionTitle, Stat, InfoTip, SegmentedControl } from '../components/ui/primitives';
import { BackendBanner, MapSkeleton, SkeletonPanel, EmptyState } from '../components/ui/states';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useMapMetrics } from '../hooks/useMapMetrics';
import { useAppStore } from '../store/useAppStore';
import { IconEye, IconStar, IconStarFilled } from '../components/ui/icons';
import type { MapLayer } from '../types';
import { cn } from '../utils/cn';

const LAYERS: { value: MapLayer; label: string }[] = [
  { value: 'confidence', label: 'Confidence' },
  { value: 'bust', label: 'Bust probability' },
  { value: 'risk_heat', label: 'Risk heat' },
  { value: 'disagreement', label: 'Model spread' },
  { value: 'error', label: 'Forecast error' },
];

const LAYER_COPY: Record<MapLayer, string> = {
  confidence: 'Regional forecast confidence for the selected lead day. Cool tones are reliable; warm tones are not.',
  bust: 'Calibrated probability that the forecast will realise a large error.',
  risk_heat: 'Bust probability rendered as a soft heat field — use it to spot spatial clusters.',
  disagreement:
    'Normalised magnitude of multi-model spread features in the model\'s own SHAP top drivers (real model output, requires N predictions).',
  error: 'Mean realised absolute forecast error from the verification history at each location.',
};

export default function MapPage() {
  const { leadDay, isDemo, map, risk, reloadAll } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { mapLayer, setMapLayer, selectRegion, selectedRegionId, watchlist, toggleWatchlist, regions } = useAppStore();
  const { metrics, loading: metricsLoading } = useMapMetrics(mapLayer, map.data?.regions ?? [], leadDay);

  const layerAvailable = mapLayer === 'confidence' || mapLayer === 'bust' || mapLayer === 'risk_heat' || Boolean(metrics);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Forecast Confidence Map"
        description="The national picture of forecast reliability. Click any region to open its intelligence drawer."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls showThresholds showLayer />}
      />

      <div className="mb-4">
        {isDemo ? (
          <BackendBanner mode="demo" onRetry={retry} />
        ) : (
          <BackendBanner mode="live" onEnableDemo={enableDemo} onRetry={retry} notes={map.data?.notes} />
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl ariaLabel="Map layer" options={LAYERS} value={mapLayer} onChange={setMapLayer} />
        <p className="max-w-2xl text-[12px] leading-relaxed text-slate-500">{LAYER_COPY[mapLayer]}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <section className="min-w-0" aria-label="Confidence map">
          <AsyncSection state={map} skeleton={<div className="h-[560px]"><MapSkeleton /></div>} className="min-h-[560px]">
            {(data) =>
              layerAvailable ? (
                <div className="relative">
                  <ConfidenceMap
                    regions={data.regions}
                    layer={mapLayer}
                    selectedId={selectedRegionId}
                    onSelect={selectRegion}
                    metrics={metrics}
                    metricLabel={metricsLoading ? 'Loading derived layer…' : undefined}
                    height={560}
                  />
                  {metricsLoading && (
                    <div className="absolute left-1/2 top-1/2 z-[700] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-ice-200 bg-white/95 px-4 py-2.5 text-xs font-semibold text-navy-800 shadow-lift">
                      Computing derived layer across {data.regions.length} regions…
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-[560px]">
                  <ConfidenceMap regions={data.regions} layer="confidence" selectedId={selectedRegionId} onSelect={selectRegion} height={560} />
                  <div className="absolute inset-x-4 top-1/2 z-[700] -translate-y-1/2 rounded-xl border border-ice-200 bg-white/96 p-5 text-center shadow-lift backdrop-blur">
                    <p className="text-sm font-semibold text-navy-900">Derived layer unavailable</p>
                    <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                      {LAYER_COPY[mapLayer]} The backend did not return enough data to build it, so no values are shown
                      rather than inventing any.
                    </p>
                    <Button className="mt-3" variant="secondary" onClick={() => setMapLayer('confidence')}>
                      Show confidence layer
                    </Button>
                  </div>
                </div>
              )
            }
          </AsyncSection>
        </section>

        <aside className="flex min-w-0 flex-col gap-4">
          <AsyncSection state={map} skeleton={<SkeletonPanel lines={3} />}>
            {(data) => (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Regions plotted" value={data.total} animate />
                <Stat
                  label="High risk"
                  value={data.high_risk_count}
                  tone={data.high_risk_count ? 'risk' : 'calm'}
                  animate
                  sub={`Day ${leadDay}`}
                />
              </div>
            )}
          </AsyncSection>

          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-navy-900">
                Ranked risk
                <InfoTip text="Regions sorted by calibrated bust probability for the selected lead day." />
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Day {leadDay}</span>
            </div>
            <AsyncSection
              state={risk}
              skeleton={<SkeletonPanel lines={6} />}
              isEmpty={(d) => d.length === 0}
              emptyTitle="No high-risk regions detected for the selected lead time."
              emptyDescription="Lower the risk threshold or move the lead-day slider to inspect another horizon."
            >
              {(data) => (
                <RiskRanking items={data} onSelect={selectRegion} selectedId={selectedRegionId} limit={12} />
              )}
            </AsyncSection>
          </section>

          <section className="panel p-4">
            <h2 className="mb-3 text-sm font-bold text-navy-900">Watchlist</h2>
            {regions.length === 0 ? (
              <p className="text-xs text-slate-500">Region catalogue still loading…</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {regions.slice(0, 40).map((r) => {
                  const watched = watchlist.includes(r.region_id);
                  return (
                    <button
                      key={r.region_id}
                      onClick={() => toggleWatchlist(r.region_id)}
                      aria-pressed={watched}
                      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                      className={cn(
                        'flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition',
                        watched
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-ice-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700',
                      )}
                    >
                      {watched ? <IconStarFilled width={11} height={11} /> : <IconStar width={11} height={11} />}
                      {r.name}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3 border-t border-ice-100 pt-3">
              <Button
                variant="ghost"
                className="!px-0 !text-[11px]"
                onClick={() => setMapLayer(mapLayer === 'confidence' ? 'bust' : 'confidence')}
              >
                <IconEye width={13} height={13} /> Toggle layer
              </Button>
            </div>
          </section>

          <AsyncSection state={map} skeleton={<SkeletonPanel lines={2} />}>
            {(data) =>
              data.notes.length ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-800">
                  {data.notes.map((n) => (
                    <p key={n}>• {n}</p>
                  ))}
                </div>
              ) : null
            }
          </AsyncSection>
        </aside>
      </div>

      <RegionDrawer />
    </>
  );
}
