import { useOutletContext } from 'react-router-dom';
import type { ShellContext } from '../layouts/AppShell';
import { useAppStore } from '../store/useAppStore';
import { useAsync } from './useAsync';
import {
  getAlerts,
  getConfidenceMap,
  getDayWiseConfidence,
  getOverview,
  getRiskAreas,
} from '../services/api';

export function useShell(): ShellContext {
  return useOutletContext<ShellContext>();
}

/** Forecast intelligence for the active lead day — always service-backed. */
export function useForecastData() {
  const leadDay = useAppStore((s) => s.leadDay);

  const overview = useAsync(async () => getOverview(leadDay), [leadDay]);
  const map = useAsync(async () => getConfidenceMap(leadDay), [leadDay]);
  const dayWise = useAsync(async () => getDayWiseConfidence(), []);
  const risk = useAsync(async () => getRiskAreas(leadDay, 20), [leadDay]);
  const alerts = useAsync(async () => getAlerts(leadDay), [leadDay]);

  const reloadAll = () => {
    overview.reload();
    map.reload();
    dayWise.reload();
    risk.reload();
    alerts.reload();
  };

  return { leadDay, overview, map, dayWise, risk, alerts, reloadAll };
}
