import { useEffect, useMemo, useState } from 'react';
import type { ForecastRegion, MapLayer } from '../types';
import type { LayerMetric } from '../components/map/ConfidenceMap';
import {
  DEMO_FORCED,
  getHistoricalAnalogues,
  getRegionDetails,
  demoHistory,
  demoRegionDetails,
} from '../services/api';
import { mapConcurrent } from '../utils/async';
import { useAppStore } from '../store/useAppStore';

const SPREAD_TOKENS = /mm_|spread|ensemble|disagreement|range_temp|cv_temp|std_temp|std_precip/i;

const cache = new Map<string, LayerMetric>();

function normalize(values: Record<string, number>): LayerMetric {
  const nums = Object.values(values);
  if (!nums.length) return {};
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const out: LayerMetric = {};
  for (const [k, v] of Object.entries(values)) out[k] = (v - min) / span;
  return out;
}

/**
 * Builds per-region metrics for the two derived map layers:
 *  - disagreement : magnitude of multi-model-spread features in the model's
 *                   own SHAP top drivers (real model output).
 *  - error        : mean realised historical forecast error from `/history`.
 * Both require N requests, so results are cached by (layer, lead day, source).
 */
export function useMapMetrics(
  layer: MapLayer,
  regions: ForecastRegion[],
  leadDay: number,
): { metrics: LayerMetric | null; loading: boolean; label?: string } {
  const mode = useAppStore((s) => s.mode);
  const backendState = useAppStore((s) => s.backendState);
  const [metrics, setMetrics] = useState<LayerMetric | null>(null);
  const [loading, setLoading] = useState(false);

  const isDemo = mode === 'demo' || (mode === 'auto' && backendState === 'offline');
  const useLive = !isDemo && !DEMO_FORCED;
  const ids = useMemo(() => regions.map((r) => r.region_id).sort().join(','), [regions]);

  useEffect(() => {
    if (layer !== 'disagreement' && layer !== 'error') {
      setMetrics(null);
      setLoading(false);
      return;
    }
    const key = `${layer}:${useLive ? 'live' : 'demo'}:${leadDay}:${ids}`;
    const cached = cache.get(key);
    if (cached) {
      setMetrics(cached);
      setLoading(false);
      return;
    }
    if (!regions.length) {
      setMetrics({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMetrics(null);

    (async () => {
      const raw: Record<string, number> = {};
      if (layer === 'disagreement') {
        await mapConcurrent(regions, 5, async (r) => {
          const analysis = useLive
            ? await getRegionDetails(r.region_id, leadDay)
            : demoRegionDetails(r.region_id, leadDay);
          const spread = analysis.reasons
            .filter((reason) => SPREAD_TOKENS.test(reason.feature))
            .reduce((s, reason) => s + Math.abs(reason.contribution), 0);
          raw[r.region_id] = spread;
        });
      } else {
        await mapConcurrent(regions, 5, async (r) => {
          const history = useLive ? await getHistoricalAnalogues(r.region_id, 30) : demoHistory(r.region_id, 30);
          if (!history.length) return;
          const mean = history.reduce((s, h) => s + h.actual_error, 0) / history.length;
          raw[r.region_id] = mean;
        });
      }
      const normalised = normalize(raw);
      cache.set(key, normalised);
      if (!cancelled) setMetrics(normalised);
    })()
      .catch(() => {
        if (!cancelled) setMetrics(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, leadDay, ids, useLive]);

  return {
    metrics,
    loading,
    label: layer === 'disagreement' ? 'SHAP spread contribution (normalised)' : 'Mean realised error (normalised)',
  };
}
