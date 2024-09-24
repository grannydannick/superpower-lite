import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import {
  AnnualReportBlockGroupItemStatusType,
  BlockGroupItem,
} from '@/types/api';

const statusStyles: Record<
  AnnualReportBlockGroupItemStatusType | 'UNKNOWN',
  { text: string; background: string }
> = {
  OPTIMAL: {
    text: `text-[#00FCA1]`,
    background: `bg-[#00FCA1]`,
  },
  NORMAL: {
    text: `text-[#D7DB0E]`,
    background: `bg-[#D7DB0E]`,
  },
  OUT_OF_RANGE: {
    text: `text-[#FF68DE]`,
    background: `bg-[#FF68DE]`,
  },
  UNKNOWN: {
    text: `text-gray-500`,
    background: `bg-gray-500`,
  },
};

/*
 * NM & UZ Sept 22, 2024
 *
 * Marking this as TECH debt until we implement new approach for data page & tables that can be reusable
 *
 * Should reuse biomarkers/components/biomarker-data-table/biomarker-data-table.tsx
 * */
const FlexTable = ({
  biomarkers,
  title,
  className,
}: {
  biomarkers: BlockGroupItem[];
  title: string;
  className?: string;
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedBiomarkers = showAll ? biomarkers : biomarkers.slice(0, 5);
  return (
    <div className={cn('flex flex-col', 'max-w-[275px] w-full', className)}>
      <h2 className="mb-4 text-left text-xs text-zinc-500">{title}</h2>
      <div className="flex flex-col space-y-2">
        {displayedBiomarkers.map((biomarker, idx) => {
          const biomarkerStatus = biomarker.status || 'UNKNOWN';
          return (
            <div key={idx} className="flex items-center gap-[10px]">
              <div className="flex w-[55%] items-center truncate text-left">
                <span
                  className={cn(
                    'inline-block rounded-full',
                    statusStyles[biomarkerStatus].background,
                    'h-2 min-w-2 mr-[10px]',
                  )}
                />
                <span className="w-[95%] truncate">{biomarker.name}</span>
              </div>

              <div className="flex w-[45%] justify-between gap-4 text-sm text-zinc-900">
                <span className="flex-1 whitespace-nowrap text-right">
                  {biomarker.value}
                </span>
                {biomarker.range ? (
                  <span className="w-[48px] whitespace-nowrap text-left text-zinc-400">
                    {biomarker.range}
                  </span>
                ) : (
                  <span className="w-[48px] pl-4 text-right" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {biomarkers.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center justify-start text-xs text-zinc-500"
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronDown
            className={`ml-1 size-3 text-zinc-500 ${
              showAll ? 'rotate-180' : ''
            } transition-transform duration-200`}
          />
        </button>
      )}
    </div>
  );
};

export const AnnualReportBiomarkersTable = ({
  blockGroupItems,
}: {
  blockGroupItems: BlockGroupItem[];
}) => (
  <FlexTable
    biomarkers={blockGroupItems.filter((item) => item.type === 'BIOMARKER')}
    title="Relevant biomarkers"
    className="hidden md:flex"
  />
);
