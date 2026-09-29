import type { BustRiskLevel, ConfidenceCategory } from '../types';

/**
 * Canonical confidence / risk mapping used EVERYWHERE in the application so the
 * map legend, badges, strips and tables never disagree.
 *
 * confidence = 100 * (1 - calibrated bust probability)   (ML API contract §2)
 */
export const CONFIDENCE_BANDS = [
  { key: 'HIGH_CONFIDENCE' as ConfidenceCategory, label: 'HIGH', min: 80, color: '#4fa8dd', text: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-200' },
  { key: 'MODERATE_CONFIDENCE' as ConfidenceCategory, label: 'MODERATE', min: 60, color: '#2c7fbe', text: 'text-blue-800', bg: 'bg-blue-200', ring: 'ring-blue-300' },
  { key: 'LOW_CONFIDENCE' as ConfidenceCategory, label: 'LOW', min: 40, color: '#f0a15c', text: 'text-orange-700', bg: 'bg-orange-100', ring: 'ring-orange-200' },
  { key: 'VERY_LOW_CONFIDENCE_HIGH_RISK' as ConfidenceCategory, label: 'VERY LOW', min: 0, color: '#e2574c', text: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-200' },
];

export const RISK_BANDS = [
  { key: 'low' as BustRiskLevel, label: 'LOW', min: 0, color: '#7ec8e8' },
  { key: 'moderate' as BustRiskLevel, label: 'MODERATE', min: 0.25, color: '#f2c14e' },
  { key: 'high' as BustRiskLevel, label: 'HIGH', min: 0.5, color: '#ef9455' },
  { key: 'critical' as BustRiskLevel, label: 'VERY HIGH', min: 0.75, color: '#dd5145' },
];

export function confidenceFromBust(bustProbability: number): number {
  return Math.max(0, Math.min(100, Math.round((1 - bustProbability) * 1000) / 10));
}

export function confidenceCategory(confidence: number): ConfidenceCategory {
  if (confidence >= 80) return 'HIGH_CONFIDENCE';
  if (confidence >= 60) return 'MODERATE_CONFIDENCE';
  if (confidence >= 40) return 'LOW_CONFIDENCE';
  return 'VERY_LOW_CONFIDENCE_HIGH_RISK';
}

export function bustRiskLevel(bustProbability: number): BustRiskLevel {
  if (bustProbability >= 0.75) return 'critical';
  if (bustProbability >= 0.5) return 'high';
  if (bustProbability >= 0.25) return 'moderate';
  return 'low';
}

export function confidenceColor(confidence: number): string {
  return CONFIDENCE_BANDS.find((b) => confidence >= b.min)?.color ?? '#e2574c';
}

export function confidenceLabel(confidence: number): string {
  const key = confidenceCategory(confidence);
  return CONFIDENCE_BANDS.find((b) => b.key === key)?.label ?? 'VERY LOW';
}

export function confidenceTailwind(confidence: number): { text: string; bg: string; label: string } {
  const band = CONFIDENCE_BANDS.find((b) => confidence >= b.min) ?? CONFIDENCE_BANDS[3];
  return { text: band.text, bg: band.bg, label: band.label };
}

export function riskColor(bustProbability: number): string {
  return RISK_BANDS.find((b) => bustProbability >= b.min)?.color ?? '#7ec8e8';
}

export function riskLabel(bustProbability: number): string {
  return RISK_BANDS.find((b) => bustProbability >= b.min)?.label ?? 'LOW';
}

/** Human sentence describing a confidence band. */
export function confidenceMeaning(confidence: number): string {
  const cat = confidenceCategory(confidence);
  switch (cat) {
    case 'HIGH_CONFIDENCE':
      return 'Models agree strongly; low historical error regime.';
    case 'MODERATE_CONFIDENCE':
      return 'Acceptable reliability with minor inter-model divergence.';
    case 'LOW_CONFIDENCE':
      return 'Elevated model spread or rapid synoptic change. Exercise caution.';
    default:
      return 'Severe model disagreement or historically high-bust regime.';
  }
}
