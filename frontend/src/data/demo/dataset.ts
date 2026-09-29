/**
 * DEMO DATASET BUILDER.
 *
 * IMPORTANT — HONESTY NOTICE
 * --------------------------
 * Every value produced by this module is DEMO data. The UI renders a persistent
 * "DEMO DATA" badge whenever this module supplies values, and live mode never
 * falls back to it silently.
 *
 * The generator is *anchored* on real statistics published by the Nirikshan ML
 * pipeline (ml/reports/evaluation_summary.json, ml/reports/final_results.md,
 * ml/artifacts/bust_thresholds.json) so that the demo exhibits realistic
 * behaviour, but the per-region per-lead-day numbers themselves are synthesised
 * and must never be presented as model output.
 */
import type {
  Alert,
  CaseStudy,
  HistoricalCase,
  MultiModelAgreement,
  ReasonItem,
  ReliabilityCell,
  RegionAnalysis,
  VariableKey,
} from '../../types';
import { confidenceCategory, confidenceFromBust, bustRiskLevel } from '../../utils/risk';
import { clamp } from '../../utils/format';
import { DEMO_REGIONS, type DemoRegion } from './regions';
import { LEAD_DAY_STATS, REGIONAL_STATS, NATIONAL_POS_RATE } from './evalReport';
import { DEMO_CASE_STUDIES } from './caseStudies';
import { DEMO_MULTI_MODEL } from './multiModel';

export const DEMO_DAYS = Array.from({ length: 10 }, (_, i) => i + 1);

/** Deterministic 0..1 hash so the demo dataset is stable across reloads. */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function tiltOf(region: DemoRegion): number {
  return (hash01(region.region_id) - 0.5) * 0.34;
}

function statBiasOf(region: DemoRegion): number {
  if (region.regionalBaseRate === undefined) return 0;
  return (region.regionalBaseRate - NATIONAL_POS_RATE) * 0.55;
}

/** Synthetic calibrated bust probability for a demo region × lead day. */
export function demoBustProbability(region: DemoRegion, leadDay: number): number {
  const r = hash01(region.region_id);
  const tilt = tiltOf(region);
  const base = clamp(0.05 + tilt * 0.5 + statBiasOf(region), 0.012, 0.3);
  const amplitude = clamp(0.55 + (tilt + 0.17) * 1.65, 0.4, 1.15);
  const shape = Math.pow(Math.max(0, leadDay - 1) / 9, 0.78);
  const cycle = 0.03 * Math.sin(leadDay * 1.27 + r * 6.2831);
  return clamp(base + amplitude * shape + cycle, 0.01, 0.97);
}

export function demoCells(leadDay: number): ReliabilityCell[] {
  return DEMO_REGIONS.map((region) => {
    const p = demoBustProbability(region, leadDay);
    const confidence = confidenceFromBust(p);
    return {
      region_id: region.region_id,
      lead_day: leadDay,
      bust_probability: Math.round(p * 1000) / 1000,
      confidence,
      confidence_category: confidenceCategory(confidence),
      bust_risk: bustRiskLevel(p),
    };
  });
}

export function demoAllCells(): ReliabilityCell[] {
  return DEMO_DAYS.flatMap((d) => demoCells(d));
}

/** Realised error scale for a demo variable/lead-day, anchored on real 90th-percentile bust thresholds. */
function thresholdFor(variable: VariableKey, leadDay: number): number {
  const table: Record<VariableKey, number[]> = {
    temperature_2m: [1.925, 1.95, 2.025, 2.125, 2.225, 2.325, 2.425],
    precipitation: [0.35, 0.375, 0.375, 0.4, 0.4, 0.375, 0.375],
    wind_speed_10m: [4.425, 4.625, 4.85, 5.0, 5.175, 5.375, 5.575],
    relative_humidity_2m: [12, 13.25, 14, 14.75, 15.5, 16.25, 17],
  };
  const idx = clamp(leadDay, 1, 7) - 1;
  return table[variable][idx];
}

const FEATURE_REASON: Record<string, string> = {
  mm_std_temp: 'Temperature ensemble spread is high',
  mm_range_temp: 'Temperature ensemble spread is high',
  mm_mean_precip: 'Multi-model precipitation disagreement is elevated',
  mm_disagreement_precip: 'Substantial inter-model divergence in predicted precipitation volume and timing',
  mm_cv_temp: 'Coefficient of variation across forecast models is high',
  hist_bust_rate_temp_w30: 'Regional historical bust rate is above normal',
  hist_err_mean_temp_w30: 'Recent forecast errors have been large',
  hist_bias_temp_w60: 'Model has systematic bias for this region',
  hist_err_mean_humidity_w30: 'Recent humidity forecast errors have been large',
  run2run_temp_24h: 'Forecast changed significantly in the last 24 hours',
  run2run_precip_24h: 'Forecast changed significantly in the last 24 hours',
  chg_precip_48h: 'Forecast changed significantly in the last 48 hours',
  lead_hours: 'Forecast lead time reduces reliability',
  lead_age_days: 'Forecast lead time reduces reliability',
  lead_day_squared: 'Reliability drops non-linearly with lead time',
  doy_cos: 'Seasonal cycle position affects regional predictability',
  month: 'Seasonal regime is associated with higher bust risk',
  region_complexity: 'Region has complex terrain affecting forecasts',
  coastal_effect: 'Coastal effects increase forecast uncertainty',
};

