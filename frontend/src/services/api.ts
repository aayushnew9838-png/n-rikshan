/**
 * Central Nirikshan API client.
 *
 * Two backends exist in this repository:
 *   1. `backend/` FastAPI service   -> base + `/api/v1/...`
 *   2. `ml/src/inference/api.py`    -> base + `/health`, `/model-info`,
 *                                      `/predict`, `/predict/grid`, `/case-study/{id}`
 *
 * The client auto-probes the base URL once, remembers which prefix answered,
 * and normalises BOTH response shapes into one frontend contract
 * (see docs/frontend-api-contract.md).
 *
 * The client only ever speaks to the analysis service. When the service cannot
 * be reached every call rejects with `ApiUnavailableError`, and the UI renders
 * a neutral "intelligence unavailable" state with a retry action. No values are
 * ever invented client-side.
 */
import type {
  Alert,
  AnalyticsBundle,
  CaseStudy,
  DayWiseConfidence,
  EvaluationReport,
  ForecastRegion,
  HealthStatus,
  HistoricalCase,
  ModelInfo,
  MultiModelAgreement,
  OverviewStats,
  ReasonItem,
  RegionAnalysis,
  RegionInfo,
  ReliabilityCell,
  VerificationPoint,
  VariableKey,
} from '../types';
import { confidenceCategory, confidenceFromBust, bustRiskLevel } from '../utils/risk';
import { clamp } from '../utils/format';

/* ------------------------------------------------------------------ config */

const env = import.meta.env;

