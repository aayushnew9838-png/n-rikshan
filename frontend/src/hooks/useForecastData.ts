import { useOutletContext } from 'react-router-dom';
import type { ShellContext } from '../layouts/AppShell';
import { useAppStore } from '../store/useAppStore';
import { useAsync } from './useAsync';
import {
  DEMO_FORCED,
  demoAlerts,
  demoConfidenceMap,
  demoDayWiseConfidence,
  demoOverview,
  demoRiskAreas,
  getAlerts,
  getConfidenceMap,
  getDayWiseConfidence,
  getOverview,
  getRiskAreas,
} from '../services/api';

export function useShell(): ShellContext {
  return useOutletContext<ShellContext>();
}

/** True when demo values are being shown (user-forced, or live backend offline in auto mode). */
export function useIsDemo(): boolean {
  const { mode, backendState } = useAppStore();
  if (DEMO_FORCED) return true;
  if (mode === 'demo') return true;
  if (mode === 'live') return false;
  return backendState === 'offline';
}

export function useForecastData() {
  const leadDay = useAppStore((s) => s.leadDay);
  const isDemo = useIsDemo();

  const overview = useAsync(async () => (isDemo ? demoOverview(leadDay) : getOverview(leadDay)), [leadDay, isDemo]);
  const map = useAsync(async () => (isDemo ? demoConfidenceMap(leadDay) : getConfidenceMap(leadDay)), [leadDay, isDemo]);
  const dayWise = useAsync(async () => (isDemo ? demoDayWiseConfidence() : getDayWiseConfidence()), [isDemo]);
  const risk = useAsync(async () => (isDemo ? demoRiskAreas(leadDay, 20) : getRiskAreas(leadDay, 20)), [leadDay, isDemo]);
  const alerts = useAsync(async () => (isDemo ? demoAlerts() : getAlerts(leadDay)), [leadDay, isDemo]);

  const reloadAll = () => {
    overview.reload();
    map.reload();
    dayWise.reload();
    risk.reload();
    alerts.reload();
  };

  return { leadDay, isDemo, overview, map, dayWise, risk, alerts, reloadAll };
}
