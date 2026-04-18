import { useMemo } from 'react';

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, Body2 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { cn } from '@/lib/utils';

import { useDataBiomarkers } from '../api';
import type { DataBiomarker } from '../types/data-api';
import { getLatestObservationValue } from '../utils/get-latest-observation-value';

import { BiomarkersDataTable } from './table/biomarkers-data-table';

const getRelatedDataBiomarkers = (
  organAge: DataBiomarker,
  allBiomarkers: DataBiomarker[],
): DataBiomarker[] => {
  const latest = getLatestObservationValue(organAge.observation);
  const titles = new Set(
    (
      (latest?.component ?? [])
        .map((c: { title?: string | null }) => c.title)
        .filter(Boolean) as string[]
    ).map((t) => t.toLowerCase()),
  );

  return allBiomarkers.filter(
    (bm) =>
      bm.id !== organAge.id &&
      (titles.has(bm.name.toLowerCase()) || titles.has(bm.title.toLowerCase())),
  );
};

export const BiomarkersAccordion = ({
  biomarker,
  className,
}: {
  biomarker: DataBiomarker;
  className?: string;
}) => {
  const { data } = useDataBiomarkers();

  const rows = useMemo(
    () => getRelatedDataBiomarkers(biomarker, data?.biomarkers ?? []),
    [biomarker, data?.biomarkers],
  );

  const observation = biomarker.observation;
  const latest = getLatestObservationValue(observation);
  const latestValue = latest?.quantity?.value;
  const latestUnit = latest?.quantity?.unit;
  const status = observation?.status ?? 'pending';

  const statusColor =
    STATUS_TO_COLOR[status.toLowerCase() as keyof typeof STATUS_TO_COLOR] ||
    STATUS_TO_COLOR.pending;

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('rounded-2xl bg-white shadow-sm', className)}
    >
      <AccordionItem
        value={biomarker.id}
        className="rounded-2xl border border-zinc-200"
      >
        <AccordionTrigger
          className={cn(
            'rounded-2xl border-b-zinc-200 p-4',
            "data-[state='open']:rounded-b-none data-[state='open']:border-b",
            'hover:bg-zinc-50',
          )}
        >
          <div className="flex py-2.5">
            <div className="w-[140px] px-4 md:w-[160px]">
              <Body1 className="text-sm md:text-base">{biomarker.title}</Body1>
              <Body2 className="text-secondary">
                {rows.length} marker{rows.length > 1 ? 's' : ''}
              </Body2>
            </div>
            <div className="flex w-1/4 items-center gap-2 lg:w-[125px]">
              <div
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: statusColor,
                }}
              />
              <Body2
                style={{
                  color: statusColor,
                }}
                className="line-clamp-1 capitalize"
              >
                {status.toLowerCase()}
              </Body2>
            </div>
            <div className="hidden items-center gap-2 px-4 xs:flex lg:w-[120px]">
              <Body2 className="line-clamp-1 max-w-[200px]">
                {latestValue}{' '}
                <span className="text-secondary">{latestUnit}</span>
              </Body2>
            </div>
            <div className="hidden items-center gap-2 px-4 lg:flex">
              {/* Delta not available yet */}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent
          className={cn(
            'border-b-0 px-4 py-0',
            '[&_tr]:relative [&_tr]:rounded-none [&_tr]:!border-b [&_tr]:border-none',
            '[&_tr]:border-b-zinc-200 [&_tr]:shadow-none [&_tr]:outline-none',
            '[&_tr]:after:absolute [&_tr]:after:bottom-0 [&_tr]:after:left-0',
            '[&_tr]:after:h-px [&_tr]:after:w-full [&_tr]:after:bg-zinc-200',
            "[&_tr]:after:content-[''] [&_tr]:hover:outline-none",
            '[&_tr:last-child]:after:hidden [&_tr_td]:!w-1/4',
            '[&>div]:[contain-intrinsic-size:none!important] [&>div]:[content-visibility:visible!important]',
          )}
        >
          {rows.length > 0 && (
            <BiomarkersDataTable
              biomarkers={rows}
              hiddenColumns={['optimalRange']}
              hideHeader
              hideDialog
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
