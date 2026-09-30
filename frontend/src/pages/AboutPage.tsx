import { PageHeader } from '../components/layout/PageHeader';
import { Panel, SectionTitle, Badge, Button, Stat, InfoTip } from '../components/ui/primitives';
import { StatusBanner } from '../components/ui/states';
import { useShell } from '../hooks/useForecastData';
import { useNavigate } from 'react-router-dom';
import { TEMPORAL_TEST, DATASET_FACTS, EVAL_GENERATED_AT } from '../data/evaluation';
import { num, pct } from '../utils/format';
import { IconBook, IconTarget, IconShield, IconBulb, IconGlobe, IconArrowRight, IconWaves, IconInfo } from '../components/ui/icons';

const CAPABILITIES = [
  {
    icon: IconTarget,
    title: 'Forecast bust probability',
    body: 'A calibrated probability that the medium-range forecast for a location and lead day will realise a large error.',
  },
  {
    icon: IconBulb,
    title: 'Explainability',
    body: 'SHAP-ranked drivers plus plain-language statements for every single prediction, not a black-box score.',
  },
  {
    icon: IconGlobe,
    title: 'Regional intelligence',
    body: 'Confidence, risk, historical analogues and multi-model agreement for each location in the catalogue.',
  },
  {
    icon: IconWaves,
    title: 'Multi-model agreement',
    body: 'GFS, ECMWF, ICON and GEM comparison with an explicit spread interpretation for the selected variable.',
  },
  {
    icon: IconShield,
    title: 'Verification',
    body: 'Forecast against realised error over the published history, plus held-out evaluation metrics.',
  },
  {
    icon: IconBook,
    title: 'Alerts & watchlist',
    body: 'Threshold-based alerts you can acknowledge, and locations you personally track across lead days.',
  },
];

const LIMITS = [
  'Nirikshan does not issue a weather forecast - it scores forecasts produced by numerical models.',
  'Skill claims apply to the evaluated regions and the temporal test split, not to arbitrary locations or dates.',
  'Confidence below 40% should be treated as "do not rely on this run" rather than a pessimistic forecast.',
  'When the analysis service cannot be reached, affected views fall back to a clearly labelled bundled snapshot of published evaluation figures, with a retry action.',
  'No accuracy figure in this interface is hand-authored; each one is computed or transcribed from a published report.',
];

const ROLES = [
  { role: 'ML & calibration', detail: 'Feature pipeline, gradient-boosted bust model, isotonic calibration, evaluation harness.' },
  { role: 'Backend & data', detail: 'Analysis service, forecast and verification history, reference catalogue, alert derivation.' },
  { role: 'Frontend & design', detail: 'Forecast-reliability interface, map-first layout, explainability and verification modules.' },
  { role: 'Validation & write-up', detail: 'Case studies, analogue construction, problem framing and documentation.' },
];

