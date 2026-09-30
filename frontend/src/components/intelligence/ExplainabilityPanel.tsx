import type { Explanation, ReasonItem } from '../../types';
import { signed } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Badge, InfoTip } from '../ui/primitives';
import { IconBulb, IconBook } from '../ui/icons';

const GENERAL_CONTEXT = [
  'Multi-model spread measures how far GFS, ECMWF IFS, ICON and GEM disagree. Wide spread is a classic precursor of medium-range forecast failure.',
  'A forecast "bust" is an absolute error above the 90th percentile for that variable and lead day, estimated from the training period only.',
  'Confidence is defined as 100 × (1 − calibrated bust probability), used consistently across the interface.',
  'Skill naturally declines with lead time as dynamical error grows; Day 6–10 is the medium-range window where bust risk accumulates.',
];

export function ExplainabilityPanel({
  bustProbability,
  confidence,
  contributions,
  modelReasons,
  stabilizers,
  compact = false,
}: {
  bustProbability: number;
  confidence: number;
  contributions: ReasonItem[];
  modelReasons: string[];
  stabilizers?: string[];
  compact?: boolean;
}) {
  const maxAbs = Math.max(0.0001, ...contributions.map((c) => Math.abs(c.contribution)));
  const positive = contributions.filter((c) => c.contribution > 0);
  const negative = contributions.filter((c) => c.contribution <= 0);

  return (
    <div className="space-y-4">
      {/* headline ------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-ice-200 bg-white p-4 shadow-soft">
        <div>
          <div className="eyebrow">Bust probability</div>
          <div className="data-value mt-1 text-4xl font-bold leading-none text-risk-critical">
            {Math.round(bustProbability * 100)}
            <span className="text-xl">%</span>
          </div>
        </div>
        <div className="h-10 w-px bg-ice-200" />
        <div>
          <div className="eyebrow">Confidence</div>
          <div className="data-value mt-1 text-4xl font-bold leading-none text-navy-900">
            {Math.round(confidence)}
            <span className="text-xl">%</span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1.5">
          <span className="text-[10px] text-slate-400">SHAP TreeExplainer contributions</span>
        </div>
      </div>

      {/* SHAP bars ------------------------------------------------------ */}
      {!compact && (
        <section className="panel p-4" aria-labelledby="shap-title">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 id="shap-title" className="flex items-center gap-2 text-sm font-bold text-navy-900">
              Explainable risk drivers
              <Badge tone="blue">Model-derived</Badge>
              <InfoTip text="SHAP contribution of each feature to this specific prediction. Positive values push the bust probability up." />
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Contribution</span>
          </div>

          {contributions.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No feature contributions were reported for this prediction.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {contributions.map((c) => {
                const width = (Math.abs(c.contribution) / maxAbs) * 100;
                const up = c.contribution > 0;
                return (
                  <li key={c.feature}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-[11px] font-semibold text-navy-800">{c.feature}</span>
                      <span
                        className={cn(
                          'data-value shrink-0 text-[11px] font-bold',
                          up ? 'text-risk-critical' : 'text-emerald-600',
                        )}
                      >
                        {signed(c.contribution)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ice-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-smooth"
                        style={{
                          width: `${Math.max(4, width)}%`,
                          background: up
                            ? 'linear-gradient(90deg,#ef9455,#dd5145)'
                            : 'linear-gradient(90deg,#7ec8e8,#3fae87)',
                        }}
                      />
                    </div>
                    {c.reason && <p className="mt-1 text-[11px] leading-snug text-slate-500">{c.reason}</p>}
                  </li>
                );
              })}
            </ul>
          )}

          {positive.length > 0 && negative.length > 0 && (
            <p className="mt-3 border-t border-ice-100 pt-2.5 text-[11px] text-slate-500">
              Bars in <span className="font-semibold text-risk-critical">coral</span> raise the bust probability; bars in{' '}
              <span className="font-semibold text-emerald-600">green</span> lower it.
            </p>
          )}
        </section>
      )}

      {/* plain language -------------------------------------------------- */}
      <section className="panel p-4" aria-labelledby="plain-title">
        <h3 id="plain-title" className="mb-2.5 flex items-center gap-2 text-sm font-bold text-navy-900">
          <IconBulb width={16} height={16} className="text-blue-500" />
          What the model is telling us
          <Badge tone="blue">Model-derived</Badge>
        </h3>
        {modelReasons.length ? (
          <ul className="space-y-2">
            {modelReasons.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-600">
                <span className="data-value mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ice-100 text-[10px] font-bold text-blue-600">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No plain-language reasons were returned for this prediction.</p>
        )}

        {stabilizers && stabilizers.length > 0 && (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="eyebrow mb-1.5 !text-emerald-700">Stabilising factors</div>
            <ul className="space-y-1">
              {stabilizers.map((s, i) => (
                <li key={i} className="text-[12px] leading-relaxed text-emerald-800">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* general context -------------------------------------------------- */}
      {!compact && (
        <section className="rounded-xl border border-ice-200 bg-ice-25 p-4" aria-labelledby="ctx-title">
          <h3 id="ctx-title" className="mb-2.5 flex items-center gap-2 text-sm font-bold text-navy-800">
            <IconBook width={16} height={16} className="text-slate-400" />
            General meteorological context
            <Badge tone="neutral">Not model output</Badge>
          </h3>
          <ul className="space-y-1.5">
            {GENERAL_CONTEXT.map((c, i) => (
              <li key={i} className="text-[12px] leading-relaxed text-slate-500">
                — {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function buildExplanation(contributions: ReasonItem[], modelReasons: string[]): Explanation {
  return {
    contributions,
    model_reasons: modelReasons,
    context: GENERAL_CONTEXT,
  };
}
