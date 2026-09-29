import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alert, MapLayer, RegionInfo, VariableKey } from '../types';
import { DEMO_DISABLED, DEMO_FORCED } from '../services/api';

export type DataMode = 'auto' | 'live' | 'demo';
export type BackendState = 'unknown' | 'probing' | 'online' | 'offline';

interface AppState {
  /* ---- runtime data mode ------------------------------------------------ */
  mode: DataMode;
  backendState: BackendState;
  setMode: (mode: DataMode) => void;
  setBackendState: (s: BackendState) => void;

  /* ---- forecast selection ---------------------------------------------- */
  leadDay: number;
  variable: VariableKey;
  selectedRegionId: string | null;
  forecastInitTime: string | null;
  setLeadDay: (d: number) => void;
  setVariable: (v: VariableKey) => void;
  selectRegion: (id: string | null) => void;
  setForecastInitTime: (v: string | null) => void;

  /* ---- map --------------------------------------------------------------- */
  mapLayer: MapLayer;
  setMapLayer: (l: MapLayer) => void;
  mapReady: boolean;
  setMapReady: (v: boolean) => void;

  /* ---- thresholds -------------------------------------------------------- */
  confidenceThreshold: number;
  riskThreshold: number;
  setConfidenceThreshold: (v: number) => void;
  setRiskThreshold: (v: number) => void;

  /* ---- watchlist --------------------------------------------------------- */
  watchlist: string[];
  toggleWatchlist: (regionId: string) => void;
  isWatched: (regionId: string) => boolean;

  /* ---- alerts ------------------------------------------------------------ */
  acknowledged: string[];
  acknowledgeAlert: (id: string) => void;
  isAcknowledged: (id: string) => boolean;
  cacheAlerts: Alert[];
  setCacheAlerts: (a: Alert[]) => void;

  /* ---- regions cache ------------------------------------------------------ */
  regions: RegionInfo[];
  setRegions: (r: RegionInfo[]) => void;

  /* ---- ui ---------------------------------------------------------------- */
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  navCollapsed: boolean;
  setNavCollapsed: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: DEMO_FORCED ? 'demo' : DEMO_DISABLED ? 'live' : 'auto',
      backendState: 'unknown',
      setMode: (mode) => set({ mode }),
      setBackendState: (backendState) => set({ backendState }),

      leadDay: 5,
      variable: 'temperature_2m',
      selectedRegionId: null,
      forecastInitTime: null,
      setLeadDay: (leadDay) => set({ leadDay: Math.max(1, Math.min(10, Math.round(leadDay))) }),
      setVariable: (variable) => set({ variable }),
      selectRegion: (selectedRegionId) => set({ selectedRegionId, drawerOpen: Boolean(selectedRegionId) }),
      setForecastInitTime: (forecastInitTime) => set({ forecastInitTime }),

      mapLayer: 'confidence',
      setMapLayer: (mapLayer) => set({ mapLayer }),
      mapReady: false,
      setMapReady: (mapReady) => set({ mapReady }),

      confidenceThreshold: 60,
      riskThreshold: 0.5,
      setConfidenceThreshold: (confidenceThreshold) => set({ confidenceThreshold }),
      setRiskThreshold: (riskThreshold) => set({ riskThreshold }),

      watchlist: ['1253405', 'REG_MUMBAI', 'REG_JAIPUR', 'REG_GUWAHATI'],
      toggleWatchlist: (regionId) =>
        set((s) => ({
          watchlist: s.watchlist.includes(regionId)
            ? s.watchlist.filter((id) => id !== regionId)
            : [...s.watchlist, regionId],
        })),
      isWatched: (regionId) => get().watchlist.includes(regionId),

      acknowledged: [],
      acknowledgeAlert: (id) =>
        set((s) => ({ acknowledged: s.acknowledged.includes(id) ? s.acknowledged : [...s.acknowledged, id] })),
      isAcknowledged: (id) => get().acknowledged.includes(id),
      cacheAlerts: [],
      setCacheAlerts: (cacheAlerts) => set({ cacheAlerts }),

      regions: [],
      setRegions: (regions) => set({ regions }),

      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen, ...(drawerOpen ? {} : { selectedRegionId: null }) }),
      navCollapsed: false,
      setNavCollapsed: (navCollapsed) => set({ navCollapsed }),
    }),
    {
      name: 'nirikshan-ui',
      partialize: (s) => ({
        mode: s.mode,
        leadDay: s.leadDay,
        variable: s.variable,
        mapLayer: s.mapLayer,
        watchlist: s.watchlist,
        acknowledged: s.acknowledged,
        confidenceThreshold: s.confidenceThreshold,
        riskThreshold: s.riskThreshold,
        navCollapsed: s.navCollapsed,
      }),
    },
  ),
);

/** True when the UI should render demo-sourced values. */
export function isDemoMode(state: Pick<AppState, 'mode' | 'backendState'>): boolean {
  if (state.mode === 'demo') return true;
  if (state.mode === 'live') return false;
  return state.backendState === 'offline';
}
