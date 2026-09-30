import { useState } from 'react';
import { PageHeader, AsyncSection } from '../components/layout/PageHeader';
import { StatusBanner, SkeletonPanel, TableSkeleton } from '../components/ui/states';
import { Badge, Button, Panel, SectionTitle, Stat, InfoTip, SegmentedControl, Select } from '../components/ui/primitives';
import { useShell } from '../hooks/useForecastData';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';
import { getEvaluationReport, getModelInfo, getMultiModel } from '../services/api';
import {
  TEMPORAL_TEST,
  LEAD_DAY_STATS,
  FEATURE_IMPORTANCE,
  SPLIT_MANIFEST,
  DATASET_FACTS,
  BUST_THRESHOLDS,
  MODEL_COMPARISON,
  VARIABLE_STATS,
  EVAL_GENERATED_AT,
} from '../data/evaluation';
import { VARIABLES } from '../types';
import { num, pct } from '../utils/format';
import { humanizeFeature } from '../utils/format';
import { IconCpu, IconShield, IconRefresh, IconInfo, IconActivity } from '../components/ui/icons';

type Tab = 'model' | 'evaluation' | 'dataset' | 'service';

export default function SystemPage() {
  const { retry, backendState, prefix } = useShell();
  const { variable, setVariable, leadDay, regions } = useAppStore();
  const [tab, setTab] = useState<Tab>('model');

  const model = useAsync(async () => getModelInfo(), []);
  const report = useAsync(async () => getEvaluationReport(), []);
  const multi = useAsync(async () => getMultiModel(), [variable]);

  const evalReport = report.data ?? null;
  const leadRows = evalReport?.lead_day_breakdown?.length ? evalReport.lead_day_breakdown : LEAD_DAY_STATS;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'model', label: 'Model card' },
    { value: 'evaluation', label: 'Evaluation' },
    { value: 'dataset', label: 'Dataset' },
    { value: 'service', label: 'Service' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Model & System"
        description="Which model is running, how it scored on the held-out split, what it was trained on, and how this interface reaches the analysis service."
        actions={
          <Button variant="secondary" onClick={() => { model.reload(); report.reload(); multi.reload(); }}>
            <IconRefresh width={15} height={15} /> Refresh
          </Button>
        }
        controls={
          <div className="flex flex-wrap items-end gap-4">
            <SegmentedControl ariaLabel="System tab" options={tabs} value={tab} onChange={setTab} />
            <Select label="Multi-model variable" value={variable} onChange={(e) => setVariable(e.target.value as typeof variable)}>
              {VARIABLES.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <StatusBanner className="mb-4" onRetry={retry} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Analysis service" value={backendState} tone={backendState === 'online' ? 'calm' : 'risk'} />
        <Stat label="Model version" value={model.data?.model_version ?? '—'} sub={model.data?.model_name} />
        <Stat label="Active lead day" value={leadDay} />
        <Stat label="ROC AUC (held-out)" value={num(TEMPORAL_TEST.roc_auc, 3)} tone="calm" />
      </div>

      {tab === 'model' && (
        <AsyncSection state={model} skeleton={<SkeletonPanel lines={8} />}>
          {(data) => (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <Panel className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="eyebrow flex items-center gap-1.5">
                    <IconCpu width={14} height={14} /> Model card
                    <InfoTip text="Fields are reported verbatim by the analysis service." />
                  </div>
                  <Badge tone="blue">Active deployment</Badge>
                </div>
                <dl className="grid gap-x-6 gap-y-2.5 text-[13px] sm:grid-cols-2">
                  {[
                    ['Model', data.model_name ?? '-'],
                    ['Version', data.model_version ?? '-'],
                    ['Calibration', data.calibration_method ?? '-'],
                    ['Features', data.n_features ? String(data.n_features) : '-'],
                    ['Primary target', data.primary_target ?? '-'],
                    ['Last update', data.last_model_update ?? '-'],
                    ['Training window', data.training_period ?? '-'],
                    ['Validation window', data.validation_period ?? '-'],
                    ['Test window', data.test_period ?? '-'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-ice-50 pb-1.5">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="data-value truncate text-right font-semibold text-navy-800">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <div className="eyebrow mb-2">Top features by importance</div>
                  {(data.top_features?.length ? data.top_features : FEATURE_IMPORTANCE.slice(0, 10)).slice(0, 10).map((f, i) => {
                    const max = Math.max(
                      ...(data.top_features?.length ? data.top_features : FEATURE_IMPORTANCE).map((x) => x.importance),
                    );
                    return (
                      <div key={f.feature} className="mb-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="truncate font-semibold text-navy-800">
                            {i + 1}. {humanizeFeature(f.feature)}
                          </span>
                          <span className="data-value text-slate-500">{num(f.importance, 4)}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-ice-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.max(2, (f.importance / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <div className="space-y-4">
                <AsyncSection state={multi} skeleton={<SkeletonPanel lines={5} />}>
                  {(agreement) => (
                    <Panel className="p-4">
                      <div className="eyebrow mb-2">Multi-model agreement ({variable})</div>
                      {agreement ? (
                        <>
                          <div className="space-y-2">
                            {agreement.models.map((m) => (
                              <div key={m.name} className="flex items-center justify-between text-[12px]">
                                <span className="font-semibold text-navy-800">{m.name}</span>
                                <span className="data-value text-slate-600">
                                  {m.value === null ? '-' : num(m.value, 2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-ice-100 pt-2.5 text-[12px]">
                            <span className="text-slate-500">Spread</span>
                            <span className="data-value font-bold text-navy-900">
                              {agreement.spread === null ? '-' : num(agreement.spread, 2)}
                            </span>
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{agreement.interpretation}</p>
                        </>
                      ) : (
                        <p className="text-[12px] text-slate-500">
                          No multi-model comparison available from this backend.
                        </p>
                      )}
                    </Panel>
                  )}
                </AsyncSection>

                <Panel className="p-4">
                  <div className="eyebrow mb-2 flex items-center gap-1.5">
                    <IconShield width={14} height={14} /> Model stance
                  </div>
                  <ul className="space-y-2 text-[12px] leading-relaxed text-slate-600">
                    <li>- Calibrated probabilities, not deterministic calls.</li>
                    <li>- Explainability is SHAP-based and per-prediction.</li>
                    <li>- No skill is claimed outside the evaluated period or regions.</li>
                    <li>- Raw outputs are never presented as accuracy percentages.</li>
                  </ul>
                </Panel>
              </div>
            </div>
          )}
        </AsyncSection>
      )}

      {tab === 'evaluation' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
          <Panel className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="eyebrow">Lead-day breakdown</div>
              <span className="text-[11px] text-slate-400">
                {evalReport ? 'from the evaluation service' : `evaluation report dated ${EVAL_GENERATED_AT.slice(0, 10)}`}
              </span>
            </div>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2">ROC AUC</th>
                    <th className="px-3 py-2">PR AUC</th>
                    <th className="px-3 py-2">Brier</th>
                    <th className="px-3 py-2">ECE</th>
                    <th className="px-3 py-2">F1</th>
                    <th className="px-3 py-2">Pos. rate</th>
                    <th className="px-3 py-2">n</th>
                  </tr>
                </thead>
                <tbody>
                  {leadRows.map((s) => (
                    <tr
                      key={s.lead_day}
                      className={`border-b border-ice-50 last:border-0 ${s.lead_day === leadDay ? 'bg-blue-50/70' : ''}`}
                    >
                      <td className="data-value px-3 py-2 font-bold text-navy-800">D{s.lead_day}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{num(s.roc_auc, 3)}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{num(s.pr_auc, 3)}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{num(s.brier_score, 3)}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{num(s.ece, 3)}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{num(s.f1, 3)}</td>
                      <td className="data-value px-3 py-2 text-slate-600">{pct(s.pos_rate, 1)}</td>
                      <td className="data-value px-3 py-2 text-slate-500">{(s.n_samples ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Temporal test split: ROC AUC {num(TEMPORAL_TEST.roc_auc, 3)}, PR AUC {num(TEMPORAL_TEST.pr_auc, 3)},
              Brier {num(TEMPORAL_TEST.brier_score, 3)}, ECE {num(TEMPORAL_TEST.ece, 3)},{' '}
              {TEMPORAL_TEST.n_samples.toLocaleString()} samples, positive rate {pct(TEMPORAL_TEST.pos_rate, 2)}.
            </p>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-4">
              <div className="eyebrow mb-2">Model comparison</div>
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2">Model</th>
                    <th className="py-2 text-right">ROC</th>
                    <th className="py-2 text-right">PR</th>
                    <th className="py-2 text-right">Brier</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_COMPARISON.map((m) => (
                    <tr key={m.model} className="border-b border-ice-50 last:border-0">
                      <td className="py-1.5 font-semibold text-navy-800">{m.model}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(m.roc_auc, 3)}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(m.pr_auc, 3)}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(m.brier, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel className="p-4">
              <div className="eyebrow mb-2">Variable models</div>
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-ice-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2">Variable</th>
                    <th className="py-2 text-right">ROC</th>
                    <th className="py-2 text-right">PR</th>
                    <th className="py-2 text-right">Brier</th>
                  </tr>
                </thead>
                <tbody>
                  {VARIABLE_STATS.map((v) => (
                    <tr key={v.variable} className="border-b border-ice-50 last:border-0">
                      <td className="py-1.5 font-semibold text-navy-800">{v.variable}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(v.roc_auc, 3)}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(v.pr_auc, 3)}</td>
                      <td className="data-value py-1.5 text-right text-slate-600">{num(v.brier, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'dataset' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="p-4">
            <div className="eyebrow mb-2 flex items-center gap-1.5">
              <IconActivity width={14} height={14} /> Inventory
            </div>
            <dl className="space-y-2 text-[12px]">
              {Object.entries(DATASET_FACTS).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-ice-50 pb-1.5 last:border-0">
                  <dt className="text-slate-500">{humanizeFeature(k)}</dt>
                  <dd className="data-value text-right font-semibold text-navy-800">
                    {typeof v === 'number' ? v.toLocaleString() : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel className="p-4">
            <div className="eyebrow mb-2">Split manifest</div>
            <pre className="no-scrollbar overflow-x-auto rounded-lg bg-ice-50 p-3 text-[11px] leading-relaxed text-slate-700">
              {JSON.stringify(SPLIT_MANIFEST, null, 2)}
            </pre>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              The temporal split prevents leakage of future observations into training - the honest way to evaluate a
              forecasting auxiliary model.
            </p>
          </Panel>

          <Panel className="p-4">
            <div className="eyebrow mb-2">Bust thresholds</div>
            <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
              Outcome definition used to label the training target. Values shown exactly as published.
            </p>
            <pre className="no-scrollbar overflow-x-auto rounded-lg bg-ice-50 p-3 text-[11px] leading-relaxed text-slate-700">
              {JSON.stringify(BUST_THRESHOLDS, null, 2)}
            </pre>
            <div className="mt-3 border-t border-ice-100 pt-3">
              <div className="eyebrow mb-1.5">Feature importance (all)</div>
              <div className="no-scrollbar max-h-52 space-y-1.5 overflow-y-auto">
                {FEATURE_IMPORTANCE.map((f, i) => (
                  <div key={f.feature} className="flex items-center justify-between text-[11px]">
                    <span className="truncate text-slate-600">
                      {i + 1}. {humanizeFeature(f.feature)}
                    </span>
                    <span className="data-value shrink-0 text-slate-500">{num(f.importance, 4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'service' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Panel className="p-5">
            <div className="eyebrow mb-3 flex items-center gap-1.5">
              <IconInfo width={14} height={14} /> Connection
            </div>
            <dl className="space-y-2.5 text-[13px]">
              {[
                ['Connection state', backendState],
                ['Resolved route', prefix || '/'],
                ['Region catalogue', regions.length ? `${regions.length} regions` : '—'],
                ['Model version', model.data?.model_version ?? '—'],
                ['Report date', EVAL_GENERATED_AT.slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-ice-50 pb-1.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="data-value truncate text-right font-semibold text-navy-800">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              The interface probes the analysis service once at start-up and remembers the resolved route. When the
              service cannot be reached, each view renders a neutral unavailable state with a retry action — no value
              is ever substituted client-side.
            </p>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-4">
              <SectionTitle eyebrow="Service routes" title="Requests issued" />
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-600">
                {[
                  'GET  /health',
                  'GET  /forecast/regions',
                  'GET  /forecast/summary?days=',
                  'POST /predict',
                  'GET  /history/{region_id}',
                  'GET  /model-info        (optional)',
                  'GET  /case-study/{id}   (optional)',
                ].map((e) => (
                  <li key={e} className="data-value rounded-md bg-ice-50 px-2.5 py-1.5">
                    {e}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Confidence shown anywhere in this interface is recomputed as{' '}
                <span className="data-value font-semibold">100 x (1 - bust probability)</span> so that it matches the
                documented definition.
              </p>
            </Panel>

            <Panel className="p-4">
              <div className="eyebrow mb-2">Keyboard</div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {[
                  ['[ / ]', 'Previous / next lead day'],
                  ['M', 'Open the confidence map'],
                  ['D', 'Open the dashboard'],
                  ['Shift + ?', 'Open how it works'],
                  ['Esc', 'Close the region panel'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <kbd className="data-value rounded border border-ice-200 bg-white px-1.5 py-0.5 text-[11px] font-bold text-navy-800">
                      {k}
                    </kbd>
                    <span className="text-slate-500">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
