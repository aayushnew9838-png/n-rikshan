import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { VerificationPoint } from '../../types';
import { formatUtc } from '../../utils/format';

const AXIS = { stroke: '#c8d3de', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' };

export function ForecastVerificationChart({ points }: { points: VerificationPoint[] }) {
  const data = points.map((p) => ({
    label: formatUtc(p.valid_time).slice(5, 16),
    predicted: Math.round(p.predicted_bust_probability * 1000) / 10,
    error: p.actual_error,
    lead: p.lead_day,
    bust: p.was_bust,
  }));

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="eyebrow">Forecast vs verification</div>
          <p className="mt-0.5 text-xs text-slate-500">
            Predicted bust probability against the realised absolute forecast error for each verified valid time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Predicted bust prob (%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" /> Realised error
          </span>
        </div>
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="#eef4fa" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
            <YAxis yAxisId="left" tick={AXIS} tickLine={false} domain={[0, 100]} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={AXIS} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #d3e8f8',
                boxShadow: '0 10px 30px -12px rgba(11,31,56,.35)',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                name === 'predicted' ? `${value.toFixed(1)}%` : value.toFixed(2),
                name === 'predicted' ? 'Predicted bust probability' : 'Realised absolute error',
              ]}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload as { lead?: number; bust?: boolean } | undefined;
                return `${label} · Day ${p?.lead ?? '—'} · ${p?.bust ? 'BUST' : 'no bust'}`;
              }}
            />
            <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="left" y={50} stroke="#dd5145" strokeDasharray="4 4" />
            <Bar yAxisId="right" dataKey="error" name="Realised error" fill="#f5b183" radius={[3, 3, 0, 0]} barSize={16} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="predicted"
              name="Predicted bust probability"
              stroke="#1c6fb2"
              strokeWidth={2.4}
              dot={{ r: 3, fill: '#1c6fb2', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        The dashed red line marks the 50 % bust-probability decision threshold. Bars show the realised absolute error
        reported by the verification history for that valid time.
      </p>
    </div>
  );
}
