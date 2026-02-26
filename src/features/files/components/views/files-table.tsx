import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { columns } from '@/features/files/components/desktop/columns';
import { DataTable } from '@/features/files/components/desktop/data-table';
import { MobileFiles } from '@/features/files/components/mobile-files';
import { File } from '@/types/api';

import { FilesNotFound } from '../patterns/files-not-found';

/**
 * FilesTable is a table view of user health records
 *
 * It displays a table of files powered by tanstack table
 */
export function FilesTable({
  files,
  isLoading,
}: {
  files: File[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-2xl" variant="shimmer" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="flex items-center gap-4" key={index}>
            <Skeleton
              className="h-16 w-1/2 shrink-0 rounded-2xl"
              variant="shimmer"
            />
            <Skeleton className="h-16 w-1/4 rounded-2xl" variant="shimmer" />
            <Skeleton className="h-16 w-1/4 rounded-2xl" variant="shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return <FilesNotFound />;
  }

  return (
    <>
      {/*Mobile*/}
      <MobileFiles files={files} />

      {/*Desktop*/}
      <DataTable columns={columns} data={files} />
    </>
  );
}
