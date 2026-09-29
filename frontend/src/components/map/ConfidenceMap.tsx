import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ForecastRegion, MapLayer } from '../../types';
import { confidenceColor, riskColor } from '../../utils/risk';
import { cn } from '../../utils/cn';

const BASE_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const BASE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const INDIA_CENTER: [number, number] = [22.8, 79.5];
const INDIA_ZOOM = 5;

function tooltipHtml(r: ForecastRegion, layer: MapLayer): string {
  const head = `<div style="padding:9px 11px;border-bottom:1px solid #e7f2fc">
      <div style="font-weight:700;font-size:12.5px;color:#0b1f38">${r.name}</div>
      <div style="font-size:10.5px;color:#687d92;margin-top:1px">${r.admin1 ?? 'India'} · Day ${r.lead_day}</div>
    </div>`;
  const rows: [string, string][] = [];
  if (layer === 'bust' || layer === 'risk_heat') {
    rows.push(['Bust probability', `${Math.round(r.bust_probability * 100)}%`]);
    rows.push(['Confidence', `${r.confidence}%`]);
  } else {
    rows.push(['Confidence', `${r.confidence}%`]);
    rows.push(['Bust probability', `${Math.round(r.bust_probability * 100)}%`]);
  }
  rows.push(['Risk level', r.bust_risk.toUpperCase()]);
  rows.push(['Category', r.confidence_category.replace(/_/g, ' ')]);
  const body = rows
    .map(
      ([k, v]) =>
        `<div style="display:flex;justify-content:space-between;gap:16px;padding:3px 11px">
           <span style="font-size:11px;color:#687d92">${k}</span>
           <span style="font-size:11px;font-weight:700;color:#0b1f38;font-variant-numeric:tabular-nums">${v}</span>
         </div>`,
    )
    .join('');
  return `${head}${body}<div style="padding:6px 11px 9px;font-size:10px;color:#94a5b7">Click for full analysis</div>`;
}

export interface LayerMetric {
  [regionId: string]: number;
}

