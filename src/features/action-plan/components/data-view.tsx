import { useEffect } from 'react';

import { BiomarkerCategoryFilter } from '@/features/action-plan/components/biomarkers/biomarker-category-filter';
import { BiomarkerStatusFilter } from '@/features/action-plan/components/biomarkers/biomarker-status-filter';
import { useBiomarkerFilterStore } from '@/features/action-plan/stores/biomarker-fiter-store';
import { BiomarkerTableDialogRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-dialog-row';
import { BiomarkerSparklineChart } from '@/features/biomarkers/components/charts/biomarker-sparkline-chart';
import { STATUS_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { Biomarker } from '@/types/api';

// TODO: find a way to reuse biomarkers table here instead of this
export const ActionPlanBiomarkerRow = ({
  biomarker,
}: {
  biomarker: Biomarker;
}) => {
  if (biomarker.value.length === 0) {
    return null;
  }

  const latestMetric =
    biomarker.value.length > 0
      ? biomarker.value.reduce((latest, current) => {
          return new Date(current.timestamp) > new Date(latest.timestamp)
            ? current
            : latest;
        }, biomarker.value[0]).quantity?.value
      : null;

  const statusOption = STATUS_OPTIONS.find(
    (option) =>
      option.value === biomarker.status.toLowerCase() ||
      option.value.includes(biomarker.status.toLowerCase()),
  );

  const statusColorClasses: Record<string, string> = {
    'green-400': 'bg-green-400',
    'yellow-300': 'bg-[#EAD64C]',
    'fuchsia-400': 'bg-fuchsia-400',
    'zinc-300': 'bg-zinc-300',
  };

  const statusColorClass = statusOption
    ? statusColorClasses[statusOption.color]
    : 'bg-gray-300';

  const rangeByBiomarkerStatus = biomarker.range.find(
    (range) => range.status === 'OPTIMAL',
  );

  let rangeDisplay = 'No range';
  if (rangeByBiomarkerStatus) {
    const { low, high } = rangeByBiomarkerStatus;

    if (
      low &&
      high &&
      low.comparator === 'EQUALS' &&
      high.comparator === 'EQUALS'
    ) {
      rangeDisplay = `${low.value} - ${high.value}`;
    } else if (low) {
      switch (low.comparator) {
        case 'GREATER_THAN':
          rangeDisplay = `> ${low.value}`;
          break;
        case 'GREATER_THAN_EQUALS':
          rangeDisplay = `≥ ${low.value}`;
          break;
        default:
          rangeDisplay = `${low.value}`;
          break;
      }
    }

    if (high && low?.comparator !== 'EQUALS') {
      switch (high.comparator) {
        case 'LESS_THAN':
          rangeDisplay = `< ${high.value}`;
          break;
        case 'LESS_THAN_EQUALS':
          rangeDisplay = `≤ ${high.value}`;
          break;
        default:
          if (low) {
            rangeDisplay = `${low.value} - ${high.value}`;
          } else {
            rangeDisplay = `${high.value}`;
          }
          break;
      }
    }
  }

  return (
    <BiomarkerTableDialogRow biomarker={biomarker}>
      <div className="flex h-[60px] max-w-[634px] grow items-center justify-between rounded-xl bg-[#F7F7F7] py-2.5 pl-5 pr-3 hover:cursor-pointer">
        <div className="flex w-1/2 flex-col items-start">
          <div className="flex max-w-[200px] flex-col justify-start gap-1">
            <div className="flex items-center gap-2.5">
              <div className={`size-2 rounded-full ${statusColorClass}`} />
              <p className="truncate text-sm text-zinc-900">{biomarker.name}</p>
            </div>
            <div className="ml-[18px] flex gap-1 text-left text-sm">
              <p className="text-zinc-900">{latestMetric}</p>
              <p className="text-zinc-400">{biomarker.unit}</p>
            </div>
          </div>
        </div>

        <div className="flex w-1/2 items-center justify-between">
          <div className="inline-block rounded-[19px] bg-white px-2 py-1 text-center text-sm text-zinc-400">
            {rangeDisplay}
          </div>
          <BiomarkerSparklineChart
            biomarker={biomarker}
            className="size-full h-[44px] w-[120px]"
            height={44}
            markerRadius={8}
            markerLineWidth={1}
          />
        </div>
      </div>
    </BiomarkerTableDialogRow>
  );
};

export const ActionPlanDataView = ({
  patientName,
  biomarkers,
}: {
  patientName: string;
  biomarkers: Biomarker[];
}) => {
  const filteredBiomarkers = useBiomarkerFilterStore(
    (state) => state.filteredBiomarkers,
  );
  const setBiomarkers = useBiomarkerFilterStore((state) => state.setBiomarkers);
  const selectedCategories = useBiomarkerFilterStore(
    (state) => state.selectedCategories,
  );

  useEffect(() => {
    setBiomarkers(biomarkers);
  }, [biomarkers, setBiomarkers]);

  const groupedBiomarkers = filteredBiomarkers.reduce(
    (acc, biomarker) => {
      const category = biomarker.category?.toLowerCase() || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          originalCategory: biomarker.category || 'Uncategorized',
          biomarkers: [],
        };
      }
      acc[category].biomarkers.push(biomarker);
      return acc;
    },
    {} as Record<string, { originalCategory: string; biomarkers: Biomarker[] }>,
  );

  return (
    <section className="hidden h-[664px] w-[728px] flex-col rounded-3xl bg-white p-12 shadow-md lg:flex">
      <div className="mb-6 flex items-center justify-between">
        <div>{patientName}&apos;s Data</div>
        <div className="flex items-center gap-3">
          <BiomarkerStatusFilter />
          <BiomarkerCategoryFilter />
        </div>
      </div>

      <div className="grow overflow-y-auto">
        <div className="flex flex-col">
          {(selectedCategories.length > 0
            ? selectedCategories
            : Object.keys(groupedBiomarkers)
          ).map((categoryKey) => {
            const category = groupedBiomarkers[categoryKey];
            if (!category?.biomarkers.length) return null; // Skip empty categories
            return (
              <div key={categoryKey} className="mt-6 flex flex-col gap-0">
                <h3 className="mb-4 text-base text-zinc-400">
                  {category?.originalCategory}
                </h3>
                <div className="flex flex-col gap-3">
                  {category?.biomarkers.map((biomarker) => (
                    <ActionPlanBiomarkerRow
                      key={biomarker.id}
                      biomarker={biomarker}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
