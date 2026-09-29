import type { Alert, AlertType } from '../../types';
import { cn } from '../../utils/cn';
import { relativeTime } from '../../utils/format';
import { Badge, Button } from '../ui/primitives';
import { IconBell, IconAlert, IconEye, IconCheck, IconStar } from '../ui/icons';

const TYPE_META: Record<AlertType, { label: string; tone: 'critical' | 'high' | 'moderate' | 'low'; color: string }> = {
  VERY_LOW_CONFIDENCE: { label: 'Very low confidence', tone: 'critical', color: '#dd5145' },
  HIGH_BUST_PROBABILITY: { label: 'High bust probability', tone: 'critical', color: '#dd5145' },
  CONFIDENCE_DETERIORATION: { label: 'Confidence deterioration', tone: 'high', color: '#ef9455' },
  HIGH_MODEL_DISAGREEMENT: { label: 'High model disagreement', tone: 'high', color: '#ef9455' },
  ANOMALOUS_FORECAST_BEHAVIOUR: { label: 'Anomalous forecast behaviour', tone: 'moderate', color: '#f2c14e' },
};

export function alertMeta(type: AlertType) {
  return TYPE_META[type] ?? { label: type, tone: 'low' as const, color: '#7ec8e8' };
}

export function AlertPanel({
  alerts,
  acknowledged,
  onAcknowledge,
  onOpen,
  onWatch,
  limit,
  emptyTitle = 'No active alerts for the selected lead time.',
}: {
  alerts: Alert[];
  acknowledged: string[];
  onAcknowledge?: (id: string) => void;
  onOpen?: (regionId: string) => void;
  onWatch?: (regionId: string) => void;
  limit?: number;
  emptyTitle?: string;
}) {
  const rows = limit ? alerts.slice(0, limit) : alerts;

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ice-300 bg-ice-25 px-5 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <IconBell width={18} height={18} />
        </div>
        <p className="text-sm font-semibold text-navy-900">{emptyTitle}</p>
        <p className="max-w-sm text-xs text-slate-500">
          Alerts are generated when confidence, bust probability or model spread cross their configured thresholds.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((alert) => {
        const meta = alertMeta(alert.type);
        const isAck = acknowledged.includes(alert.id);
        return (
          <li
            key={alert.id}
            className={cn(
              'group rounded-lg border bg-white px-3.5 py-3 transition-all duration-200 ease-smooth',
              isAck ? 'border-ice-200 opacity-60' : 'border-ice-200 hover:-translate-y-[1px] hover:border-blue-200 hover:shadow-soft',
            )}
            style={{ borderLeft: `3px solid ${meta.color}` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wider text-white"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[13px] font-semibold text-navy-900">{alert.region_name}</span>
                  <span className="data-value text-[11px] text-slate-400">Day {alert.lead_day}</span>
                  <Badge tone={alert.source === 'demo' ? 'demo' : 'blue'}>
                    {alert.source === 'demo' ? 'Demo' : 'Live'}
                  </Badge>
                  {isAck && <Badge tone="neutral">Acknowledged</Badge>}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{alert.reason}</p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <div className="data-value text-lg font-bold leading-none text-risk-critical">
                    {Math.round(alert.bust_probability * 100)}%
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">bust prob</div>
                </div>
                <div className="text-right">
                  <div className="data-value text-lg font-bold leading-none text-navy-900">{alert.confidence}%</div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">confidence</div>
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-ice-50 pt-2.5">
              <span className="mr-auto flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <IconAlert width={11} height={11} />
                {relativeTime(alert.created_at)}
              </span>
              <Button variant="ghost" className="!px-2 !py-1 !text-[11px]" onClick={() => onOpen?.(alert.region_id)}>
                <IconEye width={13} height={13} /> Open region
              </Button>
              <Button variant="ghost" className="!px-2 !py-1 !text-[11px]" onClick={() => onWatch?.(alert.region_id)}>
                <IconStar width={13} height={13} /> Watch
              </Button>
              {!isAck && onAcknowledge && (
                <Button variant="ghost" className="!px-2 !py-1 !text-[11px]" onClick={() => onAcknowledge(alert.id)}>
                  <IconCheck width={13} height={13} /> Acknowledge
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