export function ConfidenceMap({
  regions,
  layer,
  selectedId,
  onSelect,
  metrics,
  metricLabel,
  scan = true,
  className,
  height = 520,
}: {
  regions: ForecastRegion[];
  layer: MapLayer;
  selectedId?: string | null;
  onSelect?: (regionId: string) => void;
  metrics?: LayerMetric | null;
  metricLabel?: string;
  scan?: boolean;
  className?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [tileError, setTileError] = useState(false);
  const [ready, setReady] = useState(false);

  /* ---------------------------------------------------------- initialise */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      minZoom: 3,
      maxZoom: 11,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      preferCanvas: true,
    });
    const tiles = L.tileLayer(BASE_TILES, {
      attribution: BASE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
      detectRetina: true,
    });
    tiles.on('tileerror', () => setTileError(true));
    tiles.on('tileload', () => setTileError(false));
    tiles.addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setReady(true);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  /* ------------------------------------------------------------- markers */
  useEffect(() => {
    if (!ready || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    for (const r of regions) {
      const metric = metrics ? (metrics[r.region_id] ?? 0) : null;
      let radius = 11;
      let fill = confidenceColor(r.confidence);
      let fillOpacity = 0.85;
      let stroke = '#ffffff';
      let strokeWidth = 2;

      if (layer === 'bust') {
        radius = 7 + r.bust_probability * 13;
        fill = riskColor(r.bust_probability);
        fillOpacity = 0.9;
      } else if (layer === 'risk_heat') {
        radius = 22 + r.bust_probability * 34;
        fill = riskColor(r.bust_probability);
        fillOpacity = 0.24;
        stroke = fill;
        strokeWidth = 1;
      } else if (layer === 'disagreement') {
        const v = metric ?? 0;
        radius = 7 + v * 14;
        fill = v > 0.66 ? '#dd5145' : v > 0.33 ? '#ef9455' : '#7ec8e8';
        fillOpacity = 0.85;
      } else if (layer === 'error') {
        const v = metric ?? 0;
        radius = 7 + Math.min(1, v) * 14;
        fill = v > 0.66 ? '#dd5145' : v > 0.33 ? '#ef9455' : '#7ec8e8';
        fillOpacity = 0.85;
      }

      const isSelected = selectedId === r.region_id;
      const marker = L.circleMarker([r.lat, r.lon], {
        radius,
        color: isSelected ? '#0b1f38' : stroke,
        weight: isSelected ? 3 : strokeWidth,
        fillColor: fill,
        fillOpacity,
        opacity: 0.95,
      });

      if (layer === 'confidence' && r.bust_probability >= 0.75) {
        L.circleMarker([r.lat, r.lon], {
          radius: radius + 7,
          color: '#dd5145',
          weight: 1.5,
          dashArray: '3 4',
          fill: false,
          opacity: 0.75,
          interactive: false,
        }).addTo(group);
      }

      marker.bindTooltip(tooltipHtml(r, layer), {
        className: 'nrk-tooltip',
        direction: 'top',
        offset: [0, -8],
        opacity: 1,
      });
      marker.on('click', () => onSelect?.(r.region_id));
      marker.addTo(group);
    }

    if (regions.length) {
      const bounds = L.latLngBounds(regions.map((r) => [r.lat, r.lon] as [number, number]));
      mapRef.current?.fitBounds(bounds.pad(0.22), { animate: true, duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, regions, layer, selectedId, metrics, onSelect]);

  /* Follow selection from elsewhere in the app */
  useEffect(() => {
    if (!ready || !selectedId || !mapRef.current) return;
    const r = regions.find((x) => x.region_id === selectedId);
    if (!r) return;
    mapRef.current.panTo([r.lat, r.lon], { animate: true, duration: 0.5 });
  }, [ready, selectedId, regions]);

  const resetView = () => mapRef.current?.flyTo(INDIA_CENTER, INDIA_ZOOM, { duration: 0.7 });

  const legend = useMemo(() => <MapLegend layer={layer} metricLabel={metricLabel} />, [layer, metricLabel]);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl border border-ice-200 bg-ice-100 shadow-soft', className)} style={{ height }}>
      <div ref={containerRef} className="absolute inset-0 z-0" role="application" aria-label="India forecast confidence map" />

      {scan && <div className="map-scan" />}

      {!ready && (
        <div className="absolute inset-0 z-[450] flex items-center justify-center bg-ice-50">
          <div className="grid-paper absolute inset-0 opacity-70" />
          <p className="relative text-sm font-medium text-slate-500">Initialising map…</p>
        </div>
      )}

      {tileError && (
        <div className="absolute left-1/2 top-3 z-[600] w-[min(92%,440px)] -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50/95 px-3.5 py-2 text-center text-[11px] font-medium text-amber-800 shadow-soft backdrop-blur">
          Basemap tiles could not be fetched (offline?). Region markers and all intelligence layers remain available.
        </div>
      )}

      {/* reset view */}
      <button
        onClick={resetView}
        className="absolute right-3 top-3 z-[600] rounded-lg border border-ice-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-navy-800 shadow-soft backdrop-blur transition hover:border-blue-300"
      >
        Reset view
      </button>

      {/* layer readout */}
      <div className="absolute left-3 top-3 z-[600] flex items-center gap-2 rounded-lg border border-ice-200 bg-white/92 px-3 py-1.5 shadow-soft backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <span className="text-[11px] font-semibold text-navy-800">
          {layer === 'confidence' && 'Confidence layer'}
          {layer === 'bust' && 'Bust probability layer'}
          {layer === 'risk_heat' && 'Risk heat layer'}
          {layer === 'disagreement' && 'Model disagreement layer'}
          {layer === 'error' && 'Forecast error layer'}
        </span>
        <span className="data-value text-[10px] text-slate-400">Day {regions[0]?.lead_day ?? '—'}</span>
      </div>

      {legend}
    </div>
  );
}

/* ------------------------------------------------------------------ legend */

export function MapLegend({ layer, metricLabel }: { layer: MapLayer; metricLabel?: string }) {
  const confidence = [
    { label: 'HIGH', color: '#4fa8dd', hint: '≥ 80' },
    { label: 'MODERATE', color: '#2c7fbe', hint: '60–79' },
    { label: 'LOW', color: '#f0a15c', hint: '40–59' },
    { label: 'VERY LOW', color: '#e2574c', hint: '< 40' },
  ];
  const bust = [
    { label: 'LOW', color: '#7ec8e8', hint: '< 0.25' },
    { label: 'MODERATE', color: '#f2c14e', hint: '0.25–0.49' },
    { label: 'HIGH', color: '#ef9455', hint: '0.50–0.74' },
    { label: 'VERY HIGH', color: '#dd5145', hint: '≥ 0.75' },
  ];

  const showConfidence = layer === 'confidence';
  const showBust = layer === 'bust' || layer === 'risk_heat';
  const showMetric = layer === 'disagreement' || layer === 'error';

  return (
    <div className="absolute bottom-6 left-3 z-[600] rounded-lg border border-ice-200 bg-white/94 p-2.5 shadow-soft backdrop-blur">
      <div className="space-y-2">
        {showConfidence && (
          <div>
            <div className="eyebrow mb-1 !text-[9px]">Confidence</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {confidence.map((c) => (
                <span key={c.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[10px] font-semibold text-navy-800">{c.label}</span>
                  <span className="data-value text-[9px] text-slate-400">{c.hint}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {showBust && (
          <div>
            <div className="eyebrow mb-1 !text-[9px]">Bust probability</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {bust.map((c) => (
                <span key={c.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[10px] font-semibold text-navy-800">{c.label}</span>
                  <span className="data-value text-[9px] text-slate-400">{c.hint}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {showMetric && (
          <div>
            <div className="eyebrow mb-1 !text-[9px]">{metricLabel ?? 'Normalised metric'}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {[
                { label: 'LOW', color: '#7ec8e8' },
                { label: 'MODERATE', color: '#ef9455' },
                { label: 'HIGH', color: '#dd5145' },
              ].map((c) => (
                <span key={c.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[10px] font-semibold text-navy-800">{c.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
