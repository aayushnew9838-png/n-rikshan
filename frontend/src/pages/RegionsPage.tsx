import { useMemo, useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { ConfidenceStrip } from '../components/forecast/ConfidenceStrip';
import { ExplainabilityPanel } from '../components/intelligence/ExplainabilityPanel';
import { HistoricalAnaloguePanel } from '../components/intelligence/HistoricalAnaloguePanel';
import { MultiModelAgreementPanel } from '../components/intelligence/MultiModelAgreementPanel';
import { StatusBanner, SkeletonPanel, EmptyState, ChartSkeleton } from '../components/ui/states';
import { Badge, Button, Stat, Select, InfoTip, SectionTitle, ConfidenceRing, ProbabilityBar } from '../components/ui/primitives';
import { useForecastData, useShell } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { getHistoricalAnalogues, getMultiModel, getRegionDetails } from '../services/api';
import { VARIABLES } from '../types';
import type { VariableKey } from '../types';
import { confidenceColor, confidenceLabel, riskLabel, confidenceMeaning } from '../utils/risk';
import { pct, formatUtc } from '../utils/format';
import { IconGlobe, IconStar, IconStarFilled, IconBulb, IconHistory, IconTarget } from '../components/ui/icons';

export default function RegionsPage() {
  const { leadDay, map, dayWise } = useForecastData();
  const { retry } = useShell();
  const { regions, setRegions, selectedRegionId, selectRegion, watchlist, toggleWatchlist, variable, setVariable } =
    useAppStore();

  const list = regions.length ? regions : map.data?.regions ?? [];

  const analysis = useAsync(async () => {
    if (!selectedRegionId) return null;
    return getRegionDetails(selectedRegionId, leadDay);
  }, [selectedRegionId, leadDay]);

  const history = useAsync(async () => {
    if (!selectedRegionId) return [];
    return getHistoricalAnalogues(selectedRegionId, 24);
  }, [selectedRegionId]);

  const multi = useAsync(async () => getMultiModel(), [variable]);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'bust' | 'confidence'>('bust');

  const selected = useMemo(() => list.find((r) => r.region_id === selectedRegionId) ?? null, [list, selectedRegionId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withCells = list.map((r) => {
      const cell = map.data?.regions.find((c) => c.region_id === r.region_id);
      return { ...r, cell };
    });
    const filteredList = q
      ? withCells.filter((r) => r.name.toLowerCase().includes(q) || (r.admin1 ?? '').toLowerCase().includes(q))
      : withCells;
    return filteredList.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'confidence') return (a.cell?.confidence ?? 0) - (b.cell?.confidence ?? 0);
      return (b.cell?.bust_probability ?? 0) - (a.cell?.bust_probability ?? 0);
    });
  }, [list, map.data, query, sort]);

  const selectedStrip = useMemo(() => {
    const d = dayWise.data;
    if (!d || !selectedRegionId) return [];
    return d.days
      .map((day) => d.cells.find((c) => c.region_id === selectedRegionId && c.lead_day === day))
      .filter(Boolean) as NonNullable<(typeof d.cells)[number]>[];
  }, [dayWise.data, selectedRegionId]);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Regional Intelligence"
        description="Pick a location and read everything Nirikshan knows about it: current risk, drivers, historical analogue and multi-model agreement."
        controls={<ForecastControls showThresholds />}
        actions={
          <Button variant="secondary" onClick={() => setRegions(map.data?.regions ?? [])}>
            Sync catalogue ({list.length})
          </Button>
        }
      />

      <StatusBanner className="mb-4" notes={map.data?.notes} onRetry={retry} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Catalogue regions" value={list.length} animate />
        <Stat
          label="Watched"
          value={watchlist.length}
          sub="starred locations"
          icon={<IconStar width={16} height={16} />}
        />
        <Stat
          label="Selected region"
          value={selected?.name ?? 'none'}
          sub={selected ? `${selected.admin1 ?? ''} - ${selected.lat.toFixed(2)}, ${selected.lon.toFixed(2)}` : 'choose one below'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        <aside className="panel flex min-h-[520px] flex-col p-0">
          <div className="space-y-3 border-b border-ice-100 p-3.5">
            <label className="block">
              <span className="eyebrow">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Region or admin area…"
                className="mt-1.5 h-9 w-full rounded-lg border border-ice-200 bg-white px-3 text-sm font-medium text-navy-800 shadow-soft outline-none transition focus:border-blue-400"
              />
            </label>
            <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="bust">Bust probability (high first)</option>
              <option value="confidence">Confidence (low first)</option>
              <option value="name">Name (A-Z)</option>
            </Select>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto">
            <AsyncSection
              state={map}
              skeleton={<SkeletonPanel lines={8} />}
              isEmpty={() => filtered.length === 0}
              emptyTitle="No region matches that search."
              emptyDescription="Clear the search box or sync the catalogue."
            >
              {() => (
                <ul>
                  {filtered.map((r) => {
                    const active = r.region_id === selectedRegionId;
                    const watched = watchlist.includes(r.region_id);
                    return (
                      <li key={r.region_id}>
                        <div
                          className={`group flex items-center gap-2 border-b border-ice-50 px-3.5 py-2.5 transition ${
                            active ? 'bg-blue-50' : 'hover:bg-ice-50'
                          }`}
                        >
                          <button
                            onClick={() => selectRegion(r.region_id)}
                            className="min-w-0 flex-1 text-left"
                            aria-current={active ? 'true' : undefined}
                          >
                            <span className="block truncate text-[13px] font-semibold text-navy-900">{r.name}</span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {r.admin1 ?? 'India'} - D{leadDay}
                            </span>
                          </button>
                          {r.cell && (
                            <span
                              className="data-value shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                              style={{
                                background: `${confidenceColor(r.cell.confidence)}22`,
                                color: confidenceColor(r.cell.confidence),
                              }}
                            >
                              {r.cell.confidence}%
                            </span>
                          )}
                          <button
                            onClick={() => toggleWatchlist(r.region_id)}
                            aria-label={watched ? `Remove ${r.name} from watchlist` : `Add ${r.name} to watchlist`}
                            className="shrink-0 rounded p-1 text-slate-300 transition hover:text-amber-500"
                          >
                            {watched ? <IconStarFilled width={14} height={14} /> : <IconStar width={14} height={14} />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </AsyncSection>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {!selectedRegionId ? (
            <EmptyState
              title="Select a region to open its intelligence dossier."
              description="Use the list on the left, the map, or the ranked risk panel on the dashboard."
            />
          ) : (
            <>
              <section className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="eyebrow">Regional dossier</div>
                    <h2 className="mt-1 text-xl font-bold text-navy-900">{selected?.name ?? selectedRegionId}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {selected?.admin1 ?? 'India'} - {selected ? `${selected.lat.toFixed(3)}, ${selected.lon.toFixed(3)}` : ''}
                      {selected && (
                        <button
                          onClick={() => toggleWatchlist(selected.region_id)}
                          className="ml-2 inline-flex items-center gap-1 rounded-md border border-ice-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-600"
                        >
                          {watchlist.includes(selected.region_id) ? (
                            <>
                              <IconStarFilled width={11} height={11} /> Watching
                            </>
                          ) : (
                            <>
                              <IconStar width={11} height={11} /> Watch
                            </>
                          )}
                        </button>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    {selected && (
                      <>
                        <ConfidenceRing
                          value={map.data?.regions.find((r) => r.region_id === selected.region_id)?.confidence ?? 0}
                          size={92}
                          label="confidence"
                        />
                        <div className="text-right">
                          <div className="eyebrow">Bust probability</div>
                          <div className="data-value mt-1 text-2xl font-bold text-navy-900">
                            {pct(map.data?.regions.find((r) => r.region_id === selected.region_id)?.bust_probability ?? 0)}
                          </div>
                          <Badge tone="neutral">
                            {riskLabel(map.data?.regions.find((r) => r.region_id === selected.region_id)?.bust_probability ?? 0)}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <AsyncSection state={analysis} skeleton={<SkeletonPanel lines={3} />} className="mt-4">
                  {(data) => (
                    <div className="rounded-lg bg-ice-50 p-3.5">
                      <div className="eyebrow mb-1.5">Plain-language summary</div>
                      {data.plain_reasons.length ? (
                        <ul className="space-y-1.5">
                          {data.plain_reasons.map((r) => (
                            <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-slate-700">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-slate-500">
                          The model returned no plain-language statement for this region at day {leadDay}.
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-500">
                        {confidenceMeaning(map.data?.regions.find((r) => r.region_id === selectedRegionId)?.confidence ?? 0)}
                      </p>
                    </div>
                  )}
                </AsyncSection>
              </section>

              <section className="panel p-4">
                <div className="eyebrow mb-2">Day 1-10 confidence at this location</div>
                <AsyncSection state={dayWise} skeleton={<ChartSkeleton height={120} />}>
                  {() =>
                    selectedStrip.length ? (
                      <ConfidenceStrip cells={selectedStrip} selectedDay={leadDay} />
                    ) : (
                      <p className="text-[12px] text-slate-500">No lead-day cells published for this region.</p>
                    )
                  }
                </AsyncSection>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <AsyncSection state={analysis} skeleton={<SkeletonPanel lines={6} />}>
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

                <AsyncSection state={history} skeleton={<SkeletonPanel lines={6} />}>
                  {(data) => (
                    <HistoricalAnaloguePanel
                      history={data}
                      analogs={analysis.data?.historical_analogs}
                    />
                  )}
                </AsyncSection>
              </section>

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <AsyncSection state={multi} skeleton={<SkeletonPanel lines={5} />}>
                  {(data) => (
                    <MultiModelAgreementPanel
                      agreement={data}
                      variable={variable}
                      onVariableChange={(v: VariableKey) => setVariable(v)}
                      unavailableReason={
                        data ? undefined : 'The multi-model endpoint did not return a comparison for this lead day.'
                      }
                    />
                  )}
                </AsyncSection>

                <div className="panel p-4">
                  <div className="eyebrow mb-2 flex items-center gap-1.5">
                    Variable control <InfoTip text="Switching the variable re-fetches the multi-model comparison." />
                  </div>
                  <div className="space-y-2">
                    {VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setVariable(v.key)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${
                          variable === v.key
                            ? 'border-blue-400 bg-blue-50 text-blue-700'
                            : 'border-ice-200 bg-white text-slate-600 hover:border-blue-200'
                        }`}
                      >
                        <span>{v.label}</span>
                        <span className="data-value text-slate-400">{v.unit}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 border-t border-ice-100 pt-3 text-[11px] text-slate-500">
                    <p className="flex gap-2">
                      <IconTarget width={14} height={14} className="mt-0.5 shrink-0 text-blue-500" />
                      Risk uses the calibrated bust probability for day {leadDay}.
                    </p>
                    <p className="flex gap-2">
                      <IconBulb width={14} height={14} className="mt-0.5 shrink-0 text-amber-500" />
                      Drivers are SHAP contributions from the production model, not hand-written text.
                    </p>
                    <p className="flex gap-2">
                      <IconHistory width={14} height={14} className="mt-0.5 shrink-0 text-teal-500" />
                      Analogue statements come from the verification history of this location.
                    </p>
                  </div>
                </div>
              </section>

              <section className="panel p-4">
                <SectionTitle
                  eyebrow="Verification history"
                  title="Past forecasts at this location"
                  subtitle={history.data?.length ? `Latest ${history.data.length} verified valid times.` : undefined}
                />
                <div className="mt-3 no-scrollbar overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-2">Valid time (UTC)</th>
                        <th className="px-3 py-2">Lead</th>
                        <th className="px-3 py-2">Bust prob.</th>
                        <th className="px-3 py-2">Actual error</th>
                        <th className="px-3 py-2">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(history.data ?? []).slice(0, 12).map((h, i) => (
                        <tr key={i} className="border-b border-ice-50 last:border-0">
                          <td className="data-value px-3 py-2 text-slate-600">{formatUtc(h.valid_time)}</td>
                          <td className="px-3 py-2 text-slate-600">D{h.lead_day}</td>
                          <td className="data-value px-3 py-2 font-semibold text-navy-900">
                            {pct(h.bust_probability)}
                          </td>
                          <td className="data-value px-3 py-2 text-slate-600">{h.actual_error.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            <Badge tone={h.was_bust ? 'critical' : 'low'}>{h.was_bust ? 'BUST' : 'no bust'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!history.data?.length && (
                    <p className="mt-3 text-[12px] text-slate-500">
                      <IconGlobe width={13} height={13} className="mr-1 inline" />
                      No verification history is available for this region in the current backend.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
