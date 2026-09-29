import React from 'react';
import { cn } from '../../utils/cn';
import { useCountUp } from '../../hooks/useAsync';

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'secondary',
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';
  const styles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-soft px-4 py-2.5',
    secondary: 'bg-white text-navy-800 border border-ice-200 hover:border-blue-300 hover:bg-ice-50 px-4 py-2.5 shadow-soft',
    ghost: 'text-slate-600 hover:text-navy-900 hover:bg-ice-100 px-3 py-2',
    danger: 'bg-risk-critical text-white hover:brightness-110 px-4 py-2.5 shadow-soft',
  };
  return (
    <button className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Badge */

export function Badge({
  tone = 'neutral',
  className,
  children,
  title,
}: {
  tone?: 'neutral' | 'blue' | 'low' | 'moderate' | 'high' | 'critical' | 'demo' | 'live';
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
    blue: 'bg-blue-100 text-blue-700 ring-blue-200',
    low: 'bg-blue-50 text-blue-700 ring-blue-200',
    moderate: 'bg-amber-50 text-amber-700 ring-amber-200',
    high: 'bg-orange-50 text-orange-700 ring-orange-200',
    critical: 'bg-red-50 text-red-700 ring-red-200',
    demo: 'bg-violet-50 text-violet-700 ring-violet-200',
    live: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- Panel */

export function Panel({
  className,
  children,
  hover = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div className={cn('panel', hover && 'panel-hover', className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------- Select */

export function Select({
  label,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      {label && <span className="eyebrow">{label}</span>}
      <select
        className={cn(
          'h-9 rounded-lg border border-ice-200 bg-white px-3 text-sm font-medium text-navy-800 shadow-soft',
          'transition-colors hover:border-blue-300 focus:border-blue-400 appearance-none bg-no-repeat',
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22%23687d92%22><path d=%22M6 8.5 1.5 4h9z\"/></svg>')] bg-[right_0.7rem_center] pr-8",
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/* ------------------------------------------------------------------ Slider */

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
  className,
}: {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  className?: string;
}) {
  const pctPos = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        {label && <span className="eyebrow">{label}</span>}
        <span className="data-value text-xs font-semibold text-blue-700">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ice-200 accent-blue-600"
        style={{
          background: `linear-gradient(90deg, #1c6fb2 ${pctPos}%, #d3e8f8 ${pctPos}%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------- Segmented control */

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: {
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-lg border border-ice-200 bg-white p-0.5 shadow-soft"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md font-semibold transition-all duration-200 ease-smooth',
              size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
              active ? 'bg-blue-600 text-white shadow-soft' : 'text-slate-600 hover:bg-ice-50 hover:text-navy-900',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- Stat */

export function Stat({
  label,
  value,
  sub,
  tone,
  animate = false,
  suffix,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: React.ReactNode;
  tone?: 'default' | 'risk' | 'calm';
  animate?: boolean;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  const numeric = typeof value === 'number' ? value : Number(value);
  const hasNumeric = Number.isFinite(numeric);
  const counted = useCountUp(hasNumeric && animate ? numeric : 0, 650);
  const shown = hasNumeric && animate ? counted : value;
  const display = typeof shown === 'number' ? (Number.isInteger(numeric) ? Math.round(shown) : shown.toFixed(1)) : shown;
  const toneClass = tone === 'risk' ? 'text-risk-critical' : tone === 'calm' ? 'text-blue-600' : 'text-navy-900';
  return (
    <div className="panel flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-blue-500">{icon}</span>}
        <span className="eyebrow">{label}</span>
      </div>
      <div className={cn('data-value text-2xl font-bold leading-none tracking-tight', toneClass)}>
        {display}
        {suffix && <span className="ml-0.5 text-sm font-semibold opacity-70">{suffix}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------- Ring */

export function ConfidenceRing({
  value,
  size = 96,
  stroke = 9,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const animated = useCountUp(value, 800);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, animated)) / 100) * c;
  const color = value >= 80 ? '#4fa8dd' : value >= 60 ? '#2c7fbe' : value >= 40 ? '#f0a15c' : '#e2574c';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={label ?? `Confidence ${Math.round(value)} percent`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7f2fc" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="data-value text-xl font-bold leading-none text-navy-900">{Math.round(animated)}%</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
          {label ?? 'confidence'}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Progress */

export function ProbabilityBar({
  value,
  height = 8,
  showLabel = true,
}: {
  value: number;
  height?: number;
  showLabel?: boolean;
}) {
  const v = Math.max(0, Math.min(1, value));
  const color = v >= 0.75 ? '#dd5145' : v >= 0.5 ? '#ef9455' : v >= 0.25 ? '#f2c14e' : '#7ec8e8';
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className="relative flex-1 overflow-hidden rounded-full bg-ice-100"
        style={{ height }}
        role="meter"
        aria-valuenow={Math.round(v * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Bust probability ${Math.round(v * 100)} percent`}
      >
        <div
          className="nrk-bar absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-smooth"
          style={{ width: `${v * 100}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="data-value w-10 text-right text-xs font-semibold text-navy-800">{Math.round(v * 100)}%</span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Tooltip */

export function InfoTip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      role="note"
      aria-label={text}
      title={text}
      className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-ice-200 bg-white text-[10px] font-bold text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
    >
      ?
    </span>
  );
}
