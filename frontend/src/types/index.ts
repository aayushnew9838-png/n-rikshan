/** Central type definitions for the Nirikshan frontend. */

export type ConfidenceCategory =
  | 'HIGH_CONFIDENCE'
  | 'MODERATE_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'VERY_LOW_CONFIDENCE_HIGH_RISK';

export type BustRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type VariableKey =
  | 'temperature_2m'
  | 'precipitation'
  | 'wind_speed_10m'
  | 'relative_humidity_2m';

export const VARIABLES: { key: VariableKey; label: string; unit: string }[] = [
  { key: 'temperature_2m', label: 'Temperature 2 m', unit: '°C' },
  { key: 'precipitation', label: 'Precipitation', unit: 'mm' },
  { key: 'wind_speed_10m', label: 'Wind speed 10 m', unit: 'm/s' },
  { key: 'relative_humidity_2m', label: 'Relative humidity 2 m', unit: '%' },
];

/** Region as returned by the backend `/forecast/regions` endpoint. */
export interface RegionInfo {
  region_id: string;
  name: string;
  lat: number;
  lon: number;
  /** Optional; present when the backend reference data carries admin level 1. */
  admin1?: string;
}

/** One region × lead-day reliability cell. */
export interface ReliabilityCell {
  region_id: string;
  lead_day: number;
  bust_probability: number;
  /** 0..100 — normalised confidence score. */
  confidence: number;
  confidence_category: ConfidenceCategory;
  bust_risk: BustRiskLevel;
}

/** Region enriched with coordinates for map + ranking views. */
export interface ForecastRegion extends RegionInfo, ReliabilityCell {
  lead_day: number;
}

export interface RegionSummary {
  region: RegionInfo;
  cells: ReliabilityCell[];
}

export interface DayWiseConfidence {
  regions: RegionInfo[];
  days: number[];
  cells: ReliabilityCell[];
}

/** SHAP-style contribution returned by `/predict`. */
export interface ReasonItem {
  feature: string;
  contribution: number;
  reason: string;
}

export interface SimilarCase {
  loc_id: string;
  valid_time: string;
  lead_day: number;
  lead_hours?: number;
  overall_bust: number;
  similarity_score?: number;
  lat?: number;
  lon?: number;
  admin1?: string;
}

export interface HistoricalAnalogs {
  n_analogs: number;
  historical_bust_rate: number;
  historical_mean_similarity?: number;
  summary_statement?: string;
  similar_cases?: SimilarCase[];
}

/** Normalised single-region prediction (both backends normalised). */
export interface RegionAnalysis {
  region_id: string;
  lead_day: number;
  lead_hours?: number;
  bust_probability: number;
  raw_probability?: number;
  confidence: number;
  confidence_category: ConfidenceCategory;
  bust_risk: BustRiskLevel;
  reasons: ReasonItem[];
  plain_reasons: string[];
  stabilizers: string[];
  variable_bust_probabilities?: Partial<Record<VariableKey, number>>;
  historical_analogs?: HistoricalAnalogs;
  model_version?: string;
  timestamp?: string;
}

export interface HistoricalCase {
  valid_time: string;
  lead_day: number;
  bust_probability: number;
  actual_error: number;
  was_bust: boolean;
}

export interface Explanation {
  /** Raw SHAP-style feature contributions — MODEL-DERIVED. */
  contributions: ReasonItem[];
  /** Plain-language statements produced by the model reason engine — MODEL-DERIVED. */
  model_reasons: string[];
  /** Static meteorological background — GENERAL CONTEXT, not model output. */
  context: string[];
}

export type AlertType =
  | 'VERY_LOW_CONFIDENCE'
  | 'HIGH_BUST_PROBABILITY'
  | 'CONFIDENCE_DETERIORATION'
  | 'HIGH_MODEL_DISAGREEMENT'
  | 'ANOMALOUS_FORECAST_BEHAVIOUR';

export interface Alert {
  id: string;
  type: AlertType;
  region_id: string;
  region_name: string;
  lead_day: number;
  bust_probability: number;
  confidence: number;
  reason: string;
  created_at: string;
  status: 'open' | 'acknowledged';
}

export interface ModelInfo {
  model_name?: string;
  model_version?: string;
  calibration_method?: string;
  n_features?: number;
  primary_target?: string;
  training_period?: string;
  validation_period?: string;
  test_period?: string;
  last_model_update?: string;
  top_features?: { feature: string; importance: number }[];
  /** Raw model-card fields surfaced verbatim by the backend. */
  raw?: Record<string, unknown>;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  model_version?: string | null;
  prefix?: '/api/v1' | '';
}

export interface MultiModelAgreement {
  variable: VariableKey;
  models: { name: string; value: number | null }[];
  spread: number | null;
  interpretation: string;
}

export interface CaseStudy {
  case_id: string;
  description: string;
  location: { loc_id: string; admin1: string; lat: number; lon: number; elevation_m?: number };
  forecast_timing: {
    valid_time: string;
    init_time: string;
    lead_hours: number;
    lead_day: number;
  };
  ground_truth_outcome: { realized_overall_bust: number; target_definition: string };
  nirikshan_prediction: {
    bust_probability: number;
    confidence_score: number;
    risk_category: string;
  };
  explainability: {
    key_risk_drivers: string[];
    stabilizing_factors: string[];
    top_shap_factors: { feature: string; shap_value: number; feature_value: number }[];
  };
  historical_analogs: HistoricalAnalogs;
}

export interface VerificationPoint {
  valid_time: string;
  lead_day: number;
  predicted_bust_probability: number;
  actual_error: number;
  was_bust: boolean;
}

export interface AnalyticsBundle {
  bust_rate_by_lead: { lead_day: number; bust_rate: number; n: number }[];
  confidence_by_lead: { lead_day: number; mean_confidence: number }[];
  regional_risk: { region_id: string; region_name: string; mean_bust_probability: number; n: number }[];
  model_comparison?: ModelComparisonRow[];
  calibration?: CalibrationPoint[];
  variable_performance?: VariablePerformanceRow[];
  error_distribution?: { bin: string; count: number }[];
  notes: string[];
}

export interface ModelComparisonRow {
  model: string;
  roc_auc: number | null;
  pr_auc: number | null;
  brier: number | null;
  f1: number | null;
}

export interface CalibrationPoint {
  predicted: number;
  observed: number;
  count: number;
}

export interface VariablePerformanceRow {
  variable: string;
  roc_auc: number | null;
  pr_auc: number | null;
  brier: number | null;
}

export interface EvaluationReport {
  generated_at?: string;
  model_name?: string;
  calibration_method?: string;
  lead_day_breakdown: {
    lead_day: number;
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
    pos_rate: number;
    n_samples: number;
    ece: number;
    f1: number;
  }[];
  regional_breakdown: { admin1: string; pos_rate: number; roc_auc: number; n_samples: number }[];
  model_comparison: Record<string, Record<string, number>>;
  variable_models: Record<string, Record<string, number>>;
  temporal_test: Record<string, number>;
  feature_importance?: { feature: string; importance: number }[];
}

export interface OverviewStats {
  forecasts_analysed: number;
  high_risk_regions: number;
  lowest_confidence: { region_id: string; region_name: string; confidence: number } | null;
  highest_bust_probability: { region_id: string; region_name: string; bust_probability: number } | null;
  mean_confidence: number;
  lead_day: number;
}

export type MapLayer = 'confidence' | 'bust' | 'risk_heat' | 'disagreement' | 'error';

export interface ApiResult<T> {
  data: T;
}
