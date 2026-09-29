import React from 'react';
import { cn } from '../../utils/cn';
import { DataSourceBadge, EmptyState, ErrorState } from '../ui/states';
import type { DataSource } from '../../types';

export function PageHeader({
  eyebrow,
  title,
  description,
  controls,
  source,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  controls?: React.ReactNode;
  source?: DataSource | 'unknown';
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {source && <DataSourceBadge source={source === 'unknown' ? 'unknown' : source} />}
          </div>
          <h1 className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-navy-900 sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {controls && <div className="mt-4">{controls}</div>}
    </div>
  );
}

export function AsyncSection<T>({
  state,
  skeleton,
  children,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onEnableDemo,
  showUnavailableAction,
  className,
}: {
  state: { data: T | null; loading: boolean; error: Error | null; unavailable: boolean; reload: () => void };
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEnableDemo?: () => void;
  showUnavailableAction?: boolean;
  className?: string;
}) {
  if (state.loading && !state.data) return <div className={className}>{skeleton}</div>;

  if (state.error && !state.data) {
    if (state.unavailable) {
      return (
        <div className={className}>
          <ErrorState
            onRetry={state.reload}
            extraAction={
              showUnavailableAction && onEnableDemo ? (
                <button
                  onClick={onEnableDemo}
                  className="rounded-lg border border-ice-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 shadow-soft transition hover:border-blue-300 hover:bg-ice-50"
                >
                  View cached demo analysis
                </button>
              ) : undefined
            }
          />
        </div>
      );
    }
    return (
      <div className={className}>
        <ErrorState title="This module could not be loaded." description={state.error.message} onRetry={state.reload} />
      </div>
    );
  }

  if (!state.data) return <div className={className}>{skeleton}</div>;

  if (isEmpty?.(state.data)) {
    return (
      <div className={className}>
        <EmptyState title={emptyTitle ?? 'Nothing to show.'} description={emptyDescription} />
      </div>
    );
  }

  return <div className={className}>{children(state.data)}</div>;
}
