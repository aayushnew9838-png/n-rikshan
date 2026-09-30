import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ExplainabilityPanel } from '../components/intelligence/ExplainabilityPanel';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { StatusBanner, SkeletonPanel, EmptyState } from '../components/ui/states';
import { Badge, Button, Stat, InfoTip, SectionTitle, Panel } from '../components/ui/primitives';
import { useForecastData, useShell } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { getRegionDetails } from '../services/api';
import { humanizeFeature, pct, signed } from '../utils/format';
import { confidenceColor, confidenceLabel, riskLabel } from '../utils/risk';
import { IconBulb, IconCpu, IconShield, IconArrowRight } from '../components/ui/icons';

const CONTEXT = [
  'Nirikshan does not issue a forecast. It scores the forecast that the numerical models already produced and tells you how much of it to believe.',
  'Confidence = 100 x (1 - calibrated forecast bust probability). It is a probability statement about the forecast, not a measure of how extreme the weather will be.',
  'Bust probability is calibrated with isotonic regression on a temporally held-out split, so a 60% bust probability should be realised as a bust roughly 6 times out of 10.',
  'Model drivers are SHAP contributions: they explain why this model, for this location and lead time, produced the number it did.',
];

export default function ExplainabilityPage() {
  const { leadDay, map } = useForecastData();
  const { retry } = useShell();
  const { selectedRegionId, selectRegion, regions } = useAppStore();

  const analysis = useAsync(async () => {
    const fallback = selectedRegionId ?? regions[0]?.region_id ?? map.data?.regions[0]?.region_id ?? null;
    if (!fallback) return null;
    return getRegionDetails(fallback, leadDay);
  }, [selectedRegionId, regions, map.data, leadDay]);

  const subjectId = analysis.data?.region_id ?? selectedRegionId ?? regions[0]?.region_id ?? null;
  const subjectName = regions.find((r) => r.region_id === subjectId)?.name ?? map.data?.regions.find((r) => r.region_id === subjectId)?.name ?? subjectId;

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Explainability"
        description="Why the model said what it said - feature contributions, plain-language statements and stabilising factors."
        controls={<ForecastControls />}
        actions={
          <Button variant="secondary" onClick={() => analysis.reload()}>
            <IconCpu width={15} height={15} /> Re-run analysis
          </Button>
        }
      />

      <StatusBanner className="mb-4" onRetry={retry} />

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Subject region" value={subjectName ?? '-'} />
        <Stat label="Lead day" value={leadDay} sub="from forecast initialisation" />
        <Stat
          label="Model confidence"
          value={analysis.data?.confidence ?? '-'}
          suffix={analysis.data ? '%' : undefined}
          sub={analysis.data ? confidenceLabel(analysis.data.confidence) : undefined}
          tone={analysis.data && analysis.data.confidence < 60 ? 'risk' : 'calm'}
        />
        <Stat
          label="Bust probability"
          value={analysis.data ? pct(analysis.data.bust_probability) : '-'}
          sub={analysis.data ? riskLabel(analysis.data.bust_probability) : undefined}
          tone={analysis.data && analysis.data.bust_probability >= 0.5 ? 'risk' : 'default'}
        />
      </section>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="eyebrow">Jump to region</span>
        {(regions.length ? regions : map.data?.regions ?? []).slice(0, 14).map((r) => (
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <AsyncSection
          state={analysis}
          skeleton={<SkeletonPanel lines={8} />}
          isEmpty={(d) => !d}
          emptyTitle="No region selected."
          emptyDescription="Choose a region above to load its explanation."
        >
          {(data) => (
            <ExplainabilityPanel
              bustProbability={data.bust_probability}
              confidence={data.confidence}
              contributions={data.reasons}
              modelReasons={data.plain_reasons}
              stabilizers={data.stabilizers}
            />
          )}
        </AsyncSection>

        <aside className="space-y-4">
          <Panel className="p-4">
            <div className="eyebrow mb-2 flex items-center gap-1.5">
              How to read this <InfoTip text="Everything on this page is produced by the model or labelled as context." />
            </div>
            <ul className="space-y-2.5">
              {CONTEXT.map((c) => (
                <li key={c} className="flex gap-2 text-[12px] leading-relaxed text-slate-600">
                  <IconBulb width={14} height={14} className="mt-0.5 shrink-0 text-amber-500" />
                  {c}
                </li>
              ))}
            </ul>
          </Panel>

          <AsyncSection state={analysis} skeleton={<SkeletonPanel lines={4} />}>
            {(data) => (
              <Panel className="p-4">
                <div className="eyebrow mb-2">Top contributions</div>
                {data.reasons.slice(0, 6).map((r, i) => (
                  <div key={`${r.feature}-${i}`} className="mb-2.5 last:mb-0">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate font-semibold text-navy-800">{humanizeFeature(r.feature)}</span>
                      <span
                        className="data-value shrink-0 font-bold"
                        style={{ color: r.contribution >= 0 ? '#dd5145' : '#2c7fbe' }}
                      >
                        {signed(r.contribution, 3)}
                      </span>
                    </div>
                    <div className="relative mt-1 h-2 rounded-full bg-ice-100">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                      <div
                        className="absolute inset-y-0 rounded-full"
                        style={{
                          background: r.contribution >= 0 ? '#ef9455' : '#4fa8dd',
                          left: r.contribution >= 0 ? '50%' : `${50 - Math.min(50, Math.abs(r.contribution) * 200)}%`,
                          width: `${Math.min(50, Math.abs(r.contribution) * 200)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500">{r.reason}</p>
                  </div>
                ))}
                {!data.reasons.length && (
                  <p className="text-[12px] text-slate-500">
                    The model returned no feature contributions for this region at day {leadDay}.
                  </p>
                )}
              </Panel>
            )}
          </AsyncSection>

          <AsyncSection state={map} skeleton={<SkeletonPanel lines={3} />}>
            {(data) => (
              <Panel className="p-4">
                <div className="eyebrow mb-2">Contextual drivers</div>
                <div className="space-y-2 text-[12px] leading-relaxed text-slate-600">
                  <p className="flex gap-2">
                    <IconShield width={14} height={14} className="mt-0.5 shrink-0 text-teal-500" />
                    Synoptic circulation, terrain forcing and soil-moisture coupling are general meteorological context,
                    never model output.
                  </p>
                  <p className="flex gap-2">
                    <IconArrowRight width={14} height={14} className="mt-0.5 shrink-0 text-blue-500" />
                    Use the ranked contributions above to decide what to verify first.
                  </p>
                </div>
                <div className="mt-3 border-t border-ice-100 pt-3 text-[11px] text-slate-400">
                  {data.total} regions plotted - {data.high_risk_count} currently high risk.
                </div>
              </Panel>
            )}
          </AsyncSection>
        </aside>
      </div>

      <section className="mt-5">
        <SectionTitle
          eyebrow="Model stance"
          title="What Nirikshan will and will not claim"
          subtitle="Kept deliberately explicit so no panel is read as more certain than it is."
        />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Panel className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge tone="low">Claims</Badge>
            </div>
            <ul className="space-y-1.5 text-[12px] leading-relaxed text-slate-600">
              <li>Calibrated bust probability for a given location, variable and lead day.</li>
              <li>SHAP-ranked drivers for that specific prediction.</li>
              <li>Realised error statistics from published verification history.</li>
            </ul>
          </Panel>
          <Panel className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge tone="moderate">Does not claim</Badge>
            </div>
            <ul className="space-y-1.5 text-[12px] leading-relaxed text-slate-600">
              <li>The weather itself - Nirikshan does not issue a forecast.</li>
              <li>Causal attribution of any single feature.</li>
              <li>Skill outside the training period or outside the evaluated regions.</li>
            </ul>
          </Panel>
          <Panel className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge tone="critical">Known limits</Badge>
            </div>
            <ul className="space-y-1.5 text-[12px] leading-relaxed text-slate-600">
              <li>Calibration is strongest on the temporal test split, not on unseen regions.</li>
              <li>Multi-model spread features require N backend predictions per location.</li>
              <li>Confidence below 40% should be treated as "do not rely on this run".</li>
            </ul>
          </Panel>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Subject: {subjectName ?? '-'} - confidence{' '}
          <span className="data-value font-bold" style={{ color: analysis.data ? confidenceColor(analysis.data.confidence) : '#687d92' }}>
            {analysis.data?.confidence ?? '-'}
          </span>
          {' - '}
          {analysis.data ? riskLabel(analysis.data.bust_probability) : 'n/a'}
        </p>
      </section>

      <RegionDrawer />
    </>
  );
}
