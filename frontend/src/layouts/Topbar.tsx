import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { locationToCrumbs } from './Sidebar';
import { IconMenu, IconChevronLeft, IconClock } from '../components/ui/icons';
import { useNow } from '../hooks/useAsync';
import { useAppStore } from '../store/useAppStore';

export function Topbar({
  onToggleNav,
  onToggleCollapse,
  navOpen,
}: {
  onToggleNav: () => void;
  onToggleCollapse: () => void;
  navOpen: boolean;
}) {
  const location = useLocation();
  const now = useNow(1000);
  const crumbs = locationToCrumbs(location.pathname);
  const { backendState, regions } = useAppStore();
  const [initLabel, setInitLabel] = useState<string>('—');

  /* Forecast initialisation is the last synoptic cycle boundary (00/06/12/18Z). */
  useEffect(() => {
    const d = new Date();
    d.setUTCMinutes(0, 0, 0);
    d.setUTCHours(Math.floor(d.getUTCHours() / 6) * 6);
    setInitLabel(`${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}Z`);
  }, []);

  const utc = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 19)}Z`;
  const status =
    backendState === 'online'
      ? { label: 'Service online', className: 'text-emerald-700', dot: 'bg-emerald-500' }
      : backendState === 'offline'
        ? { label: 'Service offline', className: 'text-slate-500', dot: 'bg-slate-400' }
        : { label: 'Connecting', className: 'text-slate-500', dot: 'bg-amber-400' };

  return (
    <header className="sticky top-0 z-40 flex h-[60px] shrink-0 items-center gap-3 border-b border-ice-200 bg-white/85 px-3 backdrop-blur-md sm:px-5">
      <button
        onClick={onToggleNav}
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        className="rounded-lg p-2 text-slate-600 hover:bg-ice-100 lg:hidden"
      >
        <IconMenu />
      </button>
      <button
        onClick={onToggleCollapse}
        aria-label="Collapse navigation rail"
        className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-ice-100 hover:text-navy-900 lg:inline-flex"
      >
        <IconChevronLeft width={16} height={16} />
      </button>

      <div className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-[11px] font-medium">
          <span className="text-slate-400">Nirikshan</span>
          {crumbs.map((c) => (
            <span key={c} className="flex min-w-0 items-center gap-1.5">
              <span className="text-ice-300">/</span>
              <span className="truncate text-navy-800">{c}</span>
            </span>
          ))}
        </nav>
        <div className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:block">
          Forecast Reliability Intelligence
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-ice-200 bg-white px-3 py-1.5 shadow-soft md:flex">
        <IconClock width={13} height={13} className="text-slate-400" />
        <span className="data-value text-[11px] font-semibold text-navy-800" title="Current UTC time">
          {utc}
        </span>
      </div>

      <div className="hidden flex-col items-end xl:flex">
        <span className="eyebrow !text-[9px]">Forecast init</span>
        <span className="data-value text-[11px] font-semibold text-navy-800" title="Initialisation of the active forecast cycle">
          {initLabel}
        </span>
      </div>

      <div
        className="hidden items-center gap-1.5 rounded-lg border border-ice-200 bg-white px-2.5 py-1.5 shadow-soft sm:flex"
        title={backendState === 'online' ? 'Connected to the analysis service' : 'Analysis service connection state'}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
        <span className={cn('text-[11px] font-semibold', status.className)}>{status.label}</span>
      </div>

      <div className="hidden items-center gap-1.5 lg:flex" title="Region catalogue size">
        <span className="data-value text-[11px] font-semibold text-slate-500">
          {regions.length ? `${regions.length} regions` : '—'}
        </span>
      </div>
    </header>
  );
}

export function StatusDot({ state }: { state: 'online' | 'offline' | 'unknown' | 'probing' }) {
  const color =
    state === 'online' ? 'bg-emerald-500' : state === 'offline' ? 'bg-risk-critical' : state === 'probing' ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60', color, state === 'probing' && 'animate-ping')} />
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  );
}
