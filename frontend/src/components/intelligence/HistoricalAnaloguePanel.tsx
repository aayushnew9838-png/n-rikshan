import type { HistoricalAnalogs, HistoricalCase } from '../../types';
import { formatUtc, pct } from '../../utils/format';
import { Badge, ProbabilityBar } from '../ui/primitives';
import { IconHistory } from '../ui/icons';

export function HistoricalAnaloguePanel({
  analogs,
  history,
  source,
  compact = false,
}: {
  analogs?: HistoricalAnalogs;
  history?: HistoricalCase[];
  source: 'live' | 'demo';
  compact?: boolean;
}) {
  const cases =
    analogs?.similar_cases?.map((c) => ({
      valid_time: c.valid_time,
      lead_day: c.lead_day,
      similarity: c.similarity_score ?? 0,
      was_bust: Boolean(c.overall_bust),
      admin1: c.admin1,
      error: undefined as number | undefined,
    })) ??
    (history ?? []).slice(0, compact ? 5 : 12).map((h) => ({
      valid_time: h.valid_time,
      lead_day: h.lead_day,
      similarity: 0,
      was_bust: h.was_bust,
      admin1: undefined,
      error: h.actual_error,
    }));

  const n = analogs?.n_analogs ?? cases.length;
  const rate = analogs?.historical_bust_rate;

  return (
    <section className="panel overflow-hidden" aria-labelledby="analogue-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ice-100 px-4 py-3">
        <h3 id="analogue-title" className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <IconHistory width={16} height={16} className="text-blue-500" />
          Similar historical situations
        </h3>
        <Badge tone={source === 'demo' ? 'demo' : 'blue'}>{source === 'demo' ? 'Demo dataset' : 'Analogue engine'}</Badge>
      </div>

      {rate !== undefined && (
        <div className="grid grid-cols-2 gap-3 border-b border-ice-100 bg-ice-25 px-4 py-3 sm:grid-cols-3">
          <div>
            <div className="eyebrow !text-[9px]">Similar historical situations</div>
            <div className="data-value text-xl font-bold text-navy-900">{n}</div>
          </div>
          <div>
            <div className="eyebrow !text-[9px]">Historical bust rate</div>
            <div className="data-value text-xl font-bold text-risk-critical">{pct(rate)}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="eyebrow !text-[9px]">Interpretation</div>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              {rate >= 0.7
                ? 'Comparable situations have failed far more often than not.'
                : rate >= 0.4
                  ? 'Comparable situations fail roughly half the time.'
                  : 'Comparable situations have usually verified well.'}
            </p>
          </div>
        </div>
      )}

      {analogs?.summary_statement && (
        <p className="border-b border-ice-100 px-4 py-2.5 text-[12px] leading-relaxed text-slate-600">
          {analogs.summary_statement}
        </p>
      )}

      <div className="max-h-[320px] overflow-y-auto">
        {cases.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            No historical analogues were returned for this region.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ice-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2 font-semibold">Valid time (UTC)</th>
                <th className="px-2 py-2 font-semibold">Lead</th>
                {cases[0].error !== undefined && <th className="px-2 py-2 font-semibold">Error</th>}
                <th className="px-2 py-2 font-semibold">Outcome</th>
                {!compact && <th className="px-4 py-2 font-semibold">Similarity</th>}
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={`${c.valid_time}-${i}`} className="border-b border-ice-50 last:border-0 hover:bg-ice-25">
                  <td className="data-value px-4 py-2 text-[11px] text-navy-800">{formatUtc(c.valid_time)}</td>
                  <td className="data-value px-2 py-2 text-[11px] text-slate-600">D{c.lead_day}</td>
                  {cases[0].error !== undefined && (
                    <td className="data-value px-2 py-2 text-[11px] text-slate-600">
                      {c.error?.toFixed(2) ?? '—'}
                    </td>
                  )}
                  <td className="px-2 py-2">
                    <span
                      className="rounded px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        background: c.was_bust ? '#fdeceb' : '#e8f6f1',
                        color: c.was_bust ? '#c93f34' : '#1e7a5b',
                      }}
                    >
                      {c.was_bust ? 'Bust' : 'No bust'}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-4 py-2">
                      {c.similarity > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ice-100">
                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(100, c.similarity * 100)}%` }} />
                          </div>
                          <span className="data-value text-[10px] text-slate-500">{pct(c.similarity, 1)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
