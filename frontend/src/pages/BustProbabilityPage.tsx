import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { RiskRanking } from '../components/intelligence/RiskRanking';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { StatusBanner, ChartSkeleton, SkeletonPanel } from '../components/ui/states';
import { Stat, InfoTip, ProbabilityBar, SectionTitle, Badge } from '../components/ui/primitives';
import { useForecastData, useShell } from '../hooks/useForecastData';
import { useAppStore } from '../store/useAppStore';
import { riskColor, riskLabel, confidenceLabel, confidenceColor } from '../utils/risk';
import { cn } from '../utils/cn';

const THRESHOLDS = [
  { value: 0.25, label: 'Low < 25%' },
  { value: 0.5, label: 'Moderate 25-50%' },
  { value: 0.75, label: 'High 50-75%' },
  { value: 1.01, label: 'Critical 75%+' },
];

export default function BustProbabilityPage() {
  const { leadDay, dayWise, map, risk } = useForecastData();
  const { retry } = useShell();
  const { selectRegion, selectedRegionId, setLeadDay, setMapLayer, setRiskThreshold } = useAppStore();
  const [minBust, setMinBust] = useState(0);

  const names = useMemo(() => {
    const m = new Map<string, string>();
    (map.data?.regions ?? []).forEach((r) => m.set(r.region_id, r.name));
    return m;
  }, [map.data]);

  const dayCells = useMemo(() => (dayWise.data ? dayWise.data.cells.filter((c) => c.lead_day === leadDay) : []), [dayWise.data, leadDay]);

  const histogram = useMemo(() => {
    const bins = [
      { label: '0-10%', count: 0, color: '#7ec8e8' },
      { label: '10-25%', count: 0, color: '#4fa8dd' },
      { label: '25-50%', count: 0, color: '#f2c14e' },
      { label: '50-75%', count: 0, color: '#ef9455' },
      { label: '75-100%', count: 0, color: '#dd5145' },
    ];
    dayCells.forEach((c) => {
      const p = c.bust_probability;
      if (p < 0.1) bins[0].count++;
      else if (p < 0.25) bins[1].count++;
      else if (p < 0.5) bins[2].count++;
      else if (p < 0.75) bins[3].count++;
      else bins[4].count++;
    });
    return bins;
  }, [dayCells]);

  const maxBin = Math.max(1, ...histogram.map((b) => b.count));

  const matrixCells = useMemo(() => {
    const d = dayWise.data;
    if (!d) return null;
    const regions = [...d.regions]
      .map((r) => ({
        region: r,
        cells: d.days.map((day) => d.cells.find((c) => c.region_id === r.region_id && c.lead_day === day)),
        worst: Math.max(
          ...d.days.map((day) => d.cells.find((c) => c.region_id === r.region_id && c.lead_day === day)?.bust_probability ?? 0),
        ),
      }))
      .sort((a, b) => b.worst - a.worst)
      .slice(0, 30);
    return { days: d.days, regions };
  }, [dayWise.data]);

  const filtered = useMemo(
    () => (risk.data ?? []).filter((r) => r.bust_probability >= minBust),
    [risk.data, minBust],
  );

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Forecast Bust Probability"
        description="Calibrated probability that the forecast will realise a large error at each location and lead day."
        controls={<ForecastControls showThresholds />}
      />

      <StatusBanner className="mb-4" onRetry={retry} />

      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <section className="panel p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              Bust probability distribution
              <InfoTip text="Counts of regions falling into each probability band for the selected lead day." />
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Day {leadDay}</span>
          </div>
          <AsyncSection state={dayWise} skeleton={<ChartSkeleton height={240} />}>
            {() => (
              <div className="flex h-[220px] items-end gap-3 px-1">
                {histogram.map((b) => (
                  <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="data-value text-xs font-bold text-navy-900">{b.count}</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${(b.count / maxBin) * 150 + 4}px`, background: b.color, opacity: 0.85 }}
                      title={`${b.label}: ${b.count} regions`}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </AsyncSection>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-900">Filter</h2>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Minimum bust probability
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={Math.round(minBust * 100)}
              onChange={(e) => setMinBust(Number(e.target.value) / 100)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ice-200 accent-blue-600"
              aria-label="Minimum bust probability"
            />
            <span className="data-value w-12 text-right text-sm font-bold text-navy-900">
              {Math.round(minBust * 100)}%
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {THRESHOLDS.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setMinBust(t.value >= 1.01 ? 0.75 : t.value);
                  setRiskThreshold(t.value >= 1.01 ? 0.75 : t.value);
                }}
                className="flex w-full items-center justify-between rounded-md border border-ice-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: riskColor(t.value >= 1.01 ? 0.8 : t.value) }} />
                  {t.label}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setMapLayer('bust')}
            className="mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Show this on the map
          </button>
        </section>
      </div>

      <section className="mb-4">
        <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-navy-900">
          Region x Day bust probability
          <InfoTip text="Sorted by the worst lead day for each region. Warm cells are where a bust is most likely." />
        </h2>
        <AsyncSection state={dayWise} skeleton={<ChartSkeleton height={320} />}>
          {() =>
            matrixCells && (
              <div className="panel overflow-hidden">
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-ice-200 bg-ice-25">
                        <th className="sticky left-0 z-10 min-w-[168px] bg-ice-25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Region
                        </th>
                        {matrixCells.days.map((d) => (
                          <th key={d} className="min-w-[58px] px-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            D{d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixCells.regions.map(({ region, cells }) => (
                        <tr key={region.region_id} className="border-b border-ice-50 last:border-0">
                          <th
                            scope="row"
                            onClick={() => selectRegion(region.region_id)}
                            className={cn(
                              'sticky left-0 z-10 cursor-pointer bg-white px-4 py-1.5 text-left text-[12px] font-semibold text-navy-900 transition-colors hover:text-blue-600',
                              selectedRegionId === region.region_id && 'bg-blue-50',
                            )}
                          >
                            <span className="block truncate">{region.name}</span>
                            <span className="block truncate text-[9px] font-normal text-slate-400">{region.admin1}</span>
                          </th>
                          {cells.map((c, i) => {
                            if (!c) return <td key={i} className="px-1 py-1.5 text-center text-[10px] text-slate-300">-</td>;
                            const color = riskColor(c.bust_probability);
                            const v = Math.round(c.bust_probability * 100);
                            return (
                              <td key={i} className="px-1 py-1.5">
                                <button
                                  onClick={() => {
                                    setLeadDay(c.lead_day);
                                    selectRegion(region.region_id);
                                  }}
                                  aria-label={`${region.name} day ${c.lead_day}: bust probability ${v} percent, ${riskLabel(c.bust_probability)}`}
                                  title={`${v}% bust probability - ${riskLabel(c.bust_probability)}`}
                                  className="block h-9 w-full rounded-md text-center text-[11px] font-bold transition-transform duration-150 hover:scale-[1.08]"
                                  style={{ background: `${color}40`, border: `1px solid ${color}` }}
                                >
                                  <span className="data-value text-navy-900">{v}</span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ice-100 bg-ice-25 px-4 py-2.5">
                  <div className="flex flex-wrap gap-2.5 text-[10px] font-semibold text-slate-500">
                    {[
                      { label: 'Low <25%', color: riskColor(0.1) },
                      { label: 'Moderate 25-49%', color: riskColor(0.35) },
                      { label: 'High 50-74%', color: riskColor(0.6) },
                      { label: 'Critical 75%+', color: riskColor(0.85) },
                    ].map((b) => (
                      <span key={b.label} className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded" style={{ background: `${b.color}40`, border: `1px solid ${b.color}` }} />
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">Values are percent. Click a cell for full analysis.</span>
                </div>
              </div>
            )
          }
        </AsyncSection>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle title="Ranked bust probability" subtitle={`Threshold applied: ${Math.round(minBust * 100)}%`} />
          <div className="mt-3">
            <AsyncSection
              state={risk}
              skeleton={<SkeletonPanel lines={7} />}
              isEmpty={() => filtered.length === 0}
              emptyTitle="No regions above the current threshold."
              emptyDescription="Lower the minimum bust probability to widen the list."
            >
              {() => (
                <RiskRanking
                  items={filtered.map((r) => ({
                    region_id: r.region_id,
                    name: r.name,
                    admin1: r.admin1,
                    lead_day: r.lead_day,
                    bust_probability: r.bust_probability,
                    confidence: r.confidence,
                  }))}
                  onSelect={selectRegion}
                  selectedId={selectedRegionId}
                  limit={15}
                />
              )}
            </AsyncSection>
          </div>
        </div>

        <div>
          <SectionTitle title="Highest probability regions" subtitle="Top of the full ranking before filtering." />
          <div className="mt-3 space-y-3">
            <AsyncSection state={risk} skeleton={<SkeletonPanel lines={5} />}>
              {(data) =>
                data.slice(0, 6).map((r) => (
                  <button
                    key={r.region_id}
                    onClick={() => selectRegion(r.region_id)}
                    className="block w-full rounded-lg border border-ice-200 bg-white p-3 text-left transition hover:border-blue-300 hover:shadow-soft"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-bold text-navy-900">{r.name}</div>
                        <div className="truncate text-[11px] text-slate-500">{r.admin1} - Day {r.lead_day}</div>
                      </div>
                      <Badge tone="neutral">{riskLabel(r.bust_probability)}</Badge>
                    </div>
                    <div className="mt-2">
                      <ProbabilityBar value={r.bust_probability} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        confidence{' '}
                        <span className="data-value font-bold" style={{ color: confidenceColor(r.confidence) }}>
                          {r.confidence}%
                        </span>{' '}
                        {confidenceLabel(r.confidence)}
                      </span>
                      <span className="data-value font-bold text-navy-900">
                        {Math.round(r.bust_probability * 100)}% bust
                      </span>
                    </div>
                  </button>
                ))
              }
            </AsyncSection>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            Overview cells plotted today:{' '}
            <span className="data-value font-semibold text-slate-500">{dayCells.length}</span>
          </p>
        </div>
      </section>

      <RegionDrawer />
    </>
  );
}
