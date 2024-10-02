import { X } from 'lucide-react';
import React from 'react';

import { DialogClose } from '@/components/ui/dialog';
import { BiomarkerStatusBadge } from '@/features/biomarkers/components/status-badge';
import { STATUS_TO_BG } from '@/features/biomarkers/const/status-to-bg';
import { cn } from '@/lib/utils';
import { BiomarkerResult, BiomarkerStatus } from '@/types/api';

export interface BiomarkerCardHeaderProps extends BiomarkerValueProps {
  name: string;
  status: BiomarkerStatus;
  unit?: string;
  className?: string;
}

export function BiomarkerCardHeader({
  name,
  status,
  unit,
  result,
  className,
}: BiomarkerCardHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        `p-6 flex flex-row md:flex-col justify-center md:justify-start items-center md:items-start bg-white text-black min-w-0`,
        className,
      )}
    >
      <div className="flex w-full min-w-0 flex-col justify-between md:flex-row md:items-center">
        <div className="flex min-w-0 flex-row items-center justify-between space-x-4">
          <span className="min-w-0 truncate text-center text-2xl">{name}</span>
        </div>
        <div className="flex flex-row items-center space-x-4">
          <div
            className="mt-1 flex flex-row space-x-3 rounded-full px-3 py-2 md:mt-0"
            style={{
              background: STATUS_TO_BG[status.toUpperCase()],
            }}
          >
            <BiomarkerStatusBadge status={status} />
            {result !== null ? (
              <BiomarkerValue result={result} unit={unit} />
            ) : null}
          </div>
          <DialogClose>
            <X className="hidden size-4 cursor-pointer md:block" />
          </DialogClose>
        </div>
      </div>
    </div>
  );
}

interface BiomarkerValueProps {
  result?: BiomarkerResult;
  unit?: string;
}

function BiomarkerValue({ result, unit }: BiomarkerValueProps): JSX.Element {
  const value =
    result?.quantity.value === undefined ? 'n/a' : result?.quantity.value;
  const biomarkerUnit = result?.quantity.unit || unit || '';

  return (
    <span className="flex flex-row space-x-1 text-black opacity-40">
      <span>{value}</span>
      <span>{biomarkerUnit}</span>
    </span>
  );
}
