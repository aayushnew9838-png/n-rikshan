import { cn } from '../../utils/cn';
import { confidenceLabel, riskLabel, confidenceColor, riskColor } from '../../utils/risk';
import { ProbabilityBar } from '../ui/primitives';
import { IconTarget, IconArrowRight } from '../ui/icons';

export interface RankedRisk {
  region_id: string;
  name: string;
  admin1?: string;
  lead_day: number;
  bust_probability: number;
  confidence: number;
}

export function RiskRanking({
  items,
  onSelect,
  selectedId,
  limit = 10,
  showConfidence = true,
  emptyTitle = 'No high-risk regions detected for the selected lead time.',
  emptyDescription,
}: {
  items: RankedRisk[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  limit?: number;
  showConfidence?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const rows = items.slice(0, limit);

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ice-300 bg-ice-25 px-5 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ice-100 text-blue-500">
          <IconTarget width={18} height={18} />
        </div>
        <p className="text-sm font-semibold text-navy-900">{emptyTitle}</p>
        {emptyDescription && <p className="max-w-sm text-xs text-slate-500">{emptyDescription}</p>}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.map((item, index) => {
        const active = selectedId === item.region_id;
        return (
          <li key={item.region_id}>
            <button
              onClick={() => onSelect?.(item.region_id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ease-smooth',
                active
                  ? 'border-blue-400 bg-blue-50 shadow-soft'
                  : 'border-ice-200 bg-white hover:-translate-y-[1px] hover:border-blue-200 hover:shadow-soft',
              )}
            >
              <span
                className="data-value flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                style={{ background: riskColor(item.bust_probability), color: item.bust_probability >= 0.5 ? '#fff' : '#0b1f38' }}
              >
                {index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[13px] font-semibold text-navy-900">{item.name}</span>
                  <span className="truncate text-[10px] text-slate-400">{item.admin1}</span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="data-value text-[10px] font-semibold text-slate-500">Day {item.lead_day}</span>
                  <span
                    className="rounded px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide"
                    style={{ background: `${confidenceColor(item.confidence)}22`, color: confidenceColor(item.confidence) }}
                  >
                    {confidenceLabel(item.confidence)}
                  </span>
                  <span className="text-[9px] font-semibold uppercase text-slate-400">
                    risk {riskLabel(item.bust_probability)}
                  </span>
                </span>
              </span>

              <span className="w-24 shrink-0">
                <ProbabilityBar value={item.bust_probability} />
                {showConfidence && (
                  <span className="mt-1 block text-right text-[9px] font-semibold text-slate-400">
                    conf {item.confidence}%
                  </span>
                )}
              </span>

              <IconArrowRight
                width={15}
                height={15}
                className="shrink-0 text-ice-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
