import { useMemo } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { ForecastControls } from '../components/forecast/ForecastControls';
import { AlertPanel, alertMeta } from '../components/intelligence/AlertPanel';
import { RiskRanking } from '../components/intelligence/RiskRanking';
import { RegionDrawer } from '../components/intelligence/RegionDrawer';
import { BackendBanner, SkeletonPanel, EmptyState } from '../components/ui/states';
import { Badge, Button, Panel, Stat, SectionTitle, InfoTip } from '../components/ui/primitives';
import { useForecastData, useShell, useIsDemo } from '../hooks/useForecastData';
import { useAppStore } from '../store/useAppStore';
import { pct, relativeTime } from '../utils/format';
import type { ReliabilityCell } from '../types';
import { IconBell, IconRefresh, IconStar, IconStarFilled, IconCheck } from '../components/ui/icons';

export default function AlertsPage() {
  const { leadDay, isDemo, alerts, risk, dayWise } = useForecastData();
  const { enableDemo, retry } = useShell();
  const { acknowledged, acknowledgeAlert, selectRegion, selectedRegionId, watchlist, toggleWatchlist, regions, setLeadDay } =
    useAppStore();

  const list = alerts.data ?? [];
  const open = list.filter((a) => !acknowledged.includes(a.id));
  const acked = list.filter((a) => acknowledged.includes(a.id));

  const byType = useMemo(() => {
    const m = new Map<string, number>();
    list.forEach((a) => m.set(a.type, (m.get(a.type) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  const watched = useMemo(() => regions.filter((r) => watchlist.includes(r.region_id)), [regions, watchlist]);

  const watchedRows = useMemo(
    () =>
      watched
        .map((r) => {
          const cell = risk.data?.find((c) => c.region_id === r.region_id);
          return cell
            ? {
                region_id: r.region_id,
                name: r.name,
                admin1: r.admin1,
                lead_day: cell.lead_day,
                bust_probability: cell.bust_probability,
                confidence: cell.confidence,
              }
            : null;
        })
        .filter(Boolean) as {
        region_id: string;
        name: string;
        admin1?: string;
        lead_day: number;
        bust_probability: number;
        confidence: number;
      }[],
    [watched, risk.data],
  );

  const networkStrip = useMemo<ReliabilityCell[]>(() => {
    const out: ReliabilityCell[] = [];
    const d = dayWise.data;
    if (!d) return out;
    for (const day of d.days) {
      const cells = d.cells.filter((c) => c.lead_day === day);
      if (!cells.length) continue;
      const meanBust = cells.reduce((s, c) => s + c.bust_probability, 0) / cells.length;
      out.push({
        region_id: '__network__',
        lead_day: day,
        bust_probability: meanBust,
        confidence: Math.round(100 * (1 - meanBust)),
        confidence_category: 'MODERATE_CONFIDENCE',
        bust_risk: 'moderate',
      });
    }
    return out;
  }, [dayWise.data]);

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Alerts & Watchlist"
        description="Conditions the system considers too unreliable to ignore, plus the locations you personally track."
        source={isDemo ? 'demo' : 'live'}
        controls={<ForecastControls />}
        actions={
          <Button variant="secondary" onClick={() => alerts.reload()}>
            <IconRefresh width={15} height={15} /> Refresh alerts
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
        <Stat label="Open alerts" value={open.length} animate tone={open.length ? 'risk' : 'calm'} />
        <Stat label="Acknowledged" value={acked.length} />
        <Stat label="Watchlist" value={watchlist.length} sub="starred locations" />
        <Stat label="Active lead day" value={leadDay} sub="press [ and ] to step" />
      </div>

      <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
        <AsyncSection
          state={alerts}
          skeleton={<SkeletonPanel lines={8} />}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No alerts for this lead day."
          emptyDescription="Nothing crossed the alert thresholds. Switch lead day or lower the risk threshold to widen the rule."
          showUnavailableAction
          onEnableDemo={enableDemo}
        >
          {(data) => (
            <AlertPanel
              alerts={data}
              acknowledged={acknowledged}
              onAcknowledge={acknowledgeAlert}
              onOpen={selectRegion}
              onWatch={toggleWatchlist}
            />
          )}
        </AsyncSection>

        <aside className="space-y-4">
          <Panel className="p-4">
            <div className="eyebrow mb-2 flex items-center gap-1.5">
              Alert rules <InfoTip text="Thresholds are evaluated against the calibrated bust probability for the active lead day." />
            </div>
            <ul className="space-y-2 text-[12px] leading-relaxed text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: alertMeta('HIGH_BUST_PROBABILITY').color }} />
                Bust probability reaches the critical band (75%+).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: alertMeta('VERY_LOW_CONFIDENCE').color }} />
                Confidence falls below 40% for the active lead day.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: alertMeta('CONFIDENCE_DETERIORATION').color }} />
                Confidence drops by more than 10 points versus the previous lead day.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: alertMeta('HIGH_MODEL_DISAGREEMENT').color }} />
                Multi-model spread features dominate the SHAP drivers for that region.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: alertMeta('ANOMALOUS_FORECAST_BEHAVIOUR').color }} />
                The probability moved more than 30 points between consecutive runs.
              </li>
            </ul>
            <div className="mt-3 border-t border-ice-100 pt-3">
              <div className="eyebrow mb-1.5">By type</div>
              {byType.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {byType.map(([type, count]) => (
                    <Badge key={type} tone="neutral">
                      {alertMeta(type as never).label}: {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">No alert types present.</p>
              )}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="eyebrow mb-2">Acknowledgement</div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Acknowledging hides an alert from the open list but keeps it in history. Acknowledgements are stored in
              your browser only - nothing is written to the backend.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => list.forEach((a) => acknowledgeAlert(a.id))}
                disabled={!open.length}
              >
                <IconCheck width={14} height={14} /> Acknowledge all
              </Button>
            </div>
          </Panel>
        </aside>
      </section>

      <section className="mb-5">
        <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-navy-900">
          <IconBell width={16} height={16} className="text-blue-600" />
          Watchlist risk
        </h2>
        {watchedRows.length ? (
          <RiskRanking
            items={watchedRows}
            onSelect={selectRegion}
            selectedId={selectedRegionId}
            limit={20}
            emptyTitle="None of your watched regions are ranked for this lead day."
          />
        ) : (
          <EmptyState
            title="Your watchlist is empty for this lead day."
            description="Star regions on the map, the regions page or the dashboard to track them here."
          />
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(regions.length ? regions : risk.data ?? []).slice(0, 30).map((r) => {
            const on = watchlist.includes(r.region_id);
            return (
              <button
                key={r.region_id}
                onClick={() => toggleWatchlist(r.region_id)}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                  on
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-ice-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {on ? <IconStarFilled width={11} height={11} /> : <IconStar width={11} height={11} />}
                {r.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Context"
          title="Lead-day context"
          subtitle="Network-wide confidence so an alert can be judged against the wider picture."
        />
        <div className="mt-3">
          {networkStrip.length ? (
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {networkStrip.map((cell) => (
                <button
                  key={cell.lead_day}
                  onClick={() => setLeadDay(cell.lead_day)}
                  className={`min-w-[96px] rounded-lg border px-3 py-2.5 text-left transition ${
                    cell.lead_day === leadDay
                      ? 'border-blue-400 bg-blue-50 shadow-lift'
                      : 'border-ice-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">D{cell.lead_day}</div>
                  <div className="data-value mt-1 text-lg font-bold leading-none text-navy-900">
                    {cell.confidence}%
                  </div>
                  <div className="data-value mt-1 text-[10px] text-slate-500">bust {pct(cell.bust_probability)}</div>
                </button>
              ))}
            </div>
          ) : (
            <SkeletonPanel lines={2} />
          )}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Newest alert: {list[0] ? `${list[0].region_name} - ${relativeTime(list[0].created_at)}` : 'none'}.
        </p>
      </section>

      <RegionDrawer />
    </>
  );
}
