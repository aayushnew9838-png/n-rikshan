import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ConfidenceStrip } from '../components/forecast/ConfidenceStrip';
import { ConfidenceMatrix, buildMatrix } from '../components/charts/ConfidenceMatrix';
import { BackendBanner, ChartSkeleton, SkeletonPanel } from '../components/ui/states';
import { Stat, InfoTip, SectionTitle, Button } from '../components/ui/primitives';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useAppStore } from '../store/useAppStore';
import type { ReliabilityCell } from '../types';

export default function LeadTimePage() {
  const { leadDay, isDemo, dayWise, overview } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { selectRegion, setLeadDay } = useAppStore();
  const navigate = useNavigate();

  const matrix = useMemo(() => (dayWise.data ? buildMatrix(dayWise.data) : null), [dayWise.data]);

  const networkStrip: ReliabilityCell[] = useMemo(() => {
    const d = dayWise.data;
    if (!d) return [];
    return d.days.map((day) => {
      const cells = d.cells.filter((c) => c.lead_day === day);
      const meanBust = cells.reduce((s, c) => s + c.bust_probability, 0) / (cells.length || 1);
      return {
        region_id: '__network__',
        lead_day: day,
        bust_probability: meanBust,
        confidence: Math.round(100 * (1 - meanBust)),
        confidence_category: 'MODERATE_CONFIDENCE',
        bust_risk: 'moderate',
      };
    });
  }, [dayWise.data]);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Day 1-10 Reliability"
        description="How forecast trust decays with lead time. Every cell is confidence = 100 x (1 - calibrated bust probability)."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls showThresholds />}
      />

      <div className="mb-4">
        {isDemo ? (
          <BackendBanner mode="demo" onRetry={retry} />
        ) : (
          <BackendBanner mode="live" onEnableDemo={enableDemo} onRetry={retry} notes={dayWise.data ? [] : undefined} />
        )}
      </div>

      <AsyncSection state={overview} skeleton={<SkeletonPanel lines={4} />} className="mb-4">
        {(data) => (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Forecast confidence" value={data.stats.mean_confidence} suffix="%" tone="calm" animate />
            <Stat
              label="Lowest confidence region"
              value={data.stats.lowest_confidence?.region_name ?? '-'}
              sub={data.stats.lowest_confidence ? `${Math.round(data.stats.lowest_confidence.confidence)}% confidence` : undefined}
              tone="risk"
            />
            <Stat
              label="Highest bust probability"
              value={
                data.stats.highest_bust_probability
                  ? `${Math.round(data.stats.highest_bust_probability.bust_probability * 100)}%`
                  : '-'
              }
              sub={data.stats.highest_bust_probability?.region_name}
              tone="risk"
            />
            <Stat label="High risk regions" value={data.stats.high_risk_regions} animate sub={`on day ${leadDay}`} />
          </div>
        )}
      </AsyncSection>

      <AsyncSection state={dayWise} skeleton={<SkeletonPanel lines={5} />} className="mb-4">
        {() => (
          <ConfidenceStrip
            cells={networkStrip}
            selectedDay={leadDay}
            onSelectDay={setLeadDay}
            title="Network-wide confidence by lead day"
            subtitle="Mean across every region in the catalogue for each lead day. Click a day to re-filter the whole application."
          />
        )}
      </AsyncSection>

      <section className="mb-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
            Region x Day confidence matrix
            <InfoTip text="Rows are sorted so that the least reliable regions appear first. Click a cell to jump to that region's analysis." />
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/map')}>
              Open on map
            </Button>
            <Button variant="ghost" onClick={() => navigate('/bust-probability')}>
              Bust probability view
            </Button>
          </div>
        </div>
        <AsyncSection state={dayWise} skeleton={<ChartSkeleton />}>
          {(data) => (
            <ConfidenceMatrix
              data={buildMatrix(data)}
              selectedRegionId={null}
              onRegionClick={selectRegion}
              onCellClick={(id, d) => {
                setLeadDay(d);
                selectRegion(id);
              }}
              maxRows={30}
            />
          )}
        </AsyncSection>
      </section>

      <section>
        <SectionTitle
          title="Reading the decay curve"
          subtitle="Confidence is not a vague feeling — it is a calibrated probability."
        />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="panel p-4">
            <div className="eyebrow mb-1.5">Day 1-3</div>
            <p className="text-xs leading-relaxed text-slate-600">
              Short lead times are dominated by initial-condition quality. Confidence stays high unless the analysis
              fields already disagree across the ensemble.
            </p>
          </div>
          <div className="panel p-4">
            <div className="eyebrow mb-1.5">Day 4-7</div>
            <p className="text-xs leading-relaxed text-slate-600">
              Model physics and boundary errors accumulate. This is where multi-model spread starts to earn its keep as
              a leading indicator of a bust.
            </p>
          </div>
          <div className="panel p-4">
            <div className="eyebrow mb-1.5">Day 8-10</div>
            <p className="text-xs leading-relaxed text-slate-600">
              Predictable-skill limits dominate. A high confidence number at day 10 should be treated with suspicion —
              check it against historical verification before acting.
            </p>
          </div>
        </div>
        {matrix && (
          <p className="mt-3 text-[11px] text-slate-400">
            {matrix.regions.length} regions x {matrix.days.length} lead days evaluated.
          </p>
        )}
      </section>
    </>
  );
}