const CONTEXT_NOTES = [
  'Multi-model spread measures disagreement between GFS, ECMWF IFS, ICON and GEM. Wide spread is a classic precursor of medium-range forecast failure.',
  'Bust is defined as absolute error above the 90th percentile of that variable and lead day, estimated from the training period only.',
  'Confidence is defined as 100 × (1 − calibrated bust probability), per the Nirikshan ML API contract.',
  'Historical analogue similarity compares multi-model divergence signatures with previously verified forecasts.',
];

function demoReasons(region: DemoRegion, leadDay: number, p: number): ReasonItem[] {
  const r = hash01(`${region.region_id}:${leadDay}`);
  const candidates: { feature: string; weight: number }[] = [
    { feature: 'mm_mean_precip', weight: 0.34 + r * 0.24 },
    { feature: 'lead_hours', weight: 0.06 + (leadDay - 1) * 0.022 },
    { feature: 'hist_bust_rate_temp_w30', weight: 0.1 + Math.abs(tiltOf(region)) * 0.9 },
    { feature: 'hist_err_mean_temp_w30', weight: 0.08 + statBiasOf(region) * 2 },
    { feature: 'run2run_temp_24h', weight: 0.07 + (1 - r) * 0.16 },
    { feature: 'mm_cv_temp', weight: 0.09 + p * 0.22 },
    { feature: 'doy_cos', weight: 0.04 + r * 0.07 },
  ];
  return candidates
    .map((c) => ({
      feature: c.feature,
      contribution: Math.round(c.weight * (c.weight > 0 ? 1 : -1) * 1000) / 1000,
      reason: `${FEATURE_REASON[c.feature] ?? `${c.feature} contributes to bust risk`} (pushes probability up)`,
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);
}

export function demoRegionAnalysis(regionId: string, leadDay: number): RegionAnalysis {
  const region = DEMO_REGIONS.find((r) => r.region_id === regionId) ?? DEMO_REGIONS[0];
  const p = demoBustProbability(region, leadDay);
  const confidence = confidenceFromBust(p);
  const reasons = demoReasons(region, leadDay, p);
  const analogBustRate = clamp(Math.round((p + (hash01(`${regionId}#a${leadDay}`) - 0.5) * 0.3) * 10) / 10, 0, 1);
  const nAnalogs = 10;
  const bustCount = Math.round(analogBustRate * nAnalogs);

  return {
    region_id: region.region_id,
    lead_day: leadDay,
    lead_hours: leadDay * 24,
    bust_probability: Math.round(p * 1000) / 1000,
    confidence,
    confidence_category: confidenceCategory(confidence),
    bust_risk: bustRiskLevel(p),
    reasons,
    plain_reasons: reasons.map((x) => x.reason.replace(' (pushes probability up)', '')),
    stabilizers: ['Consistent multi-model estimates of boundary layer humidity.'],
    variable_bust_probabilities: {
      temperature_2m: clamp(Math.round((p * 0.92 + 0.04) * 1000) / 1000, 0, 1),
      precipitation: clamp(Math.round((p * 1.16 + 0.07) * 1000) / 1000, 0, 1),
      wind_speed_10m: clamp(Math.round((p * 0.66 + 0.11) * 1000) / 1000, 0, 1),
      relative_humidity_2m: clamp(Math.round((p * 0.48 + 0.06) * 1000) / 1000, 0, 1),
    },
    historical_analogs: {
      n_analogs: nAnalogs,
      historical_bust_rate: analogBustRate,
      summary_statement: `${bustCount} of ${nAnalogs} similar historical forecasts (${Math.round(
        analogBustRate * 100,
      )}%) experienced a forecast bust under comparable synoptic and multi-model spread conditions.`,
      similar_cases: Array.from({ length: 5 }, (_, i) => {
        const seed = hash01(`${regionId}:${leadDay}:${i}`);
        const day = new Date(Date.UTC(2026, 7, 28));
        day.setUTCDate(day.getUTCDate() - Math.round(12 + i * 9 + seed * 6));
        return {
          loc_id: region.region_id,
          valid_time: day.toISOString(),
          lead_day: clamp(leadDay + (seed > 0.7 ? 1 : seed < 0.25 ? -1 : 0), 1, 10),
          overall_bust: i < bustCount ? 1 : 0,
          similarity_score: Math.round((0.94 - i * 0.07 - seed * 0.02) * 1000) / 1000,
          lat: region.lat,
          lon: region.lon,
          admin1: region.admin1 ?? region.name,
        };
      }),
    },
    model_version: 'demo-1.0.0',
    timestamp: new Date().toISOString(),
    source: 'demo',
  };
}

export function demoHistory(regionId: string, limit = 20): HistoricalCase[] {
  const region = DEMO_REGIONS.find((r) => r.region_id === regionId) ?? DEMO_REGIONS[0];
  const p = demoBustProbability(region, 5);
  return Array.from({ length: limit }, (_, i) => {
    const seed = hash01(`${regionId}:h:${i}`);
    const leadDay = clamp(1 + Math.floor(seed * 7), 1, 7);
    const bustProbability = clamp(Math.round((p + (seed - 0.5) * 0.4) * 1000) / 1000, 0.01, 0.97);
    const threshold = thresholdFor('temperature_2m', leadDay);
    const actualError = Math.round(threshold * (0.25 + seed * 1.35) * 100) / 100;
    const day = new Date(Date.UTC(2026, 7, 28));
    day.setUTCDate(day.getUTCDate() - Math.round(3 + i * 5.4));
    return {
      valid_time: day.toISOString(),
      lead_day: leadDay,
      bust_probability: bustProbability,
      actual_error: actualError,
      was_bust: actualError > threshold,
    };
  });
}

export function demoCaseStudies(): CaseStudy[] {
  return DEMO_CASE_STUDIES;
}

export function demoMultiModel(variable: VariableKey): MultiModelAgreement {
  return DEMO_MULTI_MODEL[variable];
}

export function demoAlerts(): Alert[] {
  const cells = demoCells(5);
  const prev = demoCells(4);
  const now = new Date().toISOString();
  const alerts: Alert[] = [];

  const sorted = [...cells].sort((a, b) => b.bust_probability - a.bust_probability);
  for (const cell of sorted.slice(0, 3)) {
    const region = DEMO_REGIONS.find((r) => r.region_id === cell.region_id)!;
    alerts.push({
      id: `DEMO_HB_${cell.region_id}`,
      type: cell.bust_probability >= 0.75 ? 'HIGH_BUST_PROBABILITY' : 'VERY_LOW_CONFIDENCE',
      region_id: cell.region_id,
      region_name: region.name,
      lead_day: 5,
      bust_probability: cell.bust_probability,
      confidence: cell.confidence,
      reason:
        cell.bust_probability >= 0.75
          ? 'Calibrated bust probability crossed the 0.75 critical threshold for Day 5.'
          : 'Forecast confidence fell below 40 for Day 5.',
      created_at: now,
      status: 'open',
      source: 'demo',
    });
  }

  for (const cell of cells) {
    const before = prev.find((c) => c.region_id === cell.region_id);
    if (!before) continue;
    const drop = before.confidence - cell.confidence;
    if (drop >= 10) {
      const region = DEMO_REGIONS.find((r) => r.region_id === cell.region_id)!;
      alerts.push({
        id: `DEMO_CD_${cell.region_id}`,
        type: 'CONFIDENCE_DETERIORATION',
        region_id: cell.region_id,
        region_name: region.name,
        lead_day: 5,
        bust_probability: cell.bust_probability,
        confidence: cell.confidence,
        reason: `Confidence deteriorated ${drop} points between Day 4 and Day 5.`,
        created_at: now,
        status: 'open',
        source: 'demo',
      });
      break;
    }
  }

  const disagreement = [...cells].sort((a, b) => a.confidence - b.confidence)[1];
  if (disagreement) {
    const region = DEMO_REGIONS.find((r) => r.region_id === disagreement.region_id)!;
    alerts.push({
      id: `DEMO_MD_${disagreement.region_id}`,
      type: 'HIGH_MODEL_DISAGREEMENT',
      region_id: disagreement.region_id,
      region_name: region.name,
      lead_day: 5,
      bust_probability: disagreement.bust_probability,
      confidence: disagreement.confidence,
      reason: 'Multi-model spread across GFS, ECMWF, ICON and GEM is unusually wide for this region.',
      created_at: now,
      status: 'open',
      source: 'demo',
    });
  }

  return alerts;
}

/** Lead-day base rates (realised bust frequency) — taken verbatim from the evaluation report. */
export function demoLeadDayBaseRates(): { lead_day: number; bust_rate: number }[] {
  return LEAD_DAY_STATS.map((s) => ({ lead_day: s.lead_day, bust_rate: s.pos_rate }));
}

export function demoRegionalBaseRates(): { admin1: string; bust_rate: number }[] {
  return REGIONAL_STATS.map((s) => ({ admin1: s.admin1, bust_rate: s.pos_rate }));
}
