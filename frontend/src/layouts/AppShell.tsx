import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageSkeleton } from '../components/ui/states';
import { cn } from '../utils/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../store/useAppStore';
import type { BackendState } from '../store/useAppStore';
import { currentPrefix, getHealth, getRegions, resetProbe } from '../services/api';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendState, setBackendState, setRegions } = useAppStore();
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
    getRegions()
      .then((regions) => {
        if (!cancelled) setRegions(regions);
      })
      .catch(() => {
        /* drawer falls back to the region id */
      });
    return () => {
      cancelled = true;
    };
  }, [setRegions, backendState]);

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

  const retry = () => {
    resetProbe();
    setBackendState('probing');
    getHealth()
      .then(() => setBackendState('online'))
      .catch(() => setBackendState('offline'));
  };

  const prefix = currentPrefix();
  const leadDay = useAppStore((s) => s.leadDay);


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
            <div key={location.pathname} className="nrk-page">
              <Suspense fallback={<PageSkeleton />}>
                <Outlet context={{ retry, leadDay, backendState, prefix }} />
              </Suspense>
            </div>

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ice-200 pt-4 pb-1 text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-[0.14em] text-slate-500">
                Nirikshan · Forecast Reliability Intelligence
              </span>
              <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <Link className="transition-colors hover:text-blue-600" to="/how-it-works">
                  Methodology
                </Link>
                <Link className="transition-colors hover:text-blue-600" to="/verification">
                  Verification
                </Link>
                <Link className="transition-colors hover:text-blue-600" to="/system">
                  Model information
                </Link>
                <Link className="transition-colors hover:text-blue-600" to="/about">
                  Documentation
                </Link>
                <Link className="transition-colors hover:text-blue-600" to="/system">
                  System status
                </Link>
              </nav>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export interface ShellContext {
  retry: () => void;
  leadDay: number;
  backendState: BackendState;
  prefix: '/api/v1' | '';
}