export default function AboutPage() {
  const { retry, backendState } = useShell();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Nirikshan"
        description="AI-based forecast bust detection for medium-range weather forecasts. A reliability layer that tells you how much of the forecast to believe, and why."
        actions={
          <>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Open dashboard <IconArrowRight width={15} height={15} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/how-it-works')}>
              How it works
            </Button>
          </>
        }
      />

      <StatusBanner className="mb-5" onRetry={retry} />

      <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <div className="eyebrow mb-2">The problem</div>
          <p className="text-[14px] leading-relaxed text-slate-700">
            Medium-range forecasts are issued with confidence, but users have no reliable way to know when a given run
            is about to be wrong. When a forecast busts - when the realised error far exceeds what the forecast implied -
            the cost lands on farmers, utilities, disaster-response teams and event organisers who trusted the number.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
            Existing tools show the forecast. Almost none show how much of it deserves to be believed on that day, for
            that location, at that lead time.
          </p>

          <div className="eyebrow mb-2 mt-5">The solution</div>
          <p className="text-[14px] leading-relaxed text-slate-700">
            Nirikshan learns from the verification history of past forecasts and produces a calibrated{' '}
            <span className="data-value font-semibold">bust probability</span> for each location, variable and lead day.
            Confidence is then defined as{' '}
            <span className="data-value font-semibold">100 x (1 - calibrated bust probability)</span>, with explicit
            bands so the interface never implies precision it does not have.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
            Every number is accompanied by why: SHAP-ranked drivers, plain-language statements, historical analogues
            and multi-model agreement - then verified against what actually happened.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            <div className="eyebrow mb-3">At a glance</div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Held-out ROC AUC" value={num(TEMPORAL_TEST.roc_auc, 3)} tone="calm" />
              <Stat label="Held-out PR AUC" value={num(TEMPORAL_TEST.pr_auc, 3)} tone="calm" />
              <Stat label="Calibration ECE" value={num(TEMPORAL_TEST.ece, 3)} />
              <Stat label="Brier score" value={num(TEMPORAL_TEST.brier_score, 3)} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Held-out evaluation on the temporal test split, {TEMPORAL_TEST.n_samples.toLocaleString()} samples,
              positive rate {pct(TEMPORAL_TEST.pos_rate, 2)}. Report dated {EVAL_GENERATED_AT.slice(0, 10)}.
            </p>
          </Panel>

          <Panel className="p-4">
            <div className="eyebrow mb-2">Analysis service</div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Probe state</span>
              <Badge tone={backendState === 'online' ? 'blue' : 'neutral'}>{backendState}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/system')}>
                System details
              </Button>
              <Button variant="ghost" onClick={() => navigate('/case-studies')}>
                Case studies
              </Button>
            </div>
          </Panel>
        </div>
      </section>

      <section className="mb-6">
        <SectionTitle
          eyebrow="Capabilities"
          title="What the platform does"
          subtitle="Six modules, one question: how much of this forecast should I believe?"
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <Panel key={c.title} className="p-4" hover>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon width={18} height={18} />
                </div>
                <h3 className="text-[14px] font-bold text-navy-900">{c.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{c.body}</p>
              </Panel>
            );
          })}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="eyebrow mb-2 flex items-center gap-1.5">
            <IconShield width={14} height={14} /> Honest limits
            <InfoTip text="Stated up front so nothing in the interface is read as more certain than it is." />
          </div>
          <ul className="space-y-2.5">
            {LIMITS.map((l) => (
              <li key={l} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {l}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <div className="eyebrow mb-2">Dataset</div>
          <dl className="space-y-2 text-[13px]">
            {Object.entries(DATASET_FACTS)
              .slice(0, 8)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-ice-50 pb-1.5 last:border-0">
                  <dt className="text-slate-500">{k.replace(/_/g, ' ')}</dt>
                  <dd className="data-value text-right font-semibold text-navy-800">
                    {typeof v === 'number' ? v.toLocaleString() : String(v)}
                  </dd>
                </div>
              ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Truth labels come from a reanalysis-grade reference dataset; predictors come from operational medium-range
            model output. The split is temporal so the evaluation reflects deployment, not leakage.
          </p>
        </Panel>
      </section>

      <section className="mb-6">
        <SectionTitle
          eyebrow="Delivery"
          title="How the work is split"
          subtitle="Four contributions, one integrated system."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Panel key={r.role} className="p-4">
              <div className="data-value mb-1.5 text-[11px] font-bold text-blue-600">0{i + 1}</div>
              <h3 className="text-[14px] font-bold text-navy-900">{r.role}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{r.detail}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Individual contributor names are intentionally not listed here - add them to this page once the team confirms
          how they want to be credited.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <div className="eyebrow mb-3">Frequently asked</div>
          <div className="space-y-3.5">
            {[
              {
                q: 'Is Nirikshan a weather forecast?',
                a: 'No. It scores forecasts produced by numerical models and tells you how likely that forecast is to bust.',
              },
              {
                q: 'What does 70% confidence actually mean?',
                a: 'A calibrated statement that there is a 30% chance of a bust for that location, variable and lead day. Because it is calibrated, the frequency should match the stated probability.',
              },
              {
                q: 'Why are some panels empty?',
                a: 'Because the analysis service returned no data for this view. Empty states are shown honestly rather than being filled with invented rows.',
              },
              {
                q: 'How does the interface reach its data?',
                a: 'The client probes the analysis service once, remembers the resolved route, and requests every view from it. Live values come only from the service; the bundled snapshot is used solely when it cannot be reached and is labelled as such.',
              },
              {
                q: 'What happens when the analysis service cannot be reached?',
                a: 'Affected views fall back to a labelled bundled snapshot of published evaluation figures with a retry action, and the request is repeated once the service responds again.',
              },
            ].map((f) => (
              <details key={f.q} className="group rounded-lg border border-ice-200 bg-white px-4 py-3">
                <summary className="cursor-pointer list-none text-[13px] font-semibold text-navy-900 marker:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <div className="eyebrow mb-2">Next steps</div>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Operations dashboard <IconArrowRight width={15} height={15} />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/verification')}>
                Forecast vs verification
              </Button>
              <Button variant="secondary" onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to introduction
              </Button>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="eyebrow mb-2 flex items-center gap-1.5">
              <IconInfo width={14} height={14} /> Documented contract
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600">
              The client and the analysis service share a documented contract covering every route, normalisation rule
              and response shape, so both sides can be audited together.
            </p>
          </Panel>
        </div>
      </section>
    </>
  );
}
