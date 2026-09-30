import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { HistoricalAnaloguePanel } from '../components/intelligence/HistoricalAnaloguePanel';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { StatusBanner, TableSkeleton, SkeletonPanel } from '../components/ui/states';
import { Badge, Button, Stat, Select, InfoTip, Panel, SectionTitle } from '../components/ui/primitives';
import { useForecastData, useShell } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { getHistoricalAnalogues, getRegionDetails } from '../services/api';
import { mapConcurrent } from '../utils/async';
import { pct, formatUtc } from '../utils/format';
import { riskLabel } from '../utils/risk';
import { IconHistory, IconArrowRight, IconSearch } from '../components/ui/icons';

interface AnalogueRow {
  region_id: string;
  region_name: string;
  valid_time: string;
  lead_day: number;
  bust_probability: number;
  actual_error: number;
  was_bust: boolean;
}

export default function AnaloguesPage() {
  const { leadDay, map } = useForecastData();
  const { retry } = useShell();
  const { selectedRegionId, selectRegion, regions, variable } = useAppStore();

  const [scope, setScope] = useState<'watchlist' | 'all' | 'selected'>('watchlist');
  const [limit, setLimit] = useState(12);

  const catalogue = regions.length ? regions : map.data?.regions ?? [];

  const scanned = useAsync(async () => {
    let targets = catalogue;
    if (scope === 'selected') {
      targets = catalogue.filter((r) => r.region_id === (selectedRegionId ?? catalogue[0]?.region_id));
    } else if (scope === 'watchlist') {
      const watched = catalogue.filter((r) => useAppStore.getState().watchlist.includes(r.region_id));
      targets = watched.length ? watched : catalogue.slice(0, 8);
    } else {
      targets = catalogue.slice(0, 30);
    }

    const rows: AnalogueRow[] = [];
    await mapConcurrent(targets, 5, async (r) => {
      const history = await getHistoricalAnalogues(r.region_id, limit);
      history.forEach((h) => rows.push({ region_name: r.name, region_id: r.region_id, ...h }));
    });
    return rows.sort((a, b) => a.valid_time.localeCompare(b.valid_time));
  }, [scope, limit, catalogue.length]);

  const subjectId = selectedRegionId ?? catalogue[0]?.region_id ?? null;

  const subjectAnalysis = useAsync(async () => {
    if (!subjectId) return null;
    return getRegionDetails(subjectId, leadDay);
  }, [subjectId, leadDay]);

  const subjectHistory = useAsync(async () => {
    if (!subjectId) return [];
    return getHistoricalAnalogues(subjectId, 30);
  }, [subjectId]);

  const stats = useMemo(() => {
    const rows = scanned.data ?? [];
    const busts = rows.filter((r) => r.was_bust);
    const highProb = rows.filter((r) => r.bust_probability >= 0.5);
    const hits = highProb.filter((r) => r.was_bust);
    return {
      n: rows.length,
      bustRate: rows.length ? busts.length / rows.length : 0,
      precision: highProb.length ? hits.length / highProb.length : null,
      meanError: rows.length ? rows.reduce((s, r) => s + r.actual_error, 0) / rows.length : 0,
      highProb: highProb.length,
    };
  }, [scanned.data]);

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Historical Analogues"
        description="Has the model seen this situation before? Similar past cases and how often they ended in a bust."
        controls={<ForecastControls />}
        actions={
          <Button variant="secondary" onClick={() => scanned.reload()}>
            <IconSearch width={15} height={15} /> Rescan
          </Button>
        }
      />

      <StatusBanner className="mb-4" onRetry={retry} />

      <div className="mb-4 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Panel className="p-4">
          <div className="space-y-3">
            <Select
              label="Scan scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
            >
              <option value="watchlist">Watchlist regions</option>
              <option value="selected">Selected region only</option>
              <option value="all">First 30 catalogue regions</option>
            </Select>
            <Select label="Cases per region" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
              {[6, 12, 24, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Scanning issues one <code className="data-value">/history</code> request per region with concurrency 5.
              Results are not cached between scope changes so the numbers always match what the backend returns.
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="primary" onClick={() => scanned.reload()} className="flex-1">
                Run scan
              </Button>
              <Button variant="ghost" onClick={() => setScope('watchlist')}>
                Reset
              </Button>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Cases scanned" value={stats.n} animate />
          <Stat label="Historical bust rate" value={Math.round(stats.bustRate * 100)} suffix="%" tone={stats.bustRate > 0.5 ? 'risk' : 'default'} />
          <Stat
            label="Precision at 50%"
            value={stats.precision === null ? '-' : Math.round(stats.precision * 100)}
            suffix={stats.precision === null ? undefined : '%'}
            sub={`${stats.highProb} flagged cases`}
          />
          <Stat label="Mean realised error" value={stats.meanError.toFixed(2)} />
        </div>
      </div>

      <section className="mb-5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
            <IconHistory width={16} height={16} className="text-blue-600" />
            Scanned cases
            <InfoTip text="Every row is a historical verification record for this region. Nothing is fabricated when no history exists." />
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              variable: {variable}
            </span>
            <Button variant="ghost" onClick={() => setLimit((l) => (l >= 30 ? 6 : l * 2))}>
              More per region
            </Button>
          </div>
        </div>

        <AsyncSection
          state={scanned}
          skeleton={<TableSkeleton rows={8} />}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No historical cases for this scope."
          emptyDescription="No verification records were returned for these regions, so no rows are shown."
        >
          {(rows) => (
            <div className="panel overflow-hidden">
              <div className="no-scrollbar max-h-[460px] overflow-auto">
                <table className="w-full border-collapse text-left text-[12px]">
                  <thead className="sticky top-0 z-10 bg-ice-25">
                    <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2.5">Valid time (UTC)</th>
                      <th className="px-3 py-2.5">Region</th>
                      <th className="px-3 py-2.5">Lead</th>
                      <th className="px-3 py-2.5">Bust prob.</th>
                      <th className="px-3 py-2.5">Realised error</th>
                      <th className="px-3 py-2.5">Outcome</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={`${r.region_id}-${r.valid_time}-${i}`}
                        className="border-b border-ice-50 last:border-0 hover:bg-ice-50"
                      >
                        <td className="data-value px-4 py-2 text-slate-600">{formatUtc(r.valid_time)}</td>
                        <td className="px-3 py-2 font-semibold text-navy-900">{r.region_name}</td>
                        <td className="px-3 py-2 text-slate-600">D{r.lead_day}</td>
                        <td className="data-value px-3 py-2 font-semibold text-navy-900">{pct(r.bust_probability)}</td>
                        <td className="data-value px-3 py-2 text-slate-600">{r.actual_error.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <Badge tone={r.was_bust ? 'critical' : 'low'}>{r.was_bust ? 'BUST' : 'no bust'}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => selectRegion(r.region_id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Open <IconArrowRight width={12} height={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-ice-100 bg-ice-25 px-4 py-2.5 text-[11px] text-slate-500">
                {rows.length} rows - sort order is chronological. Risk band of the current run for day {leadDay}:{' '}
                {scanned.data?.length ? riskLabel(scanned.data[0].bust_probability) : 'n/a'}.
              </div>
            </div>
          )}
        </AsyncSection>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AsyncSection state={subjectAnalysis} skeleton={<SkeletonPanel lines={6} />}>
          {(data) => (
            <HistoricalAnaloguePanel
              analogs={data.historical_analogs}
              history={subjectHistory.data ?? undefined}
            />
          )}
        </AsyncSection>

        <Panel className="p-4">
          <SectionTitle
            eyebrow="Method"
            title="How an analogue is chosen"
            subtitle="Documented so the panel can be audited."
          />
          <ol className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-slate-600">
            <li className="flex gap-2.5">
              <span className="data-value flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
              The backend queries the verification history for the same location and lead day.
            </li>
            <li className="flex gap-2.5">
              <span className="data-value flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
              Candidates are scored on similarity of the driver features that dominate the current prediction.
            </li>
            <li className="flex gap-2.5">
              <span className="data-value flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">3</span>
              The historical bust rate over those analogues becomes the analogue-based prior shown in the panel.
            </li>
            <li className="flex gap-2.5">
              <span className="data-value flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">4</span>
              If fewer than three analogues exist, the panel says so rather than padding the list.
            </li>
          </ol>
          <div className="mt-3 rounded-lg bg-ice-50 p-3 text-[11px] leading-relaxed text-slate-600">
            An analogue prior is context, not evidence about today's forecast. Always compare it with the calibrated
            bust probability for the current run.
          </div>
        </Panel>
      </section>

      <RegionDrawer />
    </>
  );
}
