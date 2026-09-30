import { useMemo, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { getDayWiseConfidence, getRegionDetails } from '../../services/api';
import type { ForecastRegion, RegionAnalysis } from '../../types';

export interface DayStat {
  day: number;
  meanConfidence: number;
  meanBustProbability: number;
}

export interface LandingData {
  /** Active lead day for the map / timeline (local landing state). */
  leadDay: number;
  setLeadDay: (d: number) => void;
  /** Effective day once the service payload is known. */
  activeDay: number;
  days: number[];
  regions: ForecastRegion[];
  dayStats: DayStat[];
  topRisk: ForecastRegion | null;
  analysis: RegionAnalysis | null;
  analysisLoading: boolean;
  loading: boolean;
  unavailable: boolean;
  reload: () => void;
}

/**
 * Single shared data source for the landing experience.
 * Everything rendered from it is service-backed; when the analysis service is
 * unreachable the sections read the bundled analysis snapshot instead, which
 * the app labels with its snapshot notice.
 */
export function useLandingData(): LandingData {
  const dayWise = useAsync(async () => getDayWiseConfidence(), []);
  const [leadDay, setLeadDay] = useState(5);

  const payload = dayWise.data;
  const days = useMemo(() => payload?.days?.length ? [...payload.days].sort((a, b) => a - b) : [], [payload]);

  const activeDay = useMemo(() => {
    if (!days.length) return leadDay;
    return days.includes(leadDay) ? leadDay : days[Math.min(days.length - 1, Math.max(0, leadDay - 1))] ?? days[0];
  }, [days, leadDay]);

  const regions = useMemo<ForecastRegion[]>(() => {
    if (!payload) return [];
    const byId = new Map(payload.regions.map((r) => [r.region_id, r]));
    const out: ForecastRegion[] = [];
    for (const cell of payload.cells) {
      if (cell.lead_day !== activeDay) continue;
      const info = byId.get(cell.region_id);
      if (!info) continue;
      out.push({ ...info, ...cell, lead_day: activeDay });
    }
    return out;
  }, [payload, activeDay]);

  const dayStats = useMemo<DayStat[]>(() => {
    if (!payload) return [];
    return days.map((day) => {
      const cells = payload.cells.filter((c) => c.lead_day === day);
      const n = cells.length || 1;
      const meanConfidence = cells.reduce((s, c) => s + c.confidence, 0) / n;
      const meanBust = cells.reduce((s, c) => s + c.bust_probability, 0) / n;
      return {
        day,
        meanConfidence: cells.length ? Math.round(meanConfidence * 10) / 10 : 0,
        meanBustProbability: cells.length ? Math.round(meanBust * 1000) / 1000 : 0,
      };
    });
  }, [payload, days]);

  const topRisk = useMemo(
    () => (regions.length ? [...regions].sort((a, b) => b.bust_probability - a.bust_probability)[0] : null),
    [regions],
  );

  const analysis = useAsync<RegionAnalysis | null>(
    async () => (topRisk ? getRegionDetails(topRisk.region_id, activeDay) : null),
    [topRisk?.region_id ?? '', activeDay],
  );

  return {
    leadDay: activeDay,
    setLeadDay,
    activeDay,
    days,
    regions,
    dayStats,
    topRisk,
    analysis: analysis.data,
    analysisLoading: analysis.loading,
    loading: dayWise.loading,
    unavailable: dayWise.unavailable,
    reload: dayWise.reload,
  };
}
