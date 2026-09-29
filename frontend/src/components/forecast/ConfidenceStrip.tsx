import { cn } from '../../utils/cn';
import type { ReliabilityCell } from '../../types';
import { confidenceLabel, riskLabel } from '../../utils/risk';
import { InfoTip } from '../ui/primitives';

/**
 * Day 1 → Day 10 confidence strip.
 * `cells` must contain exactly one cell per lead day for the subject
 * (a selected region, or the network-wide mean).
 */
export function ConfidenceStrip({
  cells,
  selectedDay,
  onSelectDay,
  title,
  subtitle,
}: {
  cells: (ReliabilityCell & { label?: string })[];
  selectedDay: number;
  onSelectDay?: (d: number) => void;
  title?: string;
  subtitle?: string;
}) {
  const sorted = [...cells].sort((a, b) => a.lead_day - b.lead_day);

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            {title ?? 'Day 1–10 confidence'}
            <InfoTip text="Confidence = 100 × (1 − calibrated forecast bust probability)." />
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#4fa8dd' }} /> High</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#2c7fbe' }} /> Moderate</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#f0a15c' }} /> Low</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#e2574c' }} /> Very low</span>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {sorted.map((cell) => {
          const active = cell.lead_day === selectedDay;
          const color = cell.confidence >= 80 ? '#4fa8dd' : cell.confidence >= 60 ? '#2c7fbe' : cell.confidence >= 40 ? '#f0a15c' : '#e2574c';
          const isSelected = onSelectDay;
          return (
            <button
              key={cell.lead_day}
              onClick={() => onSelectDay?.(cell.lead_day)}
              disabled={!isSelected}
              aria-pressed={active}
              aria-label={`Day ${cell.lead_day}: confidence ${cell.confidence} percent, bust probability ${Math.round(cell.bust_probability * 100)} percent, ${confidenceLabel(cell.confidence)} confidence`}
              className={cn(
                'group relative min-w-[92px] flex-1 overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ease-smooth',
                active
                  ? 'border-blue-400 bg-blue-50 shadow-lift'
                  : 'border-ice-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft',
                !isSelected && 'cursor-default',
              )}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-1"
                style={{ background: `linear-gradient(90deg, ${color} ${cell.confidence}%, #eef4fa ${cell.confidence}%)` }}
              />
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">D{cell.lead_day}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: color }}
                  title={confidenceLabel(cell.confidence)}
                />
              </div>
              <div className="data-value mt-1 text-lg font-bold leading-none text-navy-900">{cell.confidence}%</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="data-value text-[10px] font-semibold text-slate-500">
                  bust {Math.round(cell.bust_probability * 100)}%
                </span>
                <span className="text-[9px] font-bold uppercase" style={{ color }}>
                  {confidenceLabel(cell.confidence)}
                </span>
              </div>
              <div className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                risk {riskLabel(cell.bust_probability)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
