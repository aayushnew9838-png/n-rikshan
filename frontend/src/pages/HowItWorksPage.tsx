import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel, SectionTitle, Badge, Button, InfoTip } from '../components/ui/primitives';
import { ConfidenceStrip } from '../components/forecast/ConfidenceStrip';
import { pct, humanizeFeature } from '../utils/format';
import { FEATURE_IMPORTANCE, TEMPORAL_TEST, NATIONAL_POS_RATE } from '../data/demo/evalReport';
import type { ReliabilityCell } from '../types';
import { num } from '../utils/format';
import {
  IconLayers,
  IconCpu,
  IconShield,
  IconTarget,
  IconBulb,
  IconHistory,
  IconCompare,
  IconArrowRight,
  IconCheck,
} from '../components/ui/icons';

const PIPELINE = [
  {
    step: '01',
    icon: IconLayers,
    title: 'Assemble predictors',
    body: 'Medium-range model fields (GFS, ECMWF, ICON, GEM), ensemble and multi-model spread features, plus terrain and seasonality context, are assembled for each location, variable and lead day.',
  },
  {
    step: '02',
    icon: IconTarget,
    title: 'Define the bust label',
    body: 'A forecast is labelled a bust when the realised error exceeds a published threshold for that variable. The threshold is part of the contract, not an implicit choice.',
  },
  {
    step: '03',
    icon: IconCpu,
    title: 'Model & calibrate',
    body: 'A gradient-boosted classifier estimates the raw bust probability, which is then calibrated with isotonic regression on a temporally held-out split so stated probabilities are honest.',
  },
  {
    step: '04',
    icon: IconBulb,
    title: 'Explain the call',
    body: 'SHAP values rank which features moved the prediction for this specific case, and a statement generator turns them into plain language.',
  },
  {
    step: '05',
    icon: IconHistory,
    title: 'Consult history',
    body: 'The verification history for the same location and lead day supplies analogues and a historical bust rate as context.',
  },
  {
    step: '06',
    icon: IconShield,
    title: 'Verify & alert',
    body: 'Predictions are compared against realised error, aggregated into lead-day and regional analytics, and escalated into alerts when thresholds are crossed.',
  },
];

const BANDS = [
  { min: 80, label: 'HIGH', color: '#4fa8dd', meaning: 'Calibrated bust probability 0-20%. Safe to plan against this run.' },
  { min: 60, label: 'MODERATE', color: '#2c7fbe', meaning: 'Bust probability 20-40%. Usable, but keep an eye on the drivers.' },
  { min: 40, label: 'LOW', color: '#f0a15c', meaning: 'Bust probability 40-60%. Treat the run as a scenario, not a plan.' },
  { min: 0, label: 'VERY LOW', color: '#e2574c', meaning: 'Bust probability above 60%. Do not rely on this run.' },
];

const FAQ = [
  {
    q: 'Why calibrate at all?',
    a: 'A raw classifier score is not a probability. Calibration makes "60% bust" actually mean bust 6 times in 10, which is what makes the confidence band meaningful.',
  },
  {
    q: 'Why a temporal split?',
    a: 'Random splits leak the future into training. A temporal split evaluates the model the way it will be used: trained on the past, scored on what comes next.',
  },
  {
    q: 'What is SHAP doing here?',
    a: 'SHAP attributes the difference between this prediction and the baseline to individual features. It explains the model, not the atmosphere - that distinction is kept explicit in the UI.',
  },
  {
    q: 'Why show multi-model spread if it is a feature?',
    a: 'Because it is one of the strongest drivers in the model. Surfacing it lets a forecaster sanity-check the call against their own reading of the ensemble.',
  },
  {
    q: 'What happens when the backend is down?',
    a: 'The client probes the base URL, remembers the resolved prefix, and falls back to a documented demo dataset with a persistent banner. Live and demo values are never mixed inside one response.',
  },
];

