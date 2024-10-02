import { getOptimalRange } from '@/features/biomarkers/utils/get-optimal-range';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

export const BiomarkerRange = ({
  biomarker,
  className,
}: {
  biomarker: Biomarker;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        `text-nowrap rounded-full px-5 py-3 text-center text-zinc-500`,
        biomarker.status === 'OPTIMAL' ? 'bg-green-50' : 'bg-slate-50',
        className,
      )}
    >
      {getOptimalRange(biomarker)}
    </span>
  );
};
