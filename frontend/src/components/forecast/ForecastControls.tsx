import { VARIABLES } from '../../types';
import type { VariableKey } from '../../types';
import { Select, SegmentedControl, Slider, InfoTip } from '../ui/primitives';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

/**
 * The persistent forecast control bar used across dashboard-level pages:
 * lead day, variable, risk/confidence thresholds and map layer.
 */
export function ForecastControls({
  showThresholds = false,
  showLayer = false,
  className,
}: {
  showThresholds?: boolean;
  showLayer?: boolean;
  className?: string;
}) {
  const {
    leadDay,
    setLeadDay,
    variable,
    setVariable,
    confidenceThreshold,
    setConfidenceThreshold,
    riskThreshold,
    setRiskThreshold,
    mapLayer,
    setMapLayer,
  } = useAppStore();

  const layers: { value: 'confidence' | 'bust' | 'risk_heat' | 'disagreement' | 'error'; label: string }[] = [
    { value: 'confidence', label: 'Confidence' },
    { value: 'bust', label: 'Bust prob.' },
    { value: 'risk_heat', label: 'Risk heat' },
    { value: 'disagreement', label: 'Model spread' },
    { value: 'error', label: 'Forecast error' },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-x-5 gap-y-3 rounded-xl border border-ice-200 bg-white px-4 py-3 shadow-soft',
        className,
      )}
    >
      <div className="min-w-[240px] flex-1">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="eyebrow flex items-center gap-1.5">
            Lead day
            <InfoTip text="Forecast lead time from initialisation. Press [ and ] to step." />
          </span>
          <span className="data-value rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
            DAY {leadDay}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={leadDay}
          aria-label="Lead day"
          onChange={(e) => setLeadDay(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(90deg, #1c6fb2 ${((leadDay - 1) / 9) * 100}%, #d3e8f8 ${((leadDay - 1) / 9) * 100}%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-[9px] font-semibold text-slate-400">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={cn(leadDay === i + 1 && 'text-blue-600')}>
              D{i + 1}
            </span>
          ))}
        </div>
      </div>

      <Select label="Variable" value={variable} onChange={(e) => setVariable(e.target.value as VariableKey)}>
        {VARIABLES.map((v) => (
          <option key={v.key} value={v.key}>
            {v.label}
          </option>
        ))}
      </Select>

      {showThresholds && (
        <>
          <Slider
            label="Confidence threshold"
            min={0}
            max={100}
            step={5}
            value={confidenceThreshold}
            onChange={setConfidenceThreshold}
            format={(v) => `${v}%`}
            className="w-40"
          />
          <Slider
            label="Risk threshold"
            min={0.1}
            max={0.9}
            step={0.05}
            value={riskThreshold}
            onChange={setRiskThreshold}
            format={(v) => v.toFixed(2)}
            className="w-40"
          />
        </>
      )}

      {showLayer && (
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Map layer</span>
          <SegmentedControl
            ariaLabel="Map layer"
            size="sm"
            options={layers}
            value={mapLayer}
            onChange={setMapLayer}
          />
        </div>
      )}
    </div>
  );
}
