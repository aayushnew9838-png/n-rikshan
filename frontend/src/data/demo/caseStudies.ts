/**
 * REAL case studies transcribed from `ml/reports/case_studies.json`.
 * These are held-out test-set evaluations of the production Nirikshan model and
 * are marked as `source: 'demo'` only because they are read from a local report
 * file rather than from a live endpoint.
 */
import type { CaseStudy } from '../../types';

export const DEMO_CASE_STUDIES: CaseStudy[] = [
  {
    case_id: 'CASE_SUCCESSFUL_BUST_DETECTION_1255364',
    description: 'True Positive: Model correctly detected high-risk bust.',
    location: { loc_id: '1255364', admin1: 'Gujarat', lat: 21.195899963378906, lon: 72.8302001953125, elevation_m: 0 },
    forecast_timing: {
      valid_time: '2026-08-09T12:00:00+00:00',
      init_time: '2026-08-04T00:00:00+00:00',
      lead_hours: 132,
      lead_day: 6,
    },
    ground_truth_outcome: { realized_overall_bust: 1, target_definition: 'overall_bust' },
    nirikshan_prediction: {
      bust_probability: 1,
      confidence_score: 0,
      risk_category: 'VERY_LOW_CONFIDENCE_HIGH_RISK',
    },
    explainability: {
      key_risk_drivers: [
        'Elevated multi-model forecast spread across NWP centers.',
        'High structural disagreement in rain footprint among forecast centers.',
      ],
      stabilizing_factors: [
        'Consistent historical forecast reliability in this region.',
        'Low historical baseline error regime for regional temperature.',
      ],
      top_shap_factors: [
        { feature: 'mm_mean_precip', shap_value: 2.66377329826355, feature_value: 1.524999976158142 },
        { feature: 'mm_max_precip', shap_value: 0.4242415726184845, feature_value: 5.599999904632568 },
        { feature: 'mm_disagreement_precip', shap_value: 0.19022619724273682, feature_value: 1.475000023841858 },
        { feature: 'hist_bias_temp_w60', shap_value: -0.033672481775283813, feature_value: 0.017500000074505806 },
        { feature: 'hist_err_mean_temp_w30', shap_value: -0.03035900369286537, feature_value: 0.40666666626930237 },
        { feature: 'hist_err_mean_humidity_w30', shap_value: -0.027780896052718163, feature_value: 1.9249999523162842 },
      ],
    },
    historical_analogs: {
      n_analogs: 10,
      historical_bust_rate: 0.9,
      historical_mean_similarity: 0.0022926444965258993,
      summary_statement:
        '9 of 10 similar historical forecasts (90%) experienced a forecast bust under comparable synoptic and multi-model spread conditions.',
      similar_cases: [
        { loc_id: '1255364', valid_time: '2025-09-07T01:00:00+00:00', lead_day: 6, lead_hours: 121, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.007454804761084588 },
        { loc_id: '1255364', valid_time: '2025-09-07T03:00:00+00:00', lead_day: 6, lead_hours: 123, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0046064696184603046 },
        { loc_id: '1255364', valid_time: '2025-08-28T00:00:00+00:00', lead_day: 7, lead_hours: 144, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0024806074366074023 },
        { loc_id: '1255364', valid_time: '2025-09-04T07:00:00+00:00', lead_day: 6, lead_hours: 127, overall_bust: 0, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0018574288253600387 },
        { loc_id: '1255364', valid_time: '2025-08-29T09:00:00+00:00', lead_day: 7, lead_hours: 153, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0017255110435837118 },
      ],
    },
    source: 'demo',
  },
  {
    case_id: 'CASE_SUCCESSFUL_NORMAL_FORECAST_1257629',
    description: 'True Negative: Model correctly identified reliable forecast.',
    location: { loc_id: '1257629', admin1: 'Tamil Nadu', lat: 11.653800010681152, lon: 78.15540313720703, elevation_m: 0 },
    forecast_timing: {
      valid_time: '2026-07-02T03:00:00+00:00',
      init_time: '2026-07-01T00:00:00+00:00',
      lead_hours: 3,
      lead_day: 1,
    },
    ground_truth_outcome: { realized_overall_bust: 0, target_definition: 'overall_bust' },
    nirikshan_prediction: { bust_probability: 0.071, confidence_score: 92.9, risk_category: 'HIGH_CONFIDENCE' },
    explainability: {
      key_risk_drivers: [
        'Elevated multi-model forecast spread across NWP centers.',
        'Rapid temporal shifts or run-to-run forecast adjustments.',
        'Feature `month` is associated with higher risk of forecast bust.',
      ],
      stabilizing_factors: [
        'Strong agreement between multi-model forecast centers.',
        'Consistent historical forecast reliability in this region.',
      ],
      top_shap_factors: [
        { feature: 'mm_mean_precip', shap_value: 0.832818329334259, feature_value: 0 },
        { feature: 'doy_cos', shap_value: 0.6685906052589417, feature_value: -0.8003361821174622 },
        { feature: 'hist_bias_temp_w30', shap_value: 0.40046844482421875, feature_value: -0.17499999701976776 },
        { feature: 'lead_hours', shap_value: -0.31756073236465454, feature_value: 3 },
        { feature: 'mm_std_temp', shap_value: -0.10768815875053406, feature_value: 0.7632168531417847 },
        { feature: 'hist_err_mean_temp_w30', shap_value: -0.055224061012268066, feature_value: 0.6516666412353516 },
      ],
    },
    historical_analogs: {
      n_analogs: 10,
      historical_bust_rate: 0,
      historical_mean_similarity: 0.07593956716185271,
      summary_statement:
        '0 of 10 similar historical forecasts (0%) experienced a forecast bust under comparable synoptic and multi-model spread conditions.',
      similar_cases: [
        { loc_id: '1257629', valid_time: '2025-08-18T05:00:00+00:00', lead_day: 5, lead_hours: 101, overall_bust: 0, lat: 11.653800010681152, lon: 78.15540313720703, admin1: 'Tamil Nadu', similarity_score: 0.08928237987966428 },
        { loc_id: '1257629', valid_time: '2025-09-20T05:00:00+00:00', lead_day: 3, lead_hours: 53, overall_bust: 0, lat: 11.653800010681152, lon: 78.15540313720703, admin1: 'Tamil Nadu', similarity_score: 0.08194841805930894 },
        { loc_id: '1257629', valid_time: '2025-08-31T05:00:00+00:00', lead_day: 3, lead_hours: 53, overall_bust: 0, lat: 11.653800010681152, lon: 78.15540313720703, admin1: 'Tamil Nadu', similarity_score: 0.07870686945590079 },
        { loc_id: '1257629', valid_time: '2025-09-05T04:00:00+00:00', lead_day: 7, lead_hours: 148, overall_bust: 0, lat: 11.653800010681152, lon: 78.15540313720703, admin1: 'Tamil Nadu', similarity_score: 0.0777886303699698 },
        { loc_id: '1257629', valid_time: '2025-08-17T05:00:00+00:00', lead_day: 5, lead_hours: 101, overall_bust: 0, lat: 11.653800010681152, lon: 78.15540313720703, admin1: 'Tamil Nadu', similarity_score: 0.07353760451078415 },
      ],
    },
    source: 'demo',
  },
  {
    case_id: 'CASE_FALSE_ALARM_CASE_1255364',
    description: 'False Positive: Model warned of bust, but forecast remained stable.',
    location: { loc_id: '1255364', admin1: 'Gujarat', lat: 21.195899963378906, lon: 72.8302001953125, elevation_m: 0 },
    forecast_timing: {
      valid_time: '2026-07-02T22:00:00+00:00',
      init_time: '2026-07-01T00:00:00+00:00',
      lead_hours: 46,
      lead_day: 2,
    },
    ground_truth_outcome: { realized_overall_bust: 0, target_definition: 'overall_bust' },
    nirikshan_prediction: {
      bust_probability: 0.965,
      confidence_score: 3.5,
      risk_category: 'VERY_LOW_CONFIDENCE_HIGH_RISK',
    },
    explainability: {
      key_risk_drivers: [
        'Elevated multi-model forecast spread across NWP centers.',
        'High structural disagreement in rain footprint among forecast centers.',
      ],
      stabilizing_factors: ['Consistent historical forecast reliability in this region.'],
      top_shap_factors: [
        { feature: 'mm_mean_precip', shap_value: 3.1011745929718018, feature_value: 1.5499999523162842 },
        { feature: 'mm_max_precip', shap_value: 0.5163028240203857, feature_value: 6.199999809265137 },
        { feature: 'mm_disagreement_precip', shap_value: 0.24794475734233856, feature_value: 1.574999988079071 },
        { feature: 'hist_bust_rate_wind_w30', shap_value: -0.09077194333076477, feature_value: 0.3333333402874756 },
        { feature: 'lead_hours', shap_value: -0.06142166256904602, feature_value: 46 },
      ],
    },
    historical_analogs: {
      n_analogs: 10,
      historical_bust_rate: 1,
      historical_mean_similarity: 0.0019204493149181878,
      summary_statement:
        '10 of 10 similar historical forecasts (100%) experienced a forecast bust under comparable synoptic and multi-model spread conditions.',
      similar_cases: [
        { loc_id: '1255364', valid_time: '2025-09-12T10:00:00+00:00', lead_day: 2, lead_hours: 46, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0039071030821686983 },
        { loc_id: '1255364', valid_time: '2025-08-06T22:00:00+00:00', lead_day: 2, lead_hours: 46, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0032082708552479744 },
        { loc_id: '1255364', valid_time: '2025-09-24T22:00:00+00:00', lead_day: 2, lead_hours: 46, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.0026004845220595598 },
        { loc_id: '1255364', valid_time: '2025-08-14T10:00:00+00:00', lead_day: 2, lead_hours: 46, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.002103934530168772 },
        { loc_id: '1255364', valid_time: '2025-09-01T10:00:00+00:00', lead_day: 2, lead_hours: 46, overall_bust: 1, lat: 21.195899963378906, lon: 72.8302001953125, admin1: 'Gujarat', similarity_score: 0.001663915067911148 },
      ],
    },
    source: 'demo',
  },
];
