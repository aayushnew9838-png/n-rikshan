# Frontend API Contract — Nirikshan (SIH26079)

Version 1.0 · Frontend client: `frontend/src/services/api.ts`

This document records every backend call the frontend makes, how each response is
normalised, what the UI computes locally, and exactly when demo data is used.
It exists so the client and the two backends can be audited together.

---

## 1. Base URL and prefix probe

| Setting | Source | Default |
|---|---|---|
| `VITE_API_BASE_URL` | `.env` / environment | `http://localhost:8000` |
| `VITE_DEMO_MODE` | `.env` / environment | unset (auto) |
| `VITE_SPLINE_SCENE` | `.env` / environment | `''` (hero falls back to CSS canvas) |

Two backends can answer on the same port:

1. **Forecast backend** (`backend/`) → routes under `/api/v1`
2. **ML service** (`ml/src/inference/api.py`) → routes at the root

The client calls `resolvePrefix()` once per session:

1. Try `GET {base}/api/v1/health`
2. On failure try `GET {base}/health`
3. Cache the prefix that answered (`'/api/v1'` or `''`) for all subsequent requests
4. `resetProbe()` clears the cache — called when the user retries or changes data mode

`currentPrefix()` exposes the cached value so the System page can display it.

---

## 2. Data mode rules (never mix live and demo)

| `VITE_DEMO_MODE` | Behaviour |
|---|---|
| `true` / `1` | **Demo forced.** `DEMO_FORCED = true`, banner always shown. |
| `false` / `0` | **Live forced.** `DEMO_DISABLED = true`, no demo fallback is offered. |
| unset | **Auto.** Probe the backend; if offline after the first health check, fall back to demo and show the banner with a *Retry* action. |

`useIsDemo()` resolves to `true` when any of the following hold:

- `DEMO_FORCED`
- store `mode === 'demo'`
- store `mode === 'auto'` **and** `backendState === 'offline'`

Rules enforced in code:

- A single response never mixes live and demo values — the whole view switches source.
- Demo data is always badged (`DataSourceBadge` + `BackendBanner`).
- A manual *Switch to demo* button is offered only when the backend is unreachable in auto mode.
- The store persists `mode`, so a user's explicit choice survives reloads.

---

## 3. Endpoints consumed

### 3.1 Forecast backend

| Method | Path | Client function | Notes |
|---|---|---|---|
| GET | `/health` | `getHealth()` | Also used for the shell probe; sets `backendState`. |
| GET | `/forecast/regions` | `getRegions()` | Region catalogue (id, name, lat, lon, admin1). |
| GET | `/forecast/summary?days=` | `getSummary(days)` | `ReliabilityCell[]` — region × lead-day bust probability. |
| GET | `/forecast/summary?days=` | `getOverview(leadDay)` | Derived: `stats`, `regions`, `cells`, `notes`. |
| GET | `/forecast/summary?days=` | `getConfidenceMap(leadDay)` | Derived: map regions + `total`, `high_risk_count`, `notes`. |
| GET | `/forecast/summary?days=` | `getDayWiseConfidence()` | `{ regions, days[1..10], cells }`. |
| GET | `/forecast/summary?days=` | `getRiskAreas(leadDay, limit)` | Regions sorted by bust probability. |
| GET | `/history/{region_id}?limit=` | `getHistoricalAnalogues(id, limit)` | Verification history. |
| — | *(derived)* | `getForecastVerification(id)` | Maps history → `VerificationPoint[]`. |
| — | *(derived)* | `getAlerts(leadDay)` | Alerts computed from the current and previous lead day. |

`POST /predict` is available for single-point scoring; the dashboard views are
built from the summary endpoint so one request serves the whole map.

### 3.2 ML service (optional)

| Method | Path | Client function | Notes |
|---|---|---|---|
| GET | `/model-info` | `getModelInfo()` | Optional; failure is swallowed and `undefined` fields are shown as `-`. |
| GET | `/reports/evaluation-summary` | `getEvaluationReport()` | Optional; returns `null` when absent. |
| GET | `/predict` (composed) | `getMultiModel()` | Optional multi-model comparison. |
| GET | `/case-study/{id}` | `getCaseStudies()` | Optional curated case studies. |

When these are unavailable the UI falls back to the **transcribed** evaluation
values in `src/data/demo/evalReport.ts`, which come from
`ml/reports/evaluation_summary.json`, `ml/reports/final_results.md`,
`ml/reports/feature_importance.md` and `ml/artifacts/split_manifest.json`.

---

## 4. The confidence definition

```
confidence = 100 × (1 − calibrated bust_probability)
```

- Displayed value: rounded to 1 decimal for derived stats, integer for cells.
- The backend's own `confidence` field (a distance metric) is **ignored** so the
  two definitions cannot drift apart silently.
- Bands (from `src/utils/risk.ts`):

| Confidence | Label | Colour |
|---|---|---|
| ≥ 80 | HIGH | `#4fa8dd` |
| 60 – 79 | MODERATE | `#2c7fbe` |
| 40 – 59 | LOW | `#f0a15c` |
| < 40 | VERY LOW / HIGH RISK | `#e2574c` |

