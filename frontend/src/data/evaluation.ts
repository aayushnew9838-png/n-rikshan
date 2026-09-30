/**
 * REAL evaluation statistics transcribed verbatim from the Nirikshan ML reports:
 *   - ml/reports/evaluation_summary.json
 *   - ml/reports/final_results.md
 *   - ml/reports/feature_importance.md
 *   - ml/artifacts/split_manifest.json
 *
 * Nothing here is synthesised. These values are used by the Analytics and
 * System pages when the backend does not expose an evaluation-report endpoint.
 */

export const EVAL_GENERATED_AT = '2026-09-24T14:30:00.711341+00:00';

/** National positive-label (bust) rate on the held-out temporal test split. */
export const NATIONAL_POS_RATE = 0.30293367346938777;

export const TEMPORAL_TEST: Record<string, number> = {
  pr_auc: 0.624918924929039,
  roc_auc: 0.7510866933650074,
  f1: 0.5361216730038023,
  precision: 0.8306332842415317,
  recall: 0.3957894736842105,
  brier_score: 0.16050589786237676,
  log_loss: 0.49668682227988487,
  ece: 0.0547883612306497,
  n_samples: 18816,
  pos_rate: 0.30293367346938777,
};

export interface LeadDayStat {
  lead_day: number;
  roc_auc: number;
  pr_auc: number;
  f1: number;
  brier_score: number;
  ece: number;
  n_samples: number;
  pos_rate: number;
  /** Realised bust rate + mean confidence published in final_results.md (Day 1–7). */
  realized_bust_rate?: number;
  mean_confidence?: number;
}

export const LEAD_DAY_STATS: LeadDayStat[] = [
  { lead_day: 1, roc_auc: 0.7988034967241812, pr_auc: 0.7229901327058561, f1: 0.6078680203045685, brier_score: 0.15822554830218674, ece: 0.02241628373957286, n_samples: 2832, pos_rate: 0.3626412429378531, realized_bust_rate: 0.363, mean_confidence: 63.7 },
  { lead_day: 2, roc_auc: 0.7447372661104456, pr_auc: 0.6246643171860743, f1: 0.5098039215685149, brier_score: 0.17204422589870078, ece: 0.044667526418557285, n_samples: 2784, pos_rate: 0.3297413793103448, realized_bust_rate: 0.33, mean_confidence: 67.0 },
  { lead_day: 3, roc_auc: 0.7730614876794349, pr_auc: 0.6626685426638782, f1: 0.5508145849495734, brier_score: 0.15908791746716724, ece: 0.055033275323827374, n_samples: 2736, pos_rate: 0.3198099415204678, realized_bust_rate: 0.32, mean_confidence: 68.0 },
  { lead_day: 4, roc_auc: 0.7559432410431705, pr_auc: 0.6264553189730679, f1: 0.5745762711864407, brier_score: 0.15394811612547699, ece: 0.07648772641550747, n_samples: 2688, pos_rate: 0.28757440476190477, realized_bust_rate: 0.288, mean_confidence: 71.2 },
  { lead_day: 5, roc_auc: 0.7484513762708064, pr_auc: 0.6164248493543233, f1: 0.5551470588235294, brier_score: 0.15194872924244165, ece: 0.08144669310951776, n_samples: 2640, pos_rate: 0.2753787878787879, realized_bust_rate: 0.275, mean_confidence: 72.5 },
  { lead_day: 6, roc_auc: 0.7108937951532451, pr_auc: 0.5542026528312163, f1: 0.4723809523809524, brier_score: 0.16668425611426213, ece: 0.06844581868269561, n_samples: 2592, pos_rate: 0.2816358024691358, realized_bust_rate: 0.282, mean_confidence: 71.8 },
  { lead_day: 7, roc_auc: 0.705940216066932, pr_auc: 0.5150343529738985, f1: 0.42998897464167585, brier_score: 0.16145667496110086, ece: 0.07507535424259192, n_samples: 2544, pos_rate: 0.2555031446540881, realized_bust_rate: 0.256, mean_confidence: 74.4 },
];

export interface RegionalStat {
  admin1: string;
  pos_rate: number;
  roc_auc: number;
  pr_auc: number;
  n_samples: number;
}

export const REGIONAL_STATS: RegionalStat[] = [
  { admin1: 'Gujarat', pos_rate: 0.3882865646258503, roc_auc: 0.7520552356548287, pr_auc: 0.6916006739736986, n_samples: 9408 },
  { admin1: 'Tamil Nadu', pos_rate: 0.21758078231292516, roc_auc: 0.7190855607793672, pr_auc: 0.46407998904766734, n_samples: 9408 },
];

export interface ModelComparisonStat {
  model: string;
  label: string;
  roc_auc: number;
  pr_auc: number;
  brier: number;
  f1: number;
  precision: number;
  recall: number;
  ece: number;
}

