import 'moment-timezone';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, Circle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body1 } from '@/components/ui/typography';
import { BiomarkerSparklineChart } from '@/features/biomarkers/components/charts/biomarker-sparkline-chart';
import { BiomarkerRange } from '@/features/biomarkers/components/range';
import { BiomarkerStatusBadge } from '@/features/biomarkers/components/status-badge';
import { BiomarkerValueUnit } from '@/features/biomarkers/components/value-unit';
import { STATUS_TO_COLOR } from '@/features/biomarkers/const/status-to-color';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

export const getCols = (): ColumnDef<Biomarker>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="gap-2 p-0 text-zinc-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ChevronDown
            className={cn(
              'transition-transform duration-200',
              column.getIsSorted() === 'asc' ? 'rotate-180' : null,
            )}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name: string = row.getValue('name');
      const category: string = row.original.category;
      const status: string = row.original.status;
      const result = mostRecent(row.original.value);

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Circle
              className="block size-2 min-w-2 md:hidden"
              style={{ fill: STATUS_TO_COLOR[status.toLowerCase()] }}
              strokeWidth={0}
            />
            <Body1 className="line-clamp-1">{name}</Body1>
          </div>
          <Body1 className="hidden text-zinc-400 md:block">{category}</Body1>
          <div className="px-[18px] md:hidden">
            <BiomarkerValueUnit result={result} baseUnit={row.original.unit} />
          </div>
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
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="gap-2 p-0 text-zinc-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ChevronDown
            className={cn(
              'transition-transform duration-200',
              column.getIsSorted() === 'desc' && 'rotate-180',
            )}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <BiomarkerStatusBadge status={row.original.status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'value',
    header: () => <Body1 className="text-zinc-400">Value</Body1>,
    cell: ({ row }) => {
      const result = mostRecent(row.original.value);

      return (
        <BiomarkerValueUnit result={result} baseUnit={row.original.unit} />
      );
    },
  },
  {
    accessorKey: 'range',
    header: () => <Body1 className="text-zinc-400">Optimal range</Body1>,
    cell: ({ row }) => {
      return <BiomarkerRange biomarker={row.original} />;
    },
  },
  {
    header: () => <Body1 className="text-zinc-400 xl:pl-[55px]">History</Body1>,
    id: 'sparkline',
    cell: ({ row }) => {
      return (
        <div>
          <BiomarkerSparklineChart biomarker={row.original} />
        </div>
      );
    },
  },
];
