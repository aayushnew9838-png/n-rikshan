import type { MultiModelAgreement, VariableKey } from '../../types';
import { VARIABLES } from '../../types';
import { cn } from '../../utils/cn';
import { num } from '../../utils/format';
import { Badge, SegmentedControl, InfoTip } from '../ui/primitives';

const MODEL_COLORS: Record<string, string> = {
  GFS: '#1c6fb2',
  ECMWF: '#2c7fbe',
  ICON: '#5aa8e4',
  GEM: '#7ec8e8',
};

export function MultiModelAgreementPanel({
  agreement,
  variable,
  onVariableChange,
  unavailableReason,
}: {
  agreement: MultiModelAgreement | null;
  variable: VariableKey;
  onVariableChange?: (v: VariableKey) => void;
  unavailableReason?: string;
}) {
  if (!agreement) {
    return (
      <section className="panel p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
            Forecast model agreement
            <InfoTip text="Spread across GFS, ECMWF IFS, ICON and GEM forecast centres." />
          </h3>
          <Badge tone="neutral">Not available</Badge>
        </div>
        <div className="rounded-lg border border-dashed border-ice-300 bg-ice-25 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-navy-900">Per-model values are not published for this view.</p>
          <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-slate-500">
            {unavailableReason ?? 'Multi-model spread is unavailable until the service exposes per-model forecasts.'}
          </p>
        </div>
      </section>
    );
  }

  const values = agreement.models.map((m) => m.value).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((s, v) => s + v, 0) / (values.length || 1);
  const σ = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length || 1));
  const span = max - min;
  const high = agreement.spread !== null && agreement.spread > 0;

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
            Forecast model agreement
            <InfoTip text="Disagreement between forecast centres. These are forecast models — not ensemble members." />
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Multi-model spread features consumed by the bust detector</p>
        </div>
        <div className="flex items-center gap-2">
          {onVariableChange && (
            <SegmentedControl
              ariaLabel="Variable"
              size="sm"
              value={variable}
              onChange={onVariableChange}
              options={VARIABLES.map((v) => ({ value: v.key, label: v.label.split(' ')[0] }))}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {agreement.models.map((m) => {
            const relative = max === min ? 1 : ((m.value ?? min) - min) / (max - min);
            return (
              <div key={m.name} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-[12px] font-bold text-navy-800">{m.name}</span>
                <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-ice-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-700 ease-smooth"
                    style={{
                      width: `${18 + relative * 78}%`,
                      background: MODEL_COLORS[m.name] ?? '#5aa8e4',
                      opacity: 0.85,
                    }}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center data-value text-[12px] font-bold text-navy-900 mix-blend-multiply">
                    {m.value ?? '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-ice-200 bg-ice-25 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="eyebrow !text-[9px]">Spread (range)</div>
              <div className="data-value text-xl font-bold text-navy-900">{num(agreement.spread, 2)}</div>
            </div>
            <div>
              <div className="eyebrow !text-[9px]">σ</div>
              <div className="data-value text-xl font-bold text-navy-900">{num(σ, 2)}</div>
            </div>
            <div>
              <div className="eyebrow !text-[9px]">Mean</div>
              <div className="data-value text-xl font-bold text-navy-900">{num(mean, 2)}</div>
            </div>
          </div>
          <div className="mt-3 border-t border-ice-200 pt-3">
            <div className="eyebrow mb-1">Interpretation</div>
            <p
              className={cn(
                'text-[13px] font-semibold leading-snug',
                high ? 'text-risk-critical' : 'text-emerald-700',
              )}
            >
              {high ? 'High disagreement' : 'Low disagreement'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{agreement.interpretation}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
            Range {num(min, 2)} – {num(max, 2)}
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-ice-100 pt-3 text-[11px] text-slate-500">
        Spread is reported as <span className="font-semibold text-navy-800">multi-model spread</span> across forecast
        centres. These are four independent deterministic forecasts, not ensemble members.
      </p>
    </section>
  );
}