export const API_BASE: string = (env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000';
export const SPLINE_SCENE: string = (env.VITE_SPLINE_SCENE as string | undefined) || '';

/* ------------------------------------------------------------------ errors */

export class ApiUnavailableError extends Error {
  constructor(message = 'Forecast intelligence temporarily unavailable.', public detail?: unknown) {
    super(message);
    this.name = 'ApiUnavailableError';
  }
}

export function isUnavailable(err: unknown): boolean {
  if (err instanceof ApiUnavailableError) return true;
  if (err instanceof Error && /failed to fetch|networkerror|load failed/i.test(err.message)) return true;
  return false;
}

/* ------------------------------------------------------------- base resolve */

type Prefix = '/api/v1' | '';

let cachedPrefix: Prefix | null = null;
let probing: Promise<Prefix> | null = null;

async function tryGet(url: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(url, { signal, headers: { accept: 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolvePrefix(): Promise<Prefix> {
  if (cachedPrefix) return cachedPrefix;
  if (!probing) {
    probing = (async () => {
      const candidates: Prefix[] = ['/api/v1', ''];
      for (const p of candidates) {
        if (await tryGet(`${API_BASE}${p}/health`)) {
          cachedPrefix = p;
          return p;
        }
      }
      throw new ApiUnavailableError();
    })().finally(() => {
      probing = null;
    });
  }
  return probing;
}

export function resetProbe(): void {
  cachedPrefix = null;
  probing = null;
}

/** Prefix resolved by the last successful probe ('' until then). */
export function currentPrefix(): Prefix {
  return cachedPrefix ?? '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const prefix = await resolvePrefix();
  const url = `${API_BASE}${prefix}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'content-type': 'application/json', accept: 'application/json', ...(init?.headers ?? {}) },
        });
  } catch (err) {
    cachedPrefix = null;
    throw new ApiUnavailableError('Forecast intelligence temporarily unavailable.', err);
  }
  if (!res.ok) {
    if (res.status === 404) {
      throw new ApiUnavailableError('The analysis service does not expose this capability.', { status: 404, path });
    }
    throw new ApiUnavailableError(`The analysis service responded with an error (${res.status}).`, {
      status: res.status,
      path,
    });
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------- normalisers */

function toCell(regionId: string, leadDay: number, bust: number): ReliabilityCell {
  const p = clamp(Number(bust) || 0, 0, 1);
  const confidence = confidenceFromBust(p);
  return {
    region_id: regionId,
    lead_day: leadDay,
    bust_probability: Math.round(p * 1000) / 1000,
    confidence,
    confidence_category: confidenceCategory(confidence),
    bust_risk: bustRiskLevel(p),
  };
}

function normalizeReasons(raw: unknown): ReasonItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (item && typeof item === 'object' && 'feature' in item) {
      const r = item as { feature: string; contribution: number; reason?: string };
      return { feature: r.feature, contribution: Number(r.contribution) || 0, reason: r.reason ?? '' };
    }
    return { feature: String(item), contribution: 0, reason: String(item) };
  });
}

interface RawPredictResponse {
  region_id?: string;
  loc_id?: string;
  lead_day: number;
  lead_hours?: number;
  bust_probability: number;
  raw_probability?: number;
  confidence?: number;
  confidence_label?: string;
  risk_category?: string;
  top_reasons?: unknown;
  reasons?: string[];
  stabilizers?: string[];
  variable_bust_probabilities?: Record<string, number>;
  historical_analogs?: {
    n_analogs?: number;
    historical_bust_rate?: number;
    summary_statement?: string;
    similar_cases?: unknown[];
  };
  model_version?: string;
  timestamp?: string;
}

function normalizePrediction(raw: RawPredictResponse): RegionAnalysis {
  const p = clamp(Number(raw.bust_probability) || 0, 0, 1);
  const confidence = confidenceFromBust(p);
  const shapReasons = normalizeReasons(raw.top_reasons);
  const plain = Array.isArray(raw.reasons) ? raw.reasons.map(String) : shapReasons.map((r) => r.reason);
  const analogs = raw.historical_analogs;
  return {
    region_id: String(raw.region_id ?? raw.loc_id ?? ''),
    lead_day: Number(raw.lead_day) || 1,
    lead_hours: raw.lead_hours,
    bust_probability: p,
    raw_probability: raw.raw_probability,
    confidence,
    confidence_category: confidenceCategory(confidence),
    bust_risk: bustRiskLevel(p),
    reasons: shapReasons,
    plain_reasons: plain,
    stabilizers: Array.isArray(raw.stabilizers) ? raw.stabilizers.map(String) : [],
    variable_bust_probabilities: (raw.variable_bust_probabilities ?? undefined) as
      | Partial<Record<VariableKey, number>>
      | undefined,
    historical_analogs: analogs
      ? {
          n_analogs: Number(analogs.n_analogs ?? 0),
          historical_bust_rate: Number(analogs.historical_bust_rate ?? 0),
          summary_statement: analogs.summary_statement,
          similar_cases: (analogs.similar_cases ?? []) as RegionAnalysis['historical_analogs'] extends undefined
            ? never
            : NonNullable<RegionAnalysis['historical_analogs']>['similar_cases'],
        }
      : undefined,
    model_version: raw.model_version,
    timestamp: raw.timestamp,
  };
}

/** Detects a region catalogue emitted without the loaded reference dataset. */
function looksLikeFallbackCatalogue(regions: RegionInfo[]): boolean {
  if (regions.length === 0) return true;
  const inIndia = regions.filter((r) => r.lat >= 5 && r.lat <= 38 && r.lon >= 65 && r.lon <= 100);
  return inIndia.length === 0;
}

/* ------------------------------------------------------------------ health */

export async function getHealth(): Promise<HealthStatus> {
  const prefix = await resolvePrefix();
  const raw = await request<{ status?: string; model_loaded?: boolean; models_ready?: boolean; model_version?: string | null }>(
    '/health',
  );
  return {
    status: String(raw.status ?? 'ok'),
    model_loaded: Boolean(raw.model_loaded ?? raw.models_ready),
    model_version: raw.model_version ?? null,
    prefix,
  };
}

/* ----------------------------------------------------------------- regions */

interface RawRegions {
  regions: { region_id: string; name: string; lat: number; lon: number; admin1?: string }[];
}

export async function getRegions(): Promise<RegionInfo[]> {
  const raw = await request<RawRegions>('/forecast/regions');
  return raw.regions ?? [];
}

interface RawSummary {
  summaries: { region_id: string; lead_day: number; bust_probability: number; confidence?: number; risk_level?: string }[];
}

export async function getSummary(days = 10): Promise<ReliabilityCell[]> {
  const raw = await request<RawSummary>(`/forecast/summary?days=${days}`);
  return (raw.summaries ?? []).map((s) => toCell(s.region_id, s.lead_day, s.bust_probability));
}

/* ------------------------------------------------------------ high-level API */

export interface OverviewData {
  stats: OverviewStats;
  regions: RegionInfo[];
  cells: ReliabilityCell[];
  notes: string[];
}

function buildOverview(regions: RegionInfo[], cells: ReliabilityCell[], leadDay: number): OverviewData {
  const dayCells = cells.filter((c) => c.lead_day === leadDay);
  const nameOf = (id: string) => regions.find((r) => r.region_id === id)?.name ?? id;
  const highRisk = dayCells.filter((c) => c.bust_probability >= 0.5);
  const sorted = [...dayCells].sort((a, b) => a.confidence - b.confidence);
  const byBust = [...dayCells].sort((a, b) => b.bust_probability - a.bust_probability);
  const meanConfidence = dayCells.length
    ? Math.round((dayCells.reduce((s, c) => s + c.confidence, 0) / dayCells.length) * 10) / 10
    : 0;

  return {
    regions,
    cells,
    notes: [],
    stats: {
      forecasts_analysed: dayCells.length,
      high_risk_regions: highRisk.length,
      lowest_confidence: sorted[0]
        ? { region_id: sorted[0].region_id, region_name: nameOf(sorted[0].region_id), confidence: sorted[0].confidence }
        : null,
      highest_bust_probability: byBust[0]
        ? {
            region_id: byBust[0].region_id,
            region_name: nameOf(byBust[0].region_id),
            bust_probability: byBust[0].bust_probability,
          }
        : null,
      mean_confidence: meanConfidence,
      lead_day: leadDay,
    },
  };
}

export async function getOverview(leadDay: number): Promise<OverviewData> {
  const [regions, cells] = await Promise.all([getRegions(), getSummary(10)]);
  const notes: string[] = [];
  if (looksLikeFallbackCatalogue(regions)) {
    notes.push(
      'Region catalogue incomplete - the reference dataset has not been loaded on the analysis service.',
    );
  }
  const overview = buildOverview(regions, cells, leadDay);
  overview.notes = notes;
  return overview;
}

export interface ConfidenceMapData {
  lead_day: number;
  regions: ForecastRegion[];
  high_risk_count: number;
  total: number;
  notes: string[];
}

export async function getConfidenceMap(leadDay: number): Promise<ConfidenceMapData> {
  const [regions, cells] = await Promise.all([getRegions(), getSummary(10)]);
  const byRegion = new Map(regions.map((r) => [r.region_id, r]));
  const day = cells.filter((c) => c.lead_day === leadDay);
  const points: ForecastRegion[] = [];
  for (const cell of day) {
    const region = byRegion.get(cell.region_id);
    if (!region) continue;
    points.push({ ...region, ...cell, lead_day: leadDay });
  }
  return {
    lead_day: leadDay,
    regions: points,
    high_risk_count: points.filter((p) => p.bust_probability >= 0.5).length,
    total: points.length,
    notes: looksLikeFallbackCatalogue(regions)
      ? ['Region catalogue incomplete - the reference dataset has not been loaded on the analysis service.']
      : [],
  };
}

export async function getDayWiseConfidence(): Promise<DayWiseConfidence> {
  const [regions, cells] = await Promise.all([getRegions(), getSummary(10)]);
  const days = Array.from(new Set(cells.map((c) => c.lead_day))).sort((a, b) => a - b);
  return { regions, days: days.length ? days : Array.from({ length: 10 }, (_, i) => i + 1), cells };
}

export interface RiskArea extends RegionInfo {
  lead_day: number;
  bust_probability: number;
  confidence: number;
  confidence_category: ReturnType<typeof confidenceCategory>;
  bust_risk: ReturnType<typeof bustRiskLevel>;
}

export async function getRiskAreas(leadDay: number, limit = 20): Promise<RiskArea[]> {
  const map = await getConfidenceMap(leadDay);
  return [...map.regions]
    .sort((a, b) => b.bust_probability - a.bust_probability)
    .slice(0, limit)
    .map((r) => ({
      region_id: r.region_id,
      name: r.name,
      lat: r.lat,
      lon: r.lon,
      admin1: r.admin1,
      lead_day: r.lead_day,
      bust_probability: r.bust_probability,
      confidence: r.confidence,
      confidence_category: r.confidence_category,
      bust_risk: r.bust_risk,
    }));
}

export async function getRegionDetails(regionId: string, leadDay: number): Promise<RegionAnalysis> {
  const raw = await request<RawPredictResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify({ region_id: regionId, lead_day: leadDay }),
  });
  return normalizePrediction(raw);
}

export async function getExplainability(regionId: string, leadDay: number): Promise<RegionAnalysis> {
  return getRegionDetails(regionId, leadDay);
}

export async function getHistoricalAnalogues(regionId: string, limit = 20): Promise<HistoricalCase[]> {
  const raw = await request<{ region_id: string; history: unknown[] }>(`/history/${encodeURIComponent(regionId)}?limit=${limit}`);
  return (raw.history ?? []).map((h) => {
    const item = h as { valid_time: string; lead_day: number; bust_probability: number; actual_error: number; was_bust: boolean };
    return {
      valid_time: item.valid_time,
      lead_day: Number(item.lead_day) || 1,
      bust_probability: Number(item.bust_probability) || 0,
      actual_error: Number(item.actual_error) || 0,
      was_bust: Boolean(item.was_bust),
    };
  });
}

export async function getForecastVerification(regionId: string): Promise<VerificationPoint[]> {
  const history = await getHistoricalAnalogues(regionId, 40);
  return history.map((h) => ({
    valid_time: h.valid_time,
    lead_day: h.lead_day,
    predicted_bust_probability: h.bust_probability,
    actual_error: h.actual_error,
    was_bust: h.was_bust,
  }));
}

/* ------------------------------------------------------------------- alerts */

export async function getAlerts(leadDay: number): Promise<Alert[]> {
  const map = await getConfidenceMap(leadDay);
  const prevMap = leadDay > 1 ? await getConfidenceMap(leadDay - 1) : null;
  const prevById = new Map((prevMap?.regions ?? []).map((r) => [r.region_id, r]));
  const now = new Date().toISOString();
  const alerts: Alert[] = [];

  for (const r of map.regions) {
    if (r.bust_probability >= 0.75) {
      alerts.push({
        id: `LIVE_HB_${r.region_id}_${leadDay}`,
        type: 'HIGH_BUST_PROBABILITY',
        region_id: r.region_id,
        region_name: r.name,
        lead_day: leadDay,
        bust_probability: r.bust_probability,
        confidence: r.confidence,
        reason: `Calibrated bust probability ${Math.round(r.bust_probability * 100)}% reached the critical band for Day ${leadDay}.`,
        created_at: now,
        status: 'open',
      });
    } else if (r.confidence < 40) {
      alerts.push({
        id: `LIVE_VL_${r.region_id}_${leadDay}`,
        type: 'VERY_LOW_CONFIDENCE',
        region_id: r.region_id,
        region_name: r.name,
        lead_day: leadDay,
        bust_probability: r.bust_probability,
        confidence: r.confidence,
        reason: `Forecast confidence ${r.confidence}% is below the 40% very-low threshold for Day ${leadDay}.`,
        created_at: now,
        status: 'open',
      });
    }
    const before = prevById.get(r.region_id);
    if (before && before.confidence - r.confidence >= 12) {
      alerts.push({
        id: `LIVE_CD_${r.region_id}_${leadDay}`,
        type: 'CONFIDENCE_DETERIORATION',
        region_id: r.region_id,
        region_name: r.name,
        lead_day: leadDay,
        bust_probability: r.bust_probability,
        confidence: r.confidence,
        reason: `Confidence fell ${Math.round(before.confidence - r.confidence)} points from Day ${leadDay - 1} to Day ${leadDay}.`,
        created_at: now,
        status: 'open',
      });
    }
  }

  return alerts.sort((a, b) => b.bust_probability - a.bust_probability).slice(0, 40);
}

/* ------------------------------------------------------------- case studies */

const KNOWN_CASE_IDS = [
  'CASE_SUCCESSFUL_BUST_DETECTION_1255364',
  'CASE_SUCCESSFUL_NORMAL_FORECAST_1257629',
  'CASE_FALSE_ALARM_CASE_1255364',
];

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const out: CaseStudy[] = [];
  for (const id of KNOWN_CASE_IDS) {
    try {
      const raw = await request<Record<string, unknown>>(`/case-study/${encodeURIComponent(id)}`);
      out.push({ ...(raw as unknown as CaseStudy) });
    } catch {
      /* endpoint belongs to the ML service only — skip silently */
    }
  }
  if (!out.length) throw new ApiUnavailableError('Historical case studies are not available from the analysis service.');
  return out;
}

/* --------------------------------------------------------------- model info */

export async function getModelInfo(): Promise<ModelInfo> {
  const health = await getHealth();
  let raw: Record<string, unknown> = {};
  try {
    raw = await request<Record<string, unknown>>('/model-info');
  } catch {
    /* ML service only */
  }
  const modelCard = (raw.model_card ?? raw) as Record<string, unknown>;
  const splits = (modelCard.training_period ?? modelCard.split_manifest ?? {}) as Record<string, unknown>;
  return {
    model_name: typeof modelCard.model_name === 'string' ? modelCard.model_name : undefined,
    model_version: health.model_version ?? (typeof modelCard.model_version === 'string' ? modelCard.model_version : undefined),
    calibration_method: typeof modelCard.calibration_method === 'string' ? modelCard.calibration_method : undefined,
    n_features: typeof modelCard.n_features === 'number' ? modelCard.n_features : undefined,
    primary_target: typeof modelCard.primary_target === 'string' ? modelCard.primary_target : undefined,
    training_period: typeof splits.train === 'string' ? splits.train : undefined,
    validation_period: typeof splits.validation === 'string' ? splits.validation : undefined,
    test_period: typeof splits.test === 'string' ? splits.test : undefined,
    last_model_update: typeof modelCard.timestamp === 'string' ? modelCard.timestamp : undefined,
    top_features: Array.isArray(modelCard.top_features)
      ? (modelCard.top_features as { feature: string; importance: number }[])
      : undefined,
    raw: Object.keys(modelCard).length ? modelCard : undefined,
  };
}

/* --------------------------------------------------------------- multi-model */

/**
 * Per-model forecast values are an input to the ML feature engine, not an output
 * of the analysis service. Until the service exposes them we return `null` and
 * the UI renders an explicit "not available for this view" state — model values
 * are never invented client-side.
 */
export async function getMultiModel(): Promise<MultiModelAgreement | null> {
  return null;
}

/* ---------------------------------------------------------------- analytics */

export async function getEvaluationReport(): Promise<EvaluationReport | null> {
  try {
    return await request<EvaluationReport>('/reports/evaluation-summary');
  } catch {
    return null;
  }
}

export async function getAnalytics(leadDays: number): Promise<AnalyticsBundle> {
  const [regions, cells, report] = await Promise.all([getRegions(), getSummary(leadDays), getEvaluationReport()]);
  const notes: string[] = [];

  const bust_by_lead: AnalyticsBundle['bust_rate_by_lead'] = [];
  const conf_by_lead: AnalyticsBundle['confidence_by_lead'] = [];
  for (let d = 1; d <= leadDays; d += 1) {
    const day = cells.filter((c) => c.lead_day === d);
    if (!day.length) continue;
    bust_by_lead.push({
      lead_day: d,
      bust_rate: day.reduce((s, c) => s + c.bust_probability, 0) / day.length,
      n: day.length,
    });
    conf_by_lead.push({
      lead_day: d,
      mean_confidence: day.reduce((s, c) => s + c.confidence, 0) / day.length,
    });
  }

  const regional = new Map<string, { id: string; name: string; sum: number; n: number }>();
  for (const c of cells) {
    const name = regions.find((r) => r.region_id === c.region_id)?.name ?? c.region_id;
    const entry = regional.get(c.region_id) ?? { id: c.region_id, name, sum: 0, n: 0 };
    entry.sum += c.bust_probability;
    entry.n += 1;
    regional.set(c.region_id, entry);
  }
  const regional_risk = [...regional.values()]
    .map((e) => ({ region_id: e.id, region_name: e.name, mean_bust_probability: e.sum / e.n, n: e.n }))
    .sort((a, b) => b.mean_bust_probability - a.mean_bust_probability);

  if (!report) {
    notes.push('Held-out evaluation results are not published by the analysis service.');
    notes.push('Model-comparison, calibration and variable-wise charts stay hidden until they are.');
  }

  return {
    bust_rate_by_lead: bust_by_lead,
    confidence_by_lead: conf_by_lead,
    regional_risk,
    model_comparison: report?.model_comparison
      ? Object.entries(report.model_comparison).map(([model, m]) => ({
          model,
          roc_auc: m.roc_auc ?? null,
          pr_auc: m.pr_auc ?? null,
          brier: m.brier_score ?? null,
          f1: m.f1 ?? null,
        }))
      : undefined,
    variable_performance: report?.variable_models
      ? Object.entries(report.variable_models).map(([variable, m]) => ({
          variable,
          roc_auc: m.roc_auc ?? null,
          pr_auc: m.pr_auc ?? null,
          brier: m.brier_score ?? null,
        }))
      : undefined,
    notes,
  };
}
