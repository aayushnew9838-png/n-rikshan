/**
 * Multi-model agreement demo values.
 * The per-model forecast numbers are REAL values transcribed from
 * `ml/artifacts/demo_prediction.json` (location 1257629, lead day 6).
 */
import type { MultiModelAgreement, VariableKey } from '../../types';

const D = '2026-09-24T14:30:00Z';

export const DEMO_MULTI_MODEL: Record<VariableKey, MultiModelAgreement> = {
  temperature_2m: {
    variable: 'temperature_2m',
    models: [
      { name: 'GFS', value: 26.8 },
      { name: 'ECMWF', value: 28.0 },
      { name: 'ICON', value: 27.5 },
      { name: 'GEM', value: 28.6 },
    ],
    spread: 1.8,
    interpretation:
      'Low disagreement — models span 1.8 °C (σ 0.76 °C), well inside the Day-6 bust threshold of 2.33 °C.',
    source: 'demo',
  },
  precipitation: {
    variable: 'precipitation',
    models: [
      { name: 'GFS', value: 0.0 },
      { name: 'ECMWF', value: 0.1 },
      { name: 'ICON', value: 0.0 },
      { name: 'GEM', value: 0.0 },
    ],
    spread: 0.1,
    interpretation:
      'Low disagreement on volume, but only one centre reports rainfall — footprint agreement remains the dominant risk.',
    source: 'demo',
  },
  wind_speed_10m: {
    variable: 'wind_speed_10m',
    models: [
      { name: 'GFS', value: 12.0 },
      { name: 'ECMWF', value: 14.7 },
      { name: 'ICON', value: 7.3 },
      { name: 'GEM', value: 7.9 },
    ],
    spread: 7.4,
    interpretation:
      'High disagreement — a 7.4 m/s span between ECMWF and ICON. σ 3.51 m/s, above the Day-6 threshold scale.',
    source: 'demo',
  },
  relative_humidity_2m: {
    variable: 'relative_humidity_2m',
    models: [
      { name: 'GFS', value: 67 },
      { name: 'ECMWF', value: 75 },
      { name: 'ICON', value: 73 },
      { name: 'GEM', value: 69 },
    ],
    spread: 8,
    interpretation: 'Moderate disagreement — an 8 %RH span (σ 3.65 %RH) around a 71 % mean.',
    source: 'demo',
  },
};

export const DEMO_MULTI_MODEL_TIMESTAMP = D;
export const DEMO_MULTI_MODEL_LOC = '1257629';
export const DEMO_MULTI_MODEL_LEAD_DAY = 6;
