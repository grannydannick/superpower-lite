import { ReactNode } from 'react';

import { TableCell } from '@/components/ui/table';

export function BiomarkerTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <TableCell className={`min-w-[136px] overflow-hidden p-6 ${className}`}>
      {children}
    </TableCell>
  );
}
