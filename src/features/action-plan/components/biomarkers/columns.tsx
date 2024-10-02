import 'moment-timezone';
import { ColumnDef } from '@tanstack/react-table';
import { Circle } from 'lucide-react';

import { Body2 } from '@/components/ui/typography';
import { BiomarkerSparklineChart } from '@/features/biomarkers/components/charts/biomarker-sparkline-chart';
import { BiomarkerRange } from '@/features/biomarkers/components/range';
import { BiomarkerValueUnit } from '@/features/biomarkers/components/value-unit';
import { STATUS_TO_COLOR } from '@/features/biomarkers/const/status-to-color';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { Biomarker } from '@/types/api';

export const columns: ColumnDef<Biomarker>[] = [
  {
    accessorKey: 'name',
    header: () => <Body2 className="text-zinc-400">Name</Body2>,
    cell: ({ row }) => {
      const name: string = row.getValue('name');
      const category: string = row.original.category;
      const status: string = row.original.status;

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Circle
              className="size-2 min-w-2"
              style={{ fill: STATUS_TO_COLOR[status.toLowerCase()] }}
              strokeWidth={0}
            />
            <Body2 className="line-clamp-1">{name}</Body2>
          </div>
          <Body2 className="line-clamp-1 px-[18px] text-zinc-400">
            {category}
          </Body2>
        </div>
      );
    },
  },
  {
    // Filter only
    accessorKey: 'category',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    // Filter only
    accessorKey: 'status',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'value',
    header: () => <Body2 className="text-zinc-400">Value</Body2>,
    cell: ({ row }) => {
      const result = mostRecent(row.original.value);

      return (
        <BiomarkerValueUnit
          result={result}
          baseUnit={row.original.unit}
          textClassName="text-xs md:text-xs"
        />
      );
    },
  },
  {
    accessorKey: 'range',
    header: () => <Body2 className="text-zinc-400">Optimal range</Body2>,
    cell: ({ row }) => {
      return (
        <BiomarkerRange
          biomarker={row.original}
          className="h-8 rounded-[20px] bg-white px-3 py-2 text-xs"
        />
      );
    },
  },
  {
    header: () => <Body2 className="text-zinc-400 xl:pl-[25px]">History</Body2>,
    id: 'sparkline',
    cell: ({ row }) => {
      return (
        <div>
          <BiomarkerSparklineChart
            biomarker={row.original}
            className="ml-auto size-full h-[44px] w-[120px] sm:ml-0"
            height={44}
            markerRadius={8}
            markerLineWidth={1}
          />
        </div>
      );
    },
  },
];
