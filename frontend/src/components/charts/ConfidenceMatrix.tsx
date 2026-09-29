import { useMemo } from 'react';
import type { DayWiseConfidence, RegionInfo } from '../../types';
import { confidenceLabel, confidenceColor } from '../../utils/risk';
import { cn } from '../../utils/cn';

/**
 * Region × Day 1–10 confidence matrix — the single densest view of
 * "how much should I trust this forecast?".
 */
export function ConfidenceMatrix({
  data,
  onCellClick,
  onRegionClick,
  selectedRegionId,
  maxRows = 40,
}: {
  data: { regions: RegionInfo[]; days: number[]; cells: Map<string, number> };
  onCellClick?: (regionId: string, day: number) => void;
  onRegionClick?: (regionId: string) => void;
  selectedRegionId?: string | null;
  maxRows?: number;
}) {
  const rows = useMemo(() => {
    const sorted = [...data.regions].sort((a, b) => {
      const aMin = Math.min(...data.days.map((d) => data.cells.get(`${a.region_id}:${d}`) ?? 100));
      const bMin = Math.min(...data.days.map((d) => data.cells.get(`${b.region_id}:${d}`) ?? 100));
      return aMin - bMin;
    });
    return sorted.slice(0, maxRows);
  }, [data, maxRows]);

  return (
    <div className="panel overflow-hidden">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ice-200 bg-ice-25">
              <th className="sticky left-0 z-10 min-w-[168px] bg-ice-25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Region
              </th>
              {data.days.map((d) => (
                <th
                  key={d}
                  className="min-w-[62px] px-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
                >
                  D{d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((region) => (
              <tr
                key={region.region_id}
                className={cn(
                  'border-b border-ice-50 last:border-0',
                  selectedRegionId === region.region_id && 'bg-blue-50/60',
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    'sticky left-0 z-10 cursor-pointer bg-white px-4 py-1.5 text-left text-[12px] font-semibold text-navy-900 transition-colors hover:text-blue-600',
                    selectedRegionId === region.region_id && 'bg-blue-50',
                  )}
                  onClick={() => onRegionClick?.(region.region_id)}
                >
                  <span className="block truncate">{region.name}</span>
                  <span className="block truncate text-[9px] font-normal text-slate-400">{region.admin1}</span>
                </th>
                {data.days.map((d) => {
                  const conf = data.cells.get(`${region.region_id}:${d}`);
                  if (conf === undefined) {
                    return <td key={d} className="px-1 py-1.5 text-center text-[10px] text-slate-300">—</td>;
                  }
                  const color = confidenceColor(conf);
                  return (
                    <td key={d} className="px-1 py-1.5">
                      <button
                        onClick={() => onCellClick?.(region.region_id, d)}
                        aria-label={`${region.name} day ${d}: confidence ${conf} percent, ${confidenceLabel(conf)} confidence`}
                        title={`${region.name} · Day ${d} · confidence ${conf}% · ${confidenceLabel(conf)}`}
                        className="group relative block h-9 w-full rounded-md transition-transform duration-150 hover:scale-[1.08] hover:shadow-lift"
                        style={{
                          background: `${color}${conf >= 80 ? '33' : conf >= 60 ? '4d' : conf >= 40 ? '59' : '66'}`,
                          border: `1px solid ${color}`,
                        }}
                      >
                        <span
                          className="data-value absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                          style={{ color: conf < 50 ? '#0b1f38' : '#0b1f38' }}
                        >
                          {conf}
                        </span>
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
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-semibold text-slate-500">
          {[
            { label: 'HIGH ≥ 80', color: '#4fa8dd' },
            { label: 'MODERATE 60–79', color: '#2c7fbe' },
            { label: 'LOW 40–59', color: '#f0a15c' },
            { label: 'VERY LOW < 40', color: '#e2574c' },
          ].map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ background: `${b.color}59`, border: `1px solid ${b.color}` }} />
              {b.label}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          Values are confidence % = 100 × (1 − bust probability). Click any cell for full analysis.
        </span>
      </div>
    </div>
  );
}

export function buildMatrix(d: DayWiseConfidence): { regions: RegionInfo[]; days: number[]; cells: Map<string, number> } {
  const cells = new Map<string, number>();
  for (const c of d.cells) cells.set(`${c.region_id}:${c.lead_day}`, c.confidence);
  return { regions: d.regions, days: d.days, cells };
}
