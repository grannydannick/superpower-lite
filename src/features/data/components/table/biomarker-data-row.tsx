import { Row, flexRender } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import type { CSSProperties } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { BiomarkerDialog } from '../dialogs/biomarker-dialog';

type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'widescreen';

const cellClass = cva('', {
  variants: {
    screenSize: {
      mobile: 'px-1 py-1.5',
      tablet: 'py-2.5',
      desktop: 'py-2.5',
      widescreen: 'py-2.5',
    },
    isFirst: {
      true: 'rounded-l-xl',
      false: '',
    },
    isLast: {
      true: 'rounded-r-xl',
      false: '',
    },
  },
});

function getCellStyle(
  screenSize: ScreenSize,
  columnId: string,
  columnSize: number,
): CSSProperties {
  const isDesktop = screenSize === 'desktop' || screenSize === 'widescreen';
  return {
    width: isDesktop ? columnSize : 'auto',
    minWidth: isDesktop ? 'auto' : columnId === 'history' ? '80px' : '60px',
  };
}

function BiomarkerRowCell({
  screenSize,
  index,
  lastIndex,
  cell,
}: {
  screenSize: ScreenSize;
  index: number;
  lastIndex: number;
  cell: ReturnType<Row<Biomarker>['getVisibleCells']>[number];
}) {
  const style = getCellStyle(screenSize, cell.column.id, cell.column.getSize());
  const className = cellClass({
    screenSize,
    isFirst: index === 0,
    isLast: index === lastIndex,
  });

  return (
    <TableCell style={style} className={className}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

export const BiomarkerDataRow = ({
  row,
  screenSize,
  selectedOrderId,
  selectedOrderDate,
  hideDialog = false,
}: {
  row: Row<Biomarker>;
  screenSize: ScreenSize;
  selectedOrderId?: string;
  selectedOrderDate?: Date | undefined | null;
  hideDialog?: boolean;
}) => {
  if (row.original.status === 'PENDING' || row.original.status === 'UNKNOWN') {
    return null;
  }

  const cells = row.getVisibleCells();
  const lastIndex = cells.length - 1;

  const tableRowContent = (
    <TableRow
      className={cn(
        'h-24 rounded-xl border-transparent bg-white shadow-sm outline outline-1 -outline-offset-1 outline-zinc-100 transition-all hover:bg-white hover:outline-zinc-200',
        !hideDialog && 'cursor-pointer',
      )}
    >
      {cells.map((cell, index) => (
        <BiomarkerRowCell
          key={cell.id}
          screenSize={screenSize}
          index={index}
          lastIndex={lastIndex}
          cell={cell}
        />
      ))}
    </TableRow>
  );

  if (hideDialog) {
    return tableRowContent;
  }

  return (
    <BiomarkerDialog
      biomarker={row.original}
      selectedOrderId={selectedOrderId}
      selectedOrderDate={selectedOrderDate}
    >
      <TableRow className="h-24 cursor-pointer rounded-xl border-transparent bg-white shadow-sm outline outline-1 -outline-offset-1 outline-zinc-100 transition-all hover:bg-white hover:outline-zinc-200">
        {cells.map((cell, index) => (
          <BiomarkerRowCell
            key={cell.id}
            screenSize={screenSize}
            index={index}
            lastIndex={lastIndex}
            cell={cell}
          />
        ))}
      </TableRow>
    </BiomarkerDialog>
  );
};
