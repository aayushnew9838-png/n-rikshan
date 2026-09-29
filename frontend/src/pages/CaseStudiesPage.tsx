import { useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { BackendBanner, SkeletonPanel, EmptyState, TableSkeleton } from '../components/ui/states';
import { Badge, Button, Panel, SectionTitle, InfoTip, Stat, ConfidenceRing } from '../components/ui/primitives';
import { ExplainabilityPanel } from '../components/intelligence/ExplainabilityPanel';
import { HistoricalAnaloguePanel } from '../components/intelligence/HistoricalAnaloguePanel';
import { useShell, useIsDemo } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { DEMO_FORCED, demoCaseStudies, getCaseStudies } from '../services/api';
import { pct, formatUtc, signed, humanizeFeature } from '../utils/format';
import { confidenceLabel, riskColor } from '../utils/risk';
import { IconFile, IconTarget, IconBulb, IconHistory, IconArrowRight } from '../components/ui/icons';

export default function CaseStudiesPage() {
  const isDemo = useIsDemo();
  const { enableDemo, retry } = useShell();
  const useLive = !isDemo && !DEMO_FORCED;
  const [openId, setOpenId] = useState<string | null>(null);

  const cases = useAsync(async () => (useLive ? getCaseStudies() : Promise.resolve(demoCaseStudies())), [useLive]);

  const open = cases.data?.find((c) => c.case_id === openId) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Case Studies"
        description="Documented forecast-bust events with the model's call, its drivers and the analogue set it consulted."
        source={isDemo ? 'demo' : 'live'}
        actions={
          <Button variant="secondary" onClick={() => cases.reload()}>
            <IconFile width={15} height={15} /> Reload
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

      <AsyncSection
        state={cases}
        skeleton={<TableSkeleton rows={5} />}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No case studies published by this backend."
        emptyDescription="The ML service exposes case studies through /case-study/{id}; this deployment returned none."
        showUnavailableAction
        onEnableDemo={enableDemo}
      >
        {(list) => (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Published cases" value={list.length} animate />
              <Stat
                label="Model hit rate"
                value={
                  list.length
                    ? Math.round(
                        (list.filter(
                          (c) => (c.nirikshan_prediction.bust_probability >= 0.5) === Boolean(c.ground_truth_outcome.realized_overall_bust),
                        ).length /
                          list.length) *
                          100,
                      )
                    : '-'
                }
                suffix={list.length ? '%' : undefined}
                sub="correct side of the 50% line"
              />
              <Stat
                label="Mean stated confidence"
                value={
                  list.length
                    ? Math.round(
                        list.reduce((s, c) => s + c.nirikshan_prediction.confidence_score, 0) / list.length,
                      )
                    : '-'
                }
                suffix={list.length ? '%' : undefined}
              />
              <Stat
                label="Mean lead time"
                value={
                  list.length
                    ? Math.round(list.reduce((s, c) => s + c.forecast_timing.lead_hours, 0) / list.length)
                    : '-'
                }
                suffix={list.length ? 'h' : undefined}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {list.map((c) => {
                const isOpen = openId === c.case_id;
                const hit =
                  (c.nirikshan_prediction.bust_probability >= 0.5) === Boolean(c.ground_truth_outcome.realized_overall_bust);
                return (
                  <button
                    key={c.case_id}
                    onClick={() => setOpenId(isOpen ? null : c.case_id)}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                      isOpen
                        ? 'border-blue-400 bg-blue-50/60 shadow-lift'
                        : 'border-ice-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="eyebrow">{c.case_id}</div>
                        <div className="mt-1 truncate text-[15px] font-bold text-navy-900">
                          {c.location.admin1} - {c.location.lat.toFixed(2)}, {c.location.lon.toFixed(2)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {formatUtc(c.forecast_timing.valid_time)} - D{c.forecast_timing.lead_day} (
                          {c.forecast_timing.lead_hours}h)
                        </div>
                      </div>
                      <Badge tone={hit ? 'low' : 'critical'}>{hit ? 'called it' : 'missed'}</Badge>
                    </div>

                    <p className="mt-2.5 line-clamp-3 text-[12px] leading-relaxed text-slate-600">{c.description}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <ConfidenceRing
                        value={Math.round(c.nirikshan_prediction.confidence_score)}
                        size={58}
                        stroke={7}
                        label="conf"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Model bust probability</span>
                          <span className="data-value font-bold text-navy-900">
                            {pct(c.nirikshan_prediction.bust_probability)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ice-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.nirikshan_prediction.bust_probability * 100}%`,
                              background: riskColor(c.nirikshan_prediction.bust_probability),
                            }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Realised outcome</span>
                          <span className="data-value font-bold text-navy-900">
                            {pct(c.ground_truth_outcome.realized_overall_bust)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-ice-100 pt-2.5 text-[11px]">
                      <span className="text-slate-500">
                        {c.explainability.key_risk_drivers.length} drivers -{' '}
                        {c.historical_analogs.n_analogs} analogues
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                        {isOpen ? 'Close' : 'Open dossier'} <IconArrowRight width={12} height={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {open && (
              <section className="mt-6 space-y-4">
                <SectionTitle
                  eyebrow="Dossier"
                  title={`${open.case_id} - ${open.location.admin1}`}
                  subtitle={open.description}
                />

                <div className="grid gap-4 lg:grid-cols-3">
                  <Panel className="p-4">
                    <div className="eyebrow mb-2 flex items-center gap-1.5">
                      <IconTarget width={14} height={14} /> Call
                    </div>
                    <dl className="space-y-2 text-[12px]">
                      {[
                        ['Target', open.ground_truth_outcome.target_definition],
                        ['Valid time', formatUtc(open.forecast_timing.valid_time)],
                        ['Initialised', formatUtc(open.forecast_timing.init_time)],
                        ['Lead', `${open.forecast_timing.lead_hours}h (day ${open.forecast_timing.lead_day})`],
                        ['Risk category', open.nirikshan_prediction.risk_category],
                        ['Confidence', `${Math.round(open.nirikshan_prediction.confidence_score * 100)}% (${confidenceLabel(Math.round(open.nirikshan_prediction.confidence_score * 100))})`],
                        ['Stated bust prob.', pct(open.nirikshan_prediction.bust_probability)],
                        ['Realised', pct(open.ground_truth_outcome.realized_overall_bust)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-b border-ice-50 pb-1.5 last:border-0">
                          <dt className="shrink-0 text-slate-500">{k}</dt>
                          <dd className="data-value text-right font-semibold text-navy-800">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Panel>

                  <Panel className="p-4">
                    <div className="eyebrow mb-2 flex items-center gap-1.5">
                      <IconBulb width={14} height={14} /> SHAP factors
                    </div>
                    <div className="space-y-2">
                      {open.explainability.top_shap_factors.map((f) => (
                        <div key={f.feature}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="truncate font-semibold text-navy-800">{humanizeFeature(f.feature)}</span>
                            <span
                              className="data-value shrink-0 font-bold"
                              style={{ color: f.shap_value >= 0 ? '#dd5145' : '#2c7fbe' }}
                            >
                              {signed(f.shap_value, 3)}
                            </span>
                          </div>
                          <div className="relative mt-1 h-1.5 rounded-full bg-ice-100">
                            <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                            <div
                              className="absolute inset-y-0 rounded-full"
                              style={{
                                background: f.shap_value >= 0 ? '#ef9455' : '#4fa8e4',
                                left: f.shap_value >= 0 ? '50%' : `${50 - Math.min(50, Math.abs(f.shap_value) * 300)}%`,
                                width: `${Math.min(50, Math.abs(f.shap_value) * 300)}%`,
                              }}
                            />
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            feature value {f.feature_value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-1 border-t border-ice-100 pt-2.5 text-[11px] text-slate-600">
                      <div className="eyebrow mb-1">Risk drivers</div>
                      {open.explainability.key_risk_drivers.map((d) => (
                        <p key={d}>- {d}</p>
                      ))}
                      <div className="eyebrow mb-1 mt-2">Stabilising factors</div>
                      {open.explainability.stabilizing_factors.map((d) => (
                        <p key={d}>- {d}</p>
                      ))}
                    </div>
                  </Panel>

                  <div className="space-y-4">
                    <HistoricalAnaloguePanel analogs={open.historical_analogs} source={open.source} compact />
                    <Panel className="p-4">
                      <div className="eyebrow mb-1.5 flex items-center gap-1.5">
                        <IconHistory width={13} height={13} /> Location
                      </div>
                      <p className="text-[12px] leading-relaxed text-slate-600">
                        {open.location.admin1} - lat {open.location.lat}, lon {open.location.lon}
                        {open.location.elevation_m !== undefined ? ` - ${open.location.elevation_m} m` : ''}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Source: {open.source === 'demo' ? 'demo dataset' : 'live model run'}
                      </p>
                    </Panel>
                  </div>
                </div>

                <ExplainabilityPanel
                  bustProbability={open.nirikshan_prediction.bust_probability}
                  confidence={Math.round(open.nirikshan_prediction.confidence_score * 100)}
                  contributions={open.explainability.top_shap_factors.map((f) => ({
                    feature: f.feature,
                    contribution: f.shap_value,
                    reason: `feature value ${f.feature_value}`,
                  }))}
                  modelReasons={open.explainability.key_risk_drivers}
                  stabilizers={open.explainability.stabilizing_factors}
                  source={open.source}
                />
              </section>
            )}
          </>
        )}
      </AsyncSection>

      {cases.data && cases.data.length === 0 && (
        <EmptyState
          title="No case studies available."
          description="Run the ML service with case-study artifacts to populate this page, or switch to demo mode."
        />
      )}

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-ice-200 bg-ice-50 px-4 py-3 text-[11px] leading-relaxed text-slate-600">
        <InfoTip text="Case studies are curated records, not an exhaustive evaluation. See Verification for statistics over the full held-out split." />
        <span>
          Case studies illustrate behaviour; they do not establish skill. Use the Verification and Analytics modules for
          quantitative claims.
        </span>
      </div>
    </>
  );
}
