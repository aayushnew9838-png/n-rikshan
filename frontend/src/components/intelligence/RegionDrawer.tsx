import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegionInfo } from '../../types';
import { VARIABLES } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAsync } from '../../hooks/useAsync';
import { getHistoricalAnalogues, getRegionDetails } from '../../services/api';
import { ConfidenceRing, Badge, Button, InfoTip } from '../ui/primitives';
import { DrawerSkeleton, EmptyState, ErrorState } from '../ui/states';
import { ExplainabilityPanel } from '../intelligence/ExplainabilityPanel';
import { IconX, IconStar, IconStarFilled, IconArrowRight, IconBulb, IconHistory } from '../ui/icons';
import { confidenceLabel, riskLabel } from '../../utils/risk';
import { pct } from '../../utils/format';
import { cn } from '../../utils/cn';

export function RegionDrawer() {
  const navigate = useNavigate();
  const {
    selectedRegionId,
    setDrawerOpen,
    selectRegion,
    leadDay,
    variable,
    regions,
    watchlist,
    toggleWatchlist,
    acknowledgeAlert,
  } = useAppStore();

  const open = Boolean(selectedRegionId);
  const region: RegionInfo | undefined = regions.find((r) => r.region_id === selectedRegionId);

  const analysis = useAsync(
    async () => {
      if (!selectedRegionId) return null;
      return getRegionDetails(selectedRegionId, leadDay);
    },
    [selectedRegionId, leadDay],
  );

  const history = useAsync(
    async () => {
      if (!selectedRegionId) return [];
      return getHistoricalAnalogues(selectedRegionId, 12);
    },
    [selectedRegionId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setDrawerOpen(false);
        selectRegion(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setDrawerOpen, selectRegion]);

  const close = () => {
    setDrawerOpen(false);
    selectRegion(null);
  };

  const watched = selectedRegionId ? watchlist.includes(selectedRegionId) : false;
  const varMeta = VARIABLES.find((v) => v.key === variable);

  return (
    <>
      {/* scrim */}
      <div
        className={cn(
          'fixed inset-0 z-[700] bg-navy-950/30 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="false"
        aria-label={region ? `${region.name} forecast reliability` : 'Region intelligence'}
        className={cn(
          'fixed inset-y-0 right-0 z-[750] flex w-full max-w-[440px] flex-col border-l border-ice-200 bg-ice-50 shadow-2xl transition-transform duration-300 ease-smooth',
          'lg:top-[60px] lg:h-[calc(100%-60px)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-ice-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="eyebrow">Forecast reliability</div>
            <h2 className="truncate text-lg font-bold tracking-tight text-navy-900">
              {(region?.name ?? selectedRegionId ?? '').toUpperCase()}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="data-value font-semibold text-blue-700">DAY {leadDay}</span>
              <span>·</span>
              <span>{varMeta?.label ?? variable}</span>
              {region?.admin1 && (
                <>
                  <span>·</span>
                  <span>{region.admin1}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => selectedRegionId && toggleWatchlist(selectedRegionId)}
              aria-pressed={watched}
              title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
              className={cn(
                'rounded-lg p-2 transition-colors',
                watched ? 'text-amber-500' : 'text-slate-400 hover:bg-ice-100 hover:text-navy-900',
              )}
            >
              {watched ? <IconStarFilled width={17} height={17} /> : <IconStar width={17} height={17} />}
            </button>
            <button
              onClick={close}
              aria-label="Close region intelligence"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-ice-100 hover:text-navy-900"
            >
              <IconX />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {analysis.loading && <DrawerSkeleton />}

          {analysis.error && !analysis.data && (
            <ErrorState
              title={analysis.unavailable ? 'Forecast intelligence temporarily unavailable.' : 'Region analysis failed.'}
              description={analysis.error.message}
              onRetry={analysis.reload}
            />
          )}

          {analysis.data && (
            <div className="space-y-4 animate-fadeIn">
              {/* headline ------------------------------------------------- */}
              <div className="panel flex items-center gap-4 p-4">
                <ConfidenceRing value={analysis.data.confidence} size={94} />
                <div className="min-w-0 flex-1">
                  <div className="eyebrow">Bust probability</div>
                  <div className="data-value text-3xl font-bold leading-none text-risk-critical">
                    {Math.round(analysis.data.bust_probability * 100)}
                    <span className="text-lg">%</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={analysis.data.confidence >= 60 ? 'blue' : analysis.data.confidence >= 40 ? 'high' : 'critical'}>
                      {confidenceLabel(analysis.data.confidence)} confidence
                    </Badge>
                    <Badge tone={analysis.data.bust_probability >= 0.5 ? 'high' : 'low'}>
                      Risk {riskLabel(analysis.data.bust_probability)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-500">
                    {analysis.data.confidence >= 80
                      ? 'Forecast models agree strongly in this region.'
                      : analysis.data.confidence >= 60
                        ? 'Acceptable reliability with minor inter-model divergence.'
                        : analysis.data.confidence >= 40
                          ? 'Elevated model spread or rapid synoptic change — exercise caution.'
                          : 'Severe model disagreement or historically high-bust regime.'}
                  </p>
                </div>
              </div>

              {/* summary -------------------------------------------------- */}
              <div className="panel p-4">
                <div className="eyebrow mb-2">Forecast summary</div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                  <Row k="Selected variable" v={varMeta?.label ?? variable} />
                  <Row k="Risk score" v={`${Math.round(analysis.data.bust_probability * 100)} / 100`} />
                  <Row k="Lead time" v={`Day ${leadDay} (${(analysis.data.lead_hours ?? leadDay * 24)} h)`} />
                  <Row k="Model version" v={analysis.data.model_version ?? '—'} mono />
                  <Row
                    k="Historical bust frequency"
                    v={analysis.data.historical_analogs ? pct(analysis.data.historical_analogs.historical_bust_rate) : history.data?.length ? `${history.data.filter((h) => h.was_bust).length}/${history.data.length}` : '—'}
                  />
                  <Row k="Status" v={confidenceLabel(analysis.data.confidence)} />
                </dl>

                {analysis.data.variable_bust_probabilities && (
                  <div className="mt-3 border-t border-ice-100 pt-3">
                    <div className="eyebrow mb-2">Variable-wise bust probability</div>
                    <div className="space-y-1.5">
                      {VARIABLES.map((v) => {
                        const p = analysis.data?.variable_bust_probabilities?.[v.key];
                        if (p === undefined) return null;
                        return (
                          <div key={v.key} className="flex items-center gap-2">
                            <span className="w-32 shrink-0 truncate text-[11px] text-slate-500">{v.label}</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ice-100">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${p * 100}%`,
                                  background: p >= 0.75 ? '#dd5145' : p >= 0.5 ? '#ef9455' : p >= 0.25 ? '#f2c14e' : '#7ec8e8',
                                }}
                              />
                            </div>
                            <span className="data-value w-9 text-right text-[11px] font-semibold text-navy-800">
                              {Math.round(p * 100)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* WHY ------------------------------------------------------ */}
              <div className="panel p-4">
                <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-navy-900">
                  <IconBulb width={16} height={16} className="text-blue-500" />
                  Why?
                  <InfoTip text="Top SHAP feature contributions for this exact prediction." />
                </h3>
                <ol className="space-y-2">
                  {analysis.data.plain_reasons.length ? (
                    analysis.data.plain_reasons.slice(0, 4).map((reason, i) => (
                      <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-600">
                        <span className="data-value mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ice-100 text-[10px] font-bold text-blue-600">
                          {i + 1}
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-[12.5px] text-slate-500">No reasons were returned for this prediction.</li>
                  )}
                </ol>

                {analysis.data.reasons.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-ice-100 pt-3">
                    {analysis.data.reasons.slice(0, 3).map((r) => (
                      <div key={r.feature} className="flex items-center gap-2">
                        <span className="w-40 shrink-0 truncate font-mono text-[10px] text-slate-500">{r.feature}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ice-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                            style={{
                              width: `${
                                (Math.abs(r.contribution) /
                                  Math.max(0.001, ...analysis.data!.reasons.map((x) => Math.abs(x.contribution)))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="data-value w-12 text-right text-[10px] font-bold text-risk-critical">
                          {r.contribution >= 0 ? '+' : ''}
                          {r.contribution.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* similar cases ------------------------------------------- */}
              <div className="panel p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-navy-900">
                  <IconHistory width={16} height={16} className="text-blue-500" />
                  Similar historical cases
                </h3>
                {analysis.data.historical_analogs ? (
                  <>
                    <p className="text-[13px] font-semibold text-navy-800">
                      {analysis.data.historical_analogs.n_analogs} similar situations ·{' '}
                      <span className="text-risk-critical">
                        {Math.round(analysis.data.historical_analogs.historical_bust_rate * 100)}% resulted in large
                        forecast error
                      </span>
                    </p>
                    {analysis.data.historical_analogs.summary_statement && (
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
                        {analysis.data.historical_analogs.summary_statement}
                      </p>
                    )}
                  </>
                ) : history.loading ? (
                  <p className="text-xs text-slate-500">Loading verification history…</p>
                ) : history.data && history.data.length ? (
                  <p className="text-[13px] text-slate-600">
                    {history.data.filter((h) => h.was_bust).length} of {history.data.length} verified historical
                    forecasts busted at this location.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">No historical analogues available for this region.</p>
                )}
              </div>

              {/* actions --------------------------------------------------- */}
              <div className="flex gap-2 pb-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    const id = selectedRegionId;
                    close();
                    navigate(`/explainability?region=${encodeURIComponent(id ?? '')}&day=${leadDay}`);
                  }}
                >
                  View full analysis <IconArrowRight width={15} height={15} />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => selectedRegionId && acknowledgeAlert(`LIVE_${selectedRegionId}_${leadDay}`)}
                  title="Mark this region as reviewed"
                >
                  Mark reviewed
                </Button>
              </div>
            </div>
          )}

          {!analysis.data && !analysis.loading && !analysis.error && (
            <EmptyState title="Select a region on the map" description="Click any marker to open its intelligence panel." />
          )}
        </div>
      </aside>
    </>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
      <dd className={cn('mt-0.5 font-semibold text-navy-800', mono && 'data-value')}>{v}</dd>
    </div>
  );
}
