import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './primitives';
import { useAppStore } from '../../store/useAppStore';

/* ---------------------------------------------------------------- Skeletons */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden="true" />;
}

export function SkeletonPanel({ lines = 3, height = 'h-4' }: { lines?: number; height?: string }) {
  return (
    <div className="panel space-y-3 p-5" aria-hidden="true">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn(height, i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** Whole-view fallback shown while a route chunk is loading. */
export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading view">
      <span className="sr-only">Loading view</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel space-y-3 p-5" aria-hidden="true">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkeletonPanel lines={6} />
        </div>
        <SkeletonPanel lines={6} />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-ice-200 bg-ice-100" aria-hidden="true">
      <div className="grid-paper absolute inset-0 opacity-70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
          <div className="absolute inset-0 animate-pulseRing rounded-full border-2 border-blue-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading confidence map…</p>
      </div>
      <div className="map-scan" />
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="panel p-5" aria-hidden="true">
      <Skeleton className="mb-4 h-4 w-44" />
      <div className="flex items-end gap-2" style={{ height }}>
        {[42, 66, 38, 78, 54, 88, 61, 47, 72, 58, 80, 44].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="panel overflow-hidden p-4" aria-hidden="true">
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DrawerSkeleton() {
  return (
    <div className="space-y-5 p-5" aria-hidden="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/* -------------------------------------------------------------- Empty state */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ice-300 bg-ice-25 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ice-100 text-blue-500">
        {icon ?? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- Error state */

export function ErrorState({
  title = 'Forecast intelligence temporarily unavailable.',
  description,
  onRetry,
  extraAction,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  extraAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-risk-critical shadow-soft">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        <p className="mx-auto mt-1.5 max-w-lg text-sm text-slate-500">
          {description ?? 'The analysis service did not respond. Retry, or check the system status view.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Retry
          </Button>
        )}
        {extraAction}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Status banner */

/**
 * Truthful service-status banner shown above operational views.
 *  - offline + snapshot : amber notice stating the bundled snapshot is shown
 *  - offline            : neutral "intelligence unavailable" notice with retry
 *  - online             : data-completeness notices returned by the service
 * No origin badge is rendered; freshness is communicated with timestamps in
 * the header.
 */
export function StatusBanner({
  notes,
  onRetry,
  className,
}: {
  notes?: string[];
  onRetry?: () => void;
  className?: string;
}) {
  const backendState = useAppStore((s) => s.backendState);
  const snapshotMode = useAppStore((s) => s.snapshotMode);

  if (backendState === 'offline' && snapshotMode) {
    return (
      <div
        role="status"
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 shadow-soft',
          className,
        )}
      >
        <span className="flex items-center gap-2 font-semibold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          Analysis service unreachable — bundled snapshot shown
        </span>
        <span>
          Evaluation figures below are real held-out results; forecast values are a bundled snapshot, not live model output.
        </span>
        {onRetry && (
          <button
            className="ml-auto rounded-md bg-navy-900 px-3 py-1.5 font-semibold text-white transition hover:bg-navy-800"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (backendState === 'offline') {
    return (
      <div
        role="status"
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-ice-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-soft',
          className,
        )}
      >
        <span className="flex items-center gap-2 font-semibold text-navy-900">
          <span className="text-risk-critical" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          Forecast intelligence unavailable
        </span>
        <span>The analysis service could not be reached, so no values are shown for this view.</span>
        {onRetry && (
          <button
            className="ml-auto rounded-md bg-navy-900 px-3 py-1.5 font-semibold text-white transition hover:bg-navy-800"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (backendState !== 'online' || !notes || notes.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800', className)}>
      {notes.map((n) => (
        <span key={n}>• {n}</span>
      ))}
    </div>
  );
}
