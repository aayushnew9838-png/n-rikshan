import React from 'react';
import { cn } from '../../utils/cn';
import { EmptyState, ErrorState } from '../ui/states';

export function PageHeader({
  eyebrow,
  title,
  description,
  controls,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  controls?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
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
  className,
}: {
  state: { data: T | null; loading: boolean; error: Error | null; unavailable: boolean; reload: () => void };
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  if (state.loading && !state.data) return <div className={className}>{skeleton}</div>;

  if (state.error && !state.data) {
    if (state.unavailable) {
      return (
        <div className={className}>
          <ErrorState
            title="Forecast intelligence unavailable"
            description="The analysis service could not be reached for this view."
            onRetry={state.reload}
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