function exampleCells(): ReliabilityCell[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => {
    const bust = Math.min(0.72, 0.12 + (d - 1) * 0.065);
    return {
      region_id: '__example__',
      lead_day: d,
      bust_probability: Math.round(bust * 1000) / 1000,
      confidence: Math.round(100 * (1 - bust)),
      confidence_category: bust < 0.2 ? 'HIGH_CONFIDENCE' : bust < 0.4 ? 'MODERATE_CONFIDENCE' : 'LOW_CONFIDENCE',
      bust_risk: bust < 0.25 ? 'low' : bust < 0.5 ? 'moderate' : 'high',
    };
  });
}

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [showLabels, setShowLabels] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Method"
        title="How It Works"
        description="The pipeline, the definitions and the honest limits - written so a reviewer can audit every number on screen."
        source="demo"
        actions={
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            See it running <IconArrowRight width={15} height={15} />
          </Button>
        }
      />

      <section className="mb-7">
        <SectionTitle
          eyebrow="Pipeline"
          title="From raw model output to a trustworthy number"
          subtitle="Six stages, each with an auditable artefact at the end."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE.map((p) => {
            const Icon = p.icon;
            return (
              <Panel key={p.step} className="relative overflow-hidden p-4" hover>
                <div className="absolute right-3 top-2 data-value text-[34px] font-extrabold leading-none text-ice-100">
                  {p.step}
                </div>
                <div className="relative mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon width={18} height={18} />
                </div>
                <h3 className="relative text-[14px] font-bold text-navy-900">{p.title}</h3>
                <p className="relative mt-1.5 text-[12px] leading-relaxed text-slate-600">{p.body}</p>
              </Panel>
            );
          })}
        </div>
      </section>

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="eyebrow flex items-center gap-1.5">
                The definition <InfoTip text="This is the single definition used everywhere in the interface." />
              </div>
              <p className="mt-1 text-sm text-slate-600">Confidence is derived, never reinterpreted.</p>
            </div>
            <Button variant="ghost" onClick={() => setShowLabels((v) => !v)}>
              {showLabels ? 'Hide worked example' : 'Show worked example'}
            </Button>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="data-value text-[15px] font-bold text-navy-900 sm:text-base">
              confidence = 100 x (1 - calibrated bust_probability)
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              Example: a calibrated bust probability of 0.34 gives a confidence of 66, which falls in the MODERATE band
              (60-79) with a bust risk of "moderate" (0.25-0.49).
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {BANDS.map((b) => (
              <div key={b.label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide text-white"
                  style={{ background: b.color }}
                >
                  {b.label}
                </span>
                <p className="text-[12px] leading-relaxed text-slate-600">{b.meaning}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-ice-50 p-3 text-[12px] leading-relaxed text-slate-600">
            The backend also reports its own confidence field based on a distance metric. This client deliberately
            ignores it and recomputes confidence from the calibrated probability so the two definitions can never drift
            apart silently.
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <div className="eyebrow mb-3">Worked lead-day profile</div>
            <ConfidenceStrip cells={exampleCells()} selectedDay={5} />
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Illustrative decay used only to demonstrate the strip component. Live panels always show values fetched
              from the backend or from the documented demo dataset.
            </p>
            {!showLabels && (
              <Button variant="ghost" className="mt-2 !px-0" onClick={() => setShowLabels(true)}>
                Show the numeric example
              </Button>
            )}
            {showLabels && (
              <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
                {exampleCells().map((c) => (
                  <li key={c.lead_day} className="data-value flex justify-between">
                    <span>D{c.lead_day}</span>
                    <span>
                      bust {pct(c.bust_probability)} -&gt; confidence {c.confidence}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </section>

      <section className="mb-7 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="eyebrow mb-3">Why the model sees what it sees</div>
          <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
            Feature importance from the published evaluation report - the same ordering the model was scored with.
          </p>
          <div className="space-y-1.5">
            {FEATURE_IMPORTANCE.slice(0, 12).map((f, i) => {
              const max = FEATURE_IMPORTANCE[0].importance;
              return (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="data-value w-5 shrink-0 text-[11px] font-bold text-slate-400">{i + 1}</span>
                  <span className="w-52 shrink-0 truncate text-[12px] font-medium text-navy-800">
                    {humanizeFeature(f.feature)}
                  </span>
                  <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ice-100">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                      style={{ width: `${Math.max(3, (f.importance / max) * 100)}%` }}
                    />
                  </span>
                  <span className="data-value w-14 shrink-0 text-right text-[11px] text-slate-500">
                    {num(f.importance, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="eyebrow mb-3">Evidence, not adjectives</div>
          <div className="space-y-3 text-[13px] leading-relaxed text-slate-700">
            <p className="flex gap-2.5">
              <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-teal-500" />
              Discrimination: ROC AUC {num(TEMPORAL_TEST.roc_auc, 3)} and PR AUC {num(TEMPORAL_TEST.pr_auc, 3)} on{' '}
              {TEMPORAL_TEST.n_samples.toLocaleString()} held-out samples.
            </p>
            <p className="flex gap-2.5">
              <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-teal-500" />
              Calibration: expected calibration error {num(TEMPORAL_TEST.ece, 3)}, Brier{' '}
              {num(TEMPORAL_TEST.brier_score, 3)} - stated probabilities are close to realised frequencies.
            </p>
            <p className="flex gap-2.5">
              <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-teal-500" />
              Base rate: positive rate {pct(NATIONAL_POS_RATE, 2)} on the test split, so PR AUC must be read against
              that baseline rather than against zero.
            </p>
            <p className="flex gap-2.5">
              <IconCompare width={16} height={16} className="mt-0.5 shrink-0 text-blue-500" />
              Operational view: the Verification module compares every stated probability with the realised error so
              the claims above can be re-checked at any time.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="low">Calibrated</Badge>
            <Badge tone="blue">Temporally split</Badge>
            <Badge tone="neutral">Per-prediction explainable</Badge>
            <Badge tone="demo">Demo badged</Badge>
          </div>
        </Panel>
      </section>

      <section className="mb-7">
        <SectionTitle eyebrow="FAQ" title="Questions a reviewer will ask" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {FAQ.map((f) => (
            <Panel key={f.q} className="p-4">
              <h3 className="text-[13px] font-bold text-navy-900">{f.q}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{f.a}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Button variant="primary" onClick={() => navigate('/map')} className="!py-3">
          Explore the map
        </Button>
        <Button variant="secondary" onClick={() => navigate('/verification')} className="!py-3">
          Check the verification
        </Button>
        <Button variant="secondary" onClick={() => navigate('/system')} className="!py-3">
          Inspect the model card
        </Button>
      </section>
    </>
  );
}
