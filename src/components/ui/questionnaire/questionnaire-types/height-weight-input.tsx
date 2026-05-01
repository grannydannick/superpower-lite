import { ReactNode, useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { Body1 } from '@/components/ui/typography';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { ScrollPicker } from './scroll-picker';
import {
  buildRange,
  cmToFeetInches,
  DEFAULT_HEIGHT_FEET,
  DEFAULT_HEIGHT_INCHES,
  DEFAULT_WEIGHT_LBS,
  feetInchesToCm,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  HEIGHT_FEET_MAX,
  HEIGHT_FEET_MIN,
  HEIGHT_INCHES_MAX,
  HEIGHT_INCHES_MIN,
  kgToLb,
  lbToKg,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  WEIGHT_LB_MAX,
  WEIGHT_LB_MIN,
} from './unit-conversion';
import { UnitNumericInput } from './unit-numeric-input';

// ── Pre-computed picker ranges ──────────────────────────────────────

const PICKER = {
  cm: buildRange(HEIGHT_CM_MIN, HEIGHT_CM_MAX),
  feet: buildRange(HEIGHT_FEET_MIN, HEIGHT_FEET_MAX),
  inches: buildRange(HEIGHT_INCHES_MIN, HEIGHT_INCHES_MAX),
  kg: buildRange(WEIGHT_KG_MIN, WEIGHT_KG_MAX),
  lb: buildRange(WEIGHT_LB_MIN, WEIGHT_LB_MAX),
};

// ── Internal primitives ─────────────────────────────────────────────

interface MeasurementFieldProps {
  value: number | undefined;
  fallback: number;
  min: number;
  max: number;
  unit: string;
  placeholder: string;
  pickerValues: number[];
  onChange: (n: number) => void;
  allowDecimal?: boolean;
  /** Wrapper className for the desktop UnitNumericInput (e.g. "relative flex-1") */
  className?: string;
}

/** Renders a ScrollPicker on mobile, UnitNumericInput on desktop. */
function MeasurementField({
  value,
  fallback,
  min,
  max,
  unit,
  placeholder,
  pickerValues,
  onChange,
  allowDecimal,
  className,
}: MeasurementFieldProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ScrollPicker
        values={pickerValues}
        selectedValue={value ?? fallback}
        onChange={onChange}
        formatLabel={(v) => `${v} ${unit}`}
      />
    );
  }

  return (
    <UnitNumericInput
      unit={unit}
      value={value}
      fallback={fallback}
      min={min}
      max={max}
      placeholder={placeholder}
      allowDecimal={allowDecimal}
      onChange={onChange}
      className={className}
    />
  );
}

