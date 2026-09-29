import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../store/useAppStore';
import type { BackendState } from '../store/useAppStore';
import {
  DEMO_DISABLED,
  DEMO_FORCED,
  currentPrefix,
  getHealth,
  getRegions,
  resetProbe,
} from '../services/api';
import { DEMO_REGIONS } from '../data/demo/regions';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, backendState, setBackendState, setRegions, leadDay } = useAppStore();
  const [navOpen, setNavOpen] = useState(false);
  const collapsed = useAppStore((s) => s.navCollapsed);
  const setCollapsed = useAppStore((s) => s.setNavCollapsed);

  /* Backend probe ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    setBackendState('probing');
    getHealth()
      .then(() => {
        if (!cancelled) setBackendState('online');
      })
      .catch(() => {
        if (!cancelled) setBackendState('offline');
      });
    return () => {
      cancelled = true;
    };
  }, [setBackendState, location.pathname]);

  /* Region catalogue for drawers / watchlists --------------------------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const state = useAppStore.getState();
      const demoMode = state.mode === 'demo' || (state.mode === 'auto' && state.backendState === 'offline') || DEMO_FORCED;
      if (demoMode) {
        setRegions(
          DEMO_REGIONS.map((r) => ({
            region_id: r.region_id,
            name: r.name,
            lat: r.lat,
            lon: r.lon,
            admin1: r.admin1,
          })),
        );
        return;
      }
      try {
        const regions = await getRegions();
        if (!cancelled) setRegions(regions);
      } catch {
        /* drawer falls back to the region id */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [setRegions, mode, backendState]);

  /* Keyboard shortcuts --------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === '[') useAppStore.getState().setLeadDay(useAppStore.getState().leadDay - 1);
      if (e.key === ']') useAppStore.getState().setLeadDay(useAppStore.getState().leadDay + 1);
      if (e.key === 'm' || e.key === 'M') navigate('/map');
      if (e.key === 'd' || e.key === 'D') navigate('/dashboard');
      if (e.key === '?' && e.shiftKey) navigate('/how-it-works');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const effectiveMode: 'live' | 'demo' =
    mode === 'demo' || (mode === 'auto' && backendState === 'offline') ? 'demo' : 'live';

  const enableDemo = () => {
    resetProbe();
    setMode('demo');
  };
  const retry = () => {
    resetProbe();
    setMode(DEMO_FORCED ? 'demo' : DEMO_DISABLED ? 'live' : 'auto');
    setBackendState('probing');
    getHealth()
      .then(() => setBackendState('online'))
      .catch(() => setBackendState('offline'));
  };

  const prefix = currentPrefix();


  return (
    <div className="flex h-full w-full overflow-hidden bg-ice-50">
      {/* Desktop rail */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          navOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!navOpen}
      >
        <div
          className={cn('absolute inset-0 bg-navy-950/40 transition-opacity duration-300', navOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setNavOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-64 transform shadow-2xl transition-transform duration-300 ease-smooth',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar collapsed={false} onNavigate={() => setNavOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleNav={() => setNavOpen((v) => !v)} onToggleCollapse={() => setCollapsed(!collapsed)} navOpen={navOpen} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 sm:py-5">
            <Outlet context={{ effectiveMode, enableDemo, retry, leadDay, backendState, prefix }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export interface ShellContext {
  effectiveMode: 'live' | 'demo';
  enableDemo: () => void;
  retry: () => void;
  leadDay: number;
  backendState: BackendState;
  prefix: '/api/v1' | '';
}
