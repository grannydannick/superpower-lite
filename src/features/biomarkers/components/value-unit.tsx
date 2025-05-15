import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { BiomarkerResult } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

interface ValueUnitProps {
  result?: BiomarkerResult;
  baseUnit: string;
  textClassName?: string;
}

/**
 *
 * @param result - biomarker result value, should be typically received via mostRecent() function
 * @param baseUnit - biomarker's unit
 * @param className - in case you need to apply styles to text inside
 */
export const BiomarkerValueUnit = ({
  result,
  baseUnit,
  textClassName,
}: ValueUnitProps): JSX.Element => {
  const value =
    result?.quantity.value !== undefined ? result?.quantity.value : '-';
  const unit = result?.quantity.unit || baseUnit || '';

  return (
    <div className="flex gap-1">
      {result?.quantity.comparator && (
        <Body2 className={cn('', textClassName)}>
          {getDisplayComparator(result?.quantity.comparator)}
        </Body2>
      )}
      <Body2 className={cn('md:text-base', textClassName)}>{value}</Body2>
      <Body2 className={cn('text-zinc-500 md:text-base', textClassName)}>
        {unit}
      </Body2>
    </div>
  );
};
