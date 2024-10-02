import { ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

import { Spinner } from '@/components/ui/spinner';
import { useBiomarkers } from '@/features/biomarkers/api';
import { Biomarker } from '@/types/api';

import { getCols } from './columns';
import { DataTable } from './data-table';

interface BiomarkerDataTableProps {
  biomarkers?: Biomarker[];
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  disableHeader?: boolean;
  disableToolbar?: boolean;
  cellClassName?: string;
}

export function BiomarkersDataTable(
  props: BiomarkerDataTableProps,
): JSX.Element {
  const { data: biomarkersData, isLoading } = useBiomarkers();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (!biomarkersData) return <></>;

  const columns = getCols();

  return (
    <DataTable
      columns={columns}
      data={props?.biomarkers ? props.biomarkers : biomarkersData.biomarkers}
      loading={isLoading}
      {...props}
    />
  );
}