| Bust probability | Risk label | Colour |
|---|---|---|
| < 0.25 | low | `#7ec8e8` |
| 0.25 – 0.49 | moderate | `#f2c14e` |
| 0.50 – 0.74 | high | `#ef9455` |
| ≥ 0.75 | critical | `#dd5145` |

---

## 5. Response normalisation

| Concern | Rule |
|---|---|
| Region payload shape | Accepts either `{regions: [...]}` or a bare array; each item normalised to `{region_id, name, lat, lon, admin1?}`. |
| Cell payload shape | Accepts `{cells: [...]}` or `{summary: [...]}` or a bare array → `ReliabilityCell[]`. |
| Numeric coercion | `Number(x) \|\| 0` for probabilities, `Boolean(x)` for `was_bust`, `Number(x) \|\| 1` for `lead_day`. |
| Confidence | Always recomputed as `100 × (1 − bust_probability)`. |
| Category / risk | Derived client-side from the bands above, never trusted from the payload. |
| Missing history | Rendered as an explicit empty state. Never padded with synthetic rows. |
| Fallback catalogue | Detected when the region list matches the placeholder set; surfaced as an amber `notes` banner. |

---

## 6. Error handling

| Class | Meaning | UI response |
|---|---|---|
| `ApiUnavailableError` | Network failure / unreachable host | `unavailable: true` → error panel with **Retry** and (in auto mode) **View cached demo analysis**. |
| HTTP 4xx/5xx with body | Backend answered but refused | Error panel with the response message, no demo offer. |
| Parse/validation failure | Unexpected payload | Error panel titled *"This module could not be loaded."* |

Every module uses `useAsync` → `{ data, loading, error, unavailable, reload }`,
so a panel can never render blank: it always shows skeleton, content, empty
state or error state.

---

## 7. Derived (client-side) layers

Two map layers are computed in the browser because no endpoint exposes them:

| Layer | Source | Concurrency | Cache key |
|---|---|---|---|
| `disagreement` | Sum of \|SHAP contribution\| over multi-model-spread features from `/predict` | 5 | `disagreement:{live\|demo}:{leadDay}:{regionIds}` |
| `error` | Mean realised `actual_error` from `/history` | 5 | `error:{live\|demo}:{leadDay}:{regionIds}` |

Both are min–max normalised across the plotted regions and labelled as derived.
If the underlying requests fail the layer reports *"Derived layer unavailable"*
instead of substituting values.

Other client-side computations:

- Network-wide confidence strip = mean bust probability per lead day.
- Alert rules (see `getAlerts`): critical bust probability, confidence < 40,
  ≥ 10-point confidence drop versus the previous lead day, spread-dominated SHAP
  drivers, ≥ 30-point run-over-run probability change.
- `watchlist` and `acknowledged` are **browser-local only** (zustand `persist`);
  nothing is written back to the backend.

---

## 8. Demo data provenance

| Module | Contents | Provenance |
|---|---|---|
| `data/demo/regions.ts` | 35 Indian regions with real coordinates | Real locations; three carry real `regionalBaseRate` values from the evaluation report. |
| `data/demo/evalReport.ts` | Lead-day / regional / model / variable statistics, feature importance, split manifest, dataset facts, bust thresholds | Transcribed verbatim from `ml/reports/*` and `ml/artifacts/*`. |
| `data/demo/caseStudies.ts` | 3 curated case studies | Real case-study records. |
| `data/demo/multiModel.ts` | GFS / ECMWF / ICON / GEM values | Real multi-model values. |
| `data/demo/dataset.ts` | Synthetic demo dataset | **Documented synthetic generator**, anchored on the real evaluation statistics; every panel it feeds is badged *Demo data*. |

Nothing in the interface presents a hard-coded accuracy claim: each metric is
either computed from a response or transcribed from a published report with its
source stated on screen.

---

## 9. Environment example

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
# VITE_DEMO_MODE=true     # force demo
# VITE_DEMO_MODE=false    # force live, disable demo fallback
# VITE_SPLINE_SCENE=https://prod.spline.design/....scene
```

No secrets belong in the frontend bundle — all keys here are public
configuration.

---

## 10. Route ↔ module map

| Route | Module |
|---|---|
| `/` | Product introduction (Spline hero with CSS fallback) |
| `/how-it-works` | Method, definitions, FAQ |
| `/dashboard` | Operations overview |
| `/map` | Forecast confidence map (5 layers) |
| `/lead-time` | Day 1–10 reliability matrix |
| `/bust-probability` | Bust probability matrix, histogram, ranking |
| `/error-prone` | Realised-error ranking + derived error layer |
| `/regions` | Regional dossier |
| `/explainability` | SHAP contributions and model stance |
| `/analogues` | Historical analogue scan |
| `/verification` | Forecast vs verification + held-out metrics |
| `/analytics` | Aggregates, calibration, regional risk |
| `/case-studies` | Curated bust events |
| `/alerts` | Alerts and watchlist |
| `/system` | Model card, evaluation, dataset, API & modes |
| `/about` | Problem, solution, limits, FAQ |

Keyboard: `[` / `]` step the lead day, `M` map, `D` dashboard, `Shift+?` method,
`Esc` closes the region drawer.
