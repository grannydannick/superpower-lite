import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';

import { Body2, H3 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { biomarkerStatusCount } from '@/features/data/utils/biomarkers-status-count';
import { useOrders } from '@/features/orders/api';
import { cn } from '@/lib/utils';

import { STATUS_TO_COLOR } from '../../../const/status-to-color';
import { useFilteredBiomarkers } from '../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../stores/data-filter-store';

const ease = [0.16, 1, 0.3, 1];

export const BiomarkerDistributionBar = () => {
  const { selectedRange } = useDataFilterStore();
  const { data: biomarkers } = useBiomarkers();
  const { data: orders } = useOrders();

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers: biomarkers?.biomarkers,
    orders: orders?.orders,
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

  return (
    <div className="mb-3 space-y-2">
      <motion.div
        className="flex w-full items-center justify-between"
        initial={{ opacity: 0, width: '75%' }}
        animate={{ opacity: 1, width: '100%' }}
        transition={{ duration: 1, ease }}
      >
        <div className="flex flex-col">
          <H3
            className={cn(
              'transition-colors duration-300',
              selectedRange === 'all' ? 'text-black' : 'text-zinc-400',
            )}
          >
            <NumberFlow value={numTotalBiomarkers} />
          </H3>
          <Body2 className="text-zinc-400">Total</Body2>
        </div>
        <div className="flex flex-col">
          <H3
            className={cn(
              'transition-colors duration-300',
              selectedRange === 'optimal' ? 'text-black' : 'text-zinc-400',
            )}
          >
            <NumberFlow value={numInRange} />
          </H3>
          <Body2 className="text-zinc-400">Optimal</Body2>
        </div>
        <div className="flex flex-col">
          <H3
            className={cn(
              'transition-colors duration-300',
              selectedRange === 'normal' ? 'text-black' : 'text-zinc-400',
            )}
          >
            <NumberFlow value={numNormal} />
          </H3>
          <Body2 className="text-zinc-400">Normal</Body2>
        </div>
        <div className="flex flex-col">
          <H3
            className={cn(
              'transition-colors duration-300',
              selectedRange === 'out of range' ? 'text-black' : 'text-zinc-400',
            )}
          >
            <NumberFlow value={numOutOfRange} />
          </H3>
          <Body2 className="text-zinc-400">Out of Range</Body2>
        </div>
      </motion.div>
      <div className="flex h-1.5 w-full justify-start gap-1">
        {optimalPercent > 0 && (
          <motion.div
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
            transition={{ duration: 1.5, ease }}
          />
        )}
        {normalPercent > 0 && (
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: STATUS_TO_COLOR.normal,
              opacity:
                selectedRange === 'normal' || selectedRange === 'all' ? 1 : 0.5,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${normalPercent}%` }}
            transition={{ duration: 1.5, ease }}
          />
        )}
        {outOfRangePercent > 0 && (
          <motion.div
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
            transition={{ duration: 1.5, ease }}
          />
        )}
        <motion.div
          className="h-full rounded-full bg-zinc-200"
          initial={{ width: 0 }}
          animate={{
            width: `${100 - optimalPercent - normalPercent - outOfRangePercent}%`,
          }}
          transition={{ duration: 1.5, ease }}
        />
      </div>
    </div>
  );
};
