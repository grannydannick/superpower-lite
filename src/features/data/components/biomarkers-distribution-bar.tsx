import NumberFlow from '@number-flow/react';
import { m } from 'framer-motion';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { Body2, H3 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { biomarkerStatusCount } from '@/features/data/utils/biomarkers-status-count';
import { cn } from '@/lib/utils';

import { STATUS_TO_COLOR } from '../../../const/status-to-color';
import { useFilteredBiomarkers } from '../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../stores/data-filter-store';

type FilterTarget = 'all' | 'optimal' | 'normal' | 'out of range';

type ValueKey = 'total' | 'optimal' | 'normal' | 'outOfRange';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BIOMARKER_FILTERS = [
  { target: 'all' as const, label: 'Total', valueKey: 'total' as const },
  {
    target: 'optimal' as const,
    label: 'Optimal',
    valueKey: 'optimal' as const,
  },
  { target: 'normal' as const, label: 'Normal', valueKey: 'normal' as const },
  {
    target: 'out of range' as const,
    label: 'Out of Range',
    valueKey: 'outOfRange' as const,
  },
] as const;

type BiomarkerFilterButtonProps = {
  target: FilterTarget;
  label: string;
  value: number;
  selected: boolean;
  onToggle: (target: FilterTarget) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'>;

const BiomarkerFilterButton = forwardRef<
  HTMLButtonElement,
  BiomarkerFilterButtonProps
>(({ target, label, value, selected, onToggle, className, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex select-none flex-col rounded-lg p-1.5 text-left outline-none transition-all duration-200 focus-visible:bg-zinc-100 focus-visible:outline-none',
        'cursor-pointer disabled:cursor-default',
        className,
      )}
      aria-pressed={selected}
      onClick={() => onToggle(target)}
      {...rest}
    >
      <H3
        className={cn(
          'transition-colors duration-300',
          selected ? 'text-black' : 'text-zinc-400',
        )}
      >
        <NumberFlow value={value} />
      </H3>
      <Body2 className="text-zinc-400">{label}</Body2>
    </button>
  );
});

BiomarkerFilterButton.displayName = 'BiomarkerFilterButton';

export const BiomarkersDistributionBar = ({
  enableToggle,
}: {
  enableToggle?: boolean;
}) => {
  const { selectedRange, updateRange } = useDataFilterStore();
  const biomarkersQuery = useBiomarkers();

  const biomarkers = biomarkersQuery.data?.biomarkers ?? [];

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers: biomarkers,
    enabledFilters: {
      range: false,
      categories: true,
      date: true,
    },
  });

  const numInRange = biomarkerStatusCount(filteredBiomarkers ?? [], [
    'OPTIMAL',
  ]);
  const numNormal = biomarkerStatusCount(filteredBiomarkers ?? [], ['NORMAL']);
  const numOutOfRange = biomarkerStatusCount(filteredBiomarkers ?? [], [
    'HIGH',
    'LOW',
  ]);
  const numTotalBiomarkers = numInRange + numNormal + numOutOfRange;

  const optimalPercent =
    Math.round((numInRange / numTotalBiomarkers) * 100) || 0;
  const normalPercent = Math.round((numNormal / numTotalBiomarkers) * 100) || 0;
  const outOfRangePercent =
    Math.round((numOutOfRange / numTotalBiomarkers) * 100) || 0;

  const handleToggle = (target: FilterTarget) => {
    if (!enableToggle) return;

    updateRange(selectedRange === target ? 'all' : target);
  };

  const valueMap: Record<ValueKey, number> = {
    total: numTotalBiomarkers,
    optimal: numInRange,
    normal: numNormal,
    outOfRange: numOutOfRange,
  };

  return (
    <div className="mb-3 space-y-2">
      <m.div
        className="flex w-full items-center justify-between"
        initial={{ opacity: 0, width: '75%' }}
        animate={{ opacity: 1, width: '100%' }}
        transition={{ duration: 1, ease: EASE }}
      >
        {BIOMARKER_FILTERS.map(({ target, label, valueKey }) => (
          <BiomarkerFilterButton
            key={target}
            target={target}
            label={label}
            value={valueMap[valueKey]}
            selected={selectedRange === target}
            onToggle={handleToggle}
            disabled={!enableToggle}
          />
        ))}
      </m.div>
      <div className="flex h-1.5 w-full justify-start gap-1">
        {optimalPercent > 0 && (
          <m.div
            className="h-full rounded-full"
            style={{
              backgroundColor: STATUS_TO_COLOR.optimal,
              opacity:
                selectedRange === 'optimal' || selectedRange === 'all'
                  ? 1
                  : 0.5,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${optimalPercent}%` }}
            transition={{ duration: 1.5, ease: EASE }}
          />
        )}
        {normalPercent > 0 && (
          <m.div
            className="h-full rounded-full"
            style={{
              backgroundColor: STATUS_TO_COLOR.normal,
              opacity:
                selectedRange === 'normal' || selectedRange === 'all' ? 1 : 0.5,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${normalPercent}%` }}
            transition={{ duration: 1.5, ease: EASE }}
          />
        )}
        {outOfRangePercent > 0 && (
          <m.div
            className="h-full rounded-full"
            style={{
              backgroundColor: STATUS_TO_COLOR['out of range'],
              opacity:
                selectedRange === 'out of range' || selectedRange === 'all'
                  ? 1
                  : 0.5,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${outOfRangePercent}%` }}
            transition={{ duration: 1.5, ease: EASE }}
          />
        )}
        <m.div
          className="h-full rounded-full bg-zinc-200"
          initial={{ width: 0 }}
          animate={{
            width: `${100 - optimalPercent - normalPercent - outOfRangePercent}%`,
          }}
          transition={{ duration: 1.5, ease: EASE }}
        />
      </div>
    </div>
  );
};
