import React, { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { toast } from '@/components/ui/sonner';
import { acceptedFileContentTypes } from '@/const';
import { FilesTable } from '@/features/files/components/views/files-table';
import { File } from '@/types/api';

import { useCreateFile } from '../api/create-file';
import { useFiles } from '../api/get-files';
import { MEDIA_TYPES, VIRTUAL_MEDIA_TYPE } from '../const/content-type';
import { getFileTypeName } from '../utils/get-file-type';

import { FileUploadButton } from './patterns/file-upload';
import { FilesEmpty } from './patterns/files-empty';
import { FilesFilter } from './patterns/files-filter';
import { FilesSearch } from './patterns/files-search';
import { ViewSwitch } from './view-switch';
import { FilesGrid } from './views/files-grid';

// Custom type to allow 'media' as a virtual content type for filtering
type FilterType = File['contentType'] | 'media';

/**
 * FilesHub is called on both settings and vault pages
 *
 * It displays filters, sorting options, and grid + table views to find files
 */
export const FilesHub = ({ headerSlot }: { headerSlot?: React.ReactNode }) => {
  const { mutate } = useCreateFile({
    mutationConfig: {
      onSuccess: () => {
        toast.success('File uploaded successfully.');
      },
    },
  });

  const { data: filesData, isLoading: filesIsLoading } = useFiles();

  const isLoading = filesIsLoading;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    { name: string; type: FilterType } | false
  >(false);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const { files } = filesData ?? { files: [] };

  const { fileTypes, filteredFiles } = useMemo(() => {
    const allFiles: File[] = [...files];

    // map to group file types
    const typesMap = new Map<string, { name: string; type: FilterType }>();

    // Group types together
    allFiles.forEach((file) => {
      const isMediaType = MEDIA_TYPES.includes(file.contentType);
      const key = isMediaType ? VIRTUAL_MEDIA_TYPE : file.contentType;
      const typeName = getFileTypeName(file);
      typesMap.set(key, { name: typeName, type: key });
    });

    const fileTypes = Array.from(typesMap.values());

    // filter files based on search and filter inputs
    const filteredFiles = allFiles.filter((file) => {
      const matchesSearch = search
        ? file.name.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesFilter = filter
        ? filter.type === VIRTUAL_MEDIA_TYPE
          ? MEDIA_TYPES.includes(file.contentType)
          : file.contentType === filter.type
        : true;

      return matchesSearch && matchesFilter;
    });

    return { fileTypes, filteredFiles };
  }, [files, search, filter]);

  const { getRootProps, isDragActive } = useDropzone({
    accept: acceptedFileContentTypes,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        mutate({
          data: { file },
        });
      });
    },
    onDropRejected: (rejectedFiles) => {
      const uploadedTypes = new Set(rejectedFiles.map(({ file }) => file.type));
      toast.error(
        `File type not supported: ${Array.from(uploadedTypes).slice(0, 3).join(', ')}`,
      );
    },
    noClick: true,
    noDragEventsBubbling: true,
  });

  return (
    <div className="mx-auto">
      <div className="mb-4 flex w-full items-center justify-between gap-8">
        {headerSlot ?? <div />}
        <div className="relative">
          <FileUploadButton />
        </div>
      </div>
      <div className="mx-auto mb-4 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
        <FilesSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center justify-between gap-6 md:justify-end">
          <FilesFilter
            filter={filter}
            setFilter={setFilter}
            types={fileTypes}
          />
          <ViewSwitch view={view} setView={setView} />
        </div>
      </div>
      <section id="files" className="relative" {...getRootProps()}>
        {isDragActive && (
          <svg
            className="absolute inset-0 z-50 size-full text-vermillion-900 animate-in fade-in"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              x="1"
              y="1"
              rx="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="12;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        )}
        {files.length === 0 && !isLoading ? (
          <FilesEmpty />
        ) : (
          <>
            {view === 'list' ? (
              <FilesTable files={filteredFiles} isLoading={isLoading} />
            ) : (
              <FilesGrid files={filteredFiles} isLoading={isLoading} />
            )}
          </>
        )}
      </section>
    </div>
  );
};