export const MODEL_COMPARISON: ModelComparisonStat[] = [
  { model: 'nirikshan_xgboost', label: 'Nirikshan XGBoost (production)', roc_auc: 0.7510866933650074, pr_auc: 0.624918924929039, brier: 0.16050589786237676, f1: 0.5361216730038023, precision: 0.8306332842415317, recall: 0.3957894736842105, ece: 0.0547883612306497 },
  { model: 'logistic_regression', label: 'Logistic regression', roc_auc: 0.7573153320171426, pr_auc: 0.6609905138307394, brier: 0.17574779439628999, f1: 0.564957286262775, precision: 0.5944584382871536, recall: 0.5382456140350877, ece: 0.08971162707840407 },
  { model: 'spread_threshold', label: 'Multi-model spread threshold', roc_auc: 0.5617435113401069, pr_auc: 0.3714576143511702, brier: 0.23323156564737265, f1: 0.1982637916549986, precision: 0.49098743434117297, recall: 0.1242105273557477, ece: 0.13987649705587235 },
  { model: 'historical_frequency', label: 'Historical bust frequency', roc_auc: 0.48620999930445197, pr_auc: 0.29499590270823567, brier: 0.27528460226744467, f1: 0.0003502602739526271, precision: 0.1, recall: 0.00017534854067440223, ece: 0.23851945044049548 },
  { model: 'baseline_no_bust', label: 'Baseline (never bust)', roc_auc: 0.5, pr_auc: 0.30293367346938777, brier: 0.21130564172307495, f1: 0, precision: 0, recall: 0, ece: 0.01186502319192273 },
];

export interface VariableStat {
  variable: string;
  label: string;
  roc_auc: number;
  pr_auc: number;
  brier: number;
  pos_rate: number;
}

export const VARIABLE_STATS: VariableStat[] = [
  { variable: 'temperature_2m', label: 'Temperature 2 m', roc_auc: 0.8215264736722993, pr_auc: 0.149868384890161, brier: 0.045772541849426855, pos_rate: 0.05054209183673469 },
  { variable: 'precipitation', label: 'Precipitation', roc_auc: 0.9171468277835256, pr_auc: 0.7455046104381212, brier: 0.06360847564743206, pos_rate: 0.15433673463478754 },
  { variable: 'wind_speed_10m', label: 'Wind speed 10 m', roc_auc: 0.6658407325901564, pr_auc: 0.17966437339464345, brier: 0.1097302191163572, pos_rate: 0.12824192176870754 },
  { variable: 'relative_humidity_2m', label: 'Relative humidity 2 m', roc_auc: 0.8646572290194943, pr_auc: 0.27028894872457965, brier: 0.05407898671994964, pos_rate: 0.06770833333333333 },
];

/** Top global SHAP drivers — ml/reports/feature_importance.md */
export const FEATURE_IMPORTANCE: { feature: string; importance: number }[] = [
  { feature: 'mm_mean_precip', importance: 0.4261 },
  { feature: 'hist_bias_temp_w60', importance: 0.103 },
  { feature: 'hist_err_mean_temp_w30', importance: 0.1019 },
  { feature: 'doy_cos', importance: 0.0868 },
  { feature: 'hist_err_mean_humidity_w30', importance: 0.0666 },
  { feature: 'hist_err_mean_temp_w90', importance: 0.0664 },
  { feature: 'mm_cv_temp', importance: 0.0656 },
  { feature: 'hist_bias_temp_w30', importance: 0.0642 },
  { feature: 'mm_max_precip', importance: 0.0598 },
  { feature: 'hist_bust_rate_temp_w90', importance: 0.0519 },
  { feature: 'hist_err_mean_wind_w30', importance: 0.0406 },
  { feature: 'hist_bust_rate_wind_w30', importance: 0.0403 },
  { feature: 'mm_disagreement_precip', importance: 0.034 },
  { feature: 'mm_mean_humidity', importance: 0.0326 },
  { feature: 'hist_bust_rate_wind_w60', importance: 0.0301 },
  { feature: 'fc_temperature_2m_gfs_seamless', importance: 0.03 },
  { feature: 'mm_range_humidity', importance: 0.0261 },
  { feature: 'doy_sin', importance: 0.0249 },
  { feature: 'hist_bias_humidity_w30', importance: 0.0248 },
  { feature: 'init_doy_cos', importance: 0.0246 },
  { feature: 'hist_bias_wind_w90', importance: 0.0234 },
  { feature: 'hist_err_std_temp_w30', importance: 0.0224 },
  { feature: 'mm_max_humidity', importance: 0.0217 },
  { feature: 'hist_bust_rate_humidity_w30', importance: 0.0214 },
  { feature: 'fc_temperature_2m_icon_seamless', importance: 0.0203 },
];

export const SPLIT_MANIFEST = {
  train: '2025-07-26 → 2026-04-25',
  validation: '2026-04-25 → 2026-06-30',
  test: '2026-06-30 → 2026-08-28',
  fractions: '70 / 15 / 15 chronological issue-time split',
  spatial_holdout: '20% of locations (25 of 127), seed 26079',
};

export const DATASET_FACTS = {
  rows: 9582912,
  locations: 127,
  raw_files: 127,
  time_min: '2025-08-01',
  time_max: '2026-08-28',
  truth: 'ERA5-Land',
  sources: 'GFS, ECMWF IFS, ICON, GEM (Open-Meteo historical-forecast API)',
  source_repo: 'Arko007/weathergpt-d1-mos-dataset',
  is_synthetic: false,
};

export const BUST_THRESHOLDS: Record<string, Record<string, number>> = {
  temperature_2m: { 1: 1.925, 2: 1.95, 3: 2.025, 4: 2.125, 5: 2.225, 6: 2.325, 7: 2.425 },
  precipitation: { 1: 0.35, 2: 0.375, 3: 0.375, 4: 0.4, 5: 0.4, 6: 0.375, 7: 0.375 },
  wind_speed_10m: { 1: 4.425, 2: 4.625, 3: 4.85, 4: 5.0, 5: 5.175, 6: 5.375, 7: 5.575 },
  relative_humidity_2m: { 1: 12.0, 2: 13.25, 3: 14.0, 4: 14.75, 5: 15.5, 6: 16.25, 7: 17.0 },
};