/** Label + responsive wrapper for one or more MeasurementFields. */
function MeasurementSection({
  label,
  children,
  multiField,
}: {
  label: string;
  children: ReactNode;
  /** When true, wraps children in a flex row for side-by-side fields. */
  multiField?: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(isMobile && 'flex w-full flex-col items-center')}>
      <Body1
        className={isMobile ? 'mb-2 font-medium' : 'mb-1.5 text-sm font-medium'}
      >
        {label}
      </Body1>
      {multiField ? (
        <div className={cn('flex gap-2', isMobile && 'w-full')}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

// ── Unit toggle ─────────────────────────────────────────────────────

function UnitSystemToggle({
  isMetric,
  onChange,
}: {
  isMetric: boolean;
  onChange: (isMetric: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 md:justify-start">
      <Body1
        className={cn(
          'transition-opacity',
          !isMetric ? 'font-medium opacity-100' : 'opacity-50',
        )}
      >
        Imperial
      </Body1>
      <Switch checked={isMetric} onCheckedChange={onChange} />
      <Body1
        className={cn(
          'transition-opacity',
          isMetric ? 'font-medium opacity-100' : 'opacity-50',
        )}
      >
        Metric
      </Body1>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────

export interface HeightWeightGroupProps {
  feet: number | undefined;
  inches: number | undefined;
  weightLbs: number | undefined;
  onFeetChange: (feet: number) => void;
  onInchesChange: (inches: number) => void;
  onWeightChange: (lbs: number) => void;
  /** Batch-update both feet and inches in a single store write. */
  onHeightChange: (feet: number, inches: number) => void;
}

export function HeightWeightGroup({
  feet,
  inches,
  weightLbs,
  onFeetChange,
  onInchesChange,
  onWeightChange,
  onHeightChange,
}: HeightWeightGroupProps) {
  const isMobile = useIsMobile();
  const [isMetric, setIsMetric] = useState(false);

  // Local metric values to avoid roundtrip precision loss (e.g. 181cm → 5'11" → 180cm)
  const [metricCm, setMetricCm] = useState<number | null>(null);
  const [metricKg, setMetricKg] = useState<number | null>(null);

  const handleMetricCmChange = (cm: number) => {
    setMetricCm(cm);
    const converted = cmToFeetInches(cm);
    onHeightChange(converted.feet, converted.inches);
  };

  const handleMetricKgChange = (kg: number) => {
    setMetricKg(kg);
    onWeightChange(kgToLb(kg));
  };

  const handleToggle = (toMetric: boolean) => {
    if (toMetric) {
      setMetricCm(
        feetInchesToCm(
          feet ?? DEFAULT_HEIGHT_FEET,
          inches ?? DEFAULT_HEIGHT_INCHES,
        ),
      );
      setMetricKg(lbToKg(weightLbs ?? DEFAULT_WEIGHT_LBS));
    } else {
      setMetricCm(null);
      setMetricKg(null);
    }
    setIsMetric(toMetric);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          isMobile
            ? 'flex w-full justify-evenly gap-4'
            : 'grid grid-cols-2 gap-4',
        )}
      >
        <MeasurementSection label="Height" multiField={!isMetric}>
          {isMetric ? (
            <MeasurementField
              unit="cm"
              value={metricCm ?? undefined}
              fallback={feetInchesToCm(
                feet ?? DEFAULT_HEIGHT_FEET,
                inches ?? DEFAULT_HEIGHT_INCHES,
              )}
              min={HEIGHT_CM_MIN}
              max={HEIGHT_CM_MAX}
              placeholder="170"
              pickerValues={PICKER.cm}
              onChange={handleMetricCmChange}
            />
          ) : (
            <>
              <MeasurementField
                unit="ft"
                value={feet}
                fallback={DEFAULT_HEIGHT_FEET}
                min={HEIGHT_FEET_MIN}
                max={HEIGHT_FEET_MAX}
                placeholder="5"
                pickerValues={PICKER.feet}
                onChange={(f) => {
                  setMetricCm(null);
                  onFeetChange(f);
                }}
                className="relative flex-1"
              />
              <MeasurementField
                unit="in"
                value={inches}
                fallback={DEFAULT_HEIGHT_INCHES}
                min={HEIGHT_INCHES_MIN}
                max={HEIGHT_INCHES_MAX}
                placeholder="6"
                pickerValues={PICKER.inches}
                onChange={(i) => {
                  setMetricCm(null);
                  onInchesChange(i);
                }}
                className="relative flex-1"
              />
            </>
          )}
        </MeasurementSection>

        <MeasurementSection label="Weight">
          {isMetric ? (
            <MeasurementField
              unit="kg"
              value={metricKg ?? undefined}
              fallback={lbToKg(weightLbs ?? DEFAULT_WEIGHT_LBS)}
              min={WEIGHT_KG_MIN}
              max={WEIGHT_KG_MAX}
              placeholder="70"
              allowDecimal
              pickerValues={PICKER.kg}
              onChange={handleMetricKgChange}
            />
          ) : (
            <MeasurementField
              unit="lb"
              value={weightLbs}
              fallback={DEFAULT_WEIGHT_LBS}
              min={WEIGHT_LB_MIN}
              max={WEIGHT_LB_MAX}
              placeholder="120"
              pickerValues={PICKER.lb}
              onChange={(lbs) => {
                setMetricKg(null);
                onWeightChange(lbs);
              }}
            />
          )}
        </MeasurementSection>
      </div>
      <UnitSystemToggle isMetric={isMetric} onChange={handleToggle} />
    </div>
  );
}
