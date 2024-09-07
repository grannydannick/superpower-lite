import { format } from 'date-fns';
import { Reorder } from 'framer-motion';
import { ChevronRight, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { FileName } from '@/features/files/components/file-name';
import { FileUploadBanner } from '@/features/files/components/file-upload-banner';
import { FilesSearch } from '@/features/files/components/files-search';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { File } from '@/types/api';

interface MobileFilesProps {
  files: File[];
}

export function MobileFiles({ files }: MobileFilesProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(false);
  const navigate = useNavigate();
  const { width } = useWindowDimensions();

  const filesCpy = files.slice();

  let newFiles = search
    ? filesCpy.filter((file) =>
        file.name.toLowerCase().includes(search.toLowerCase()),
      )
    : sort
      ? filesCpy.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        )
      : files;

  return (
    <div className="flex flex-col justify-between md:hidden">
      <div className="flex flex-col justify-between">
        <div>
          <FileUploadBanner>
            <Button className="mb-[26px] w-full space-x-2">
              <div>
                <Upload className="size-4" />
              </div>
              <span>Upload Document</span>
            </Button>
          </FileUploadBanner>
          <FilesSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sortFn={() => setSort((prev) => !prev)}
            sorted={sort}
          />
          <Reorder.Group
            axis="y"
            onReorder={(newOrder) => {
              newFiles = newOrder;
            }}
            transition={{ duration: 0.2 }}
            values={newFiles}
            className="space-y-1"
          >
            {newFiles.map((file) => (
              <Reorder.Item
                drag={false}
                value={file.id}
                className="flex cursor-pointer items-center rounded-2xl bg-white px-5 py-6"
                key={file.id}
                onClick={() => navigate(`/app/vault/${file.id}`)}
              >
                <FileName file={file} />
                <div className="ml-auto flex items-center gap-1.5">
                  <h3 className="whitespace-nowrap text-[#71717A]">
                    {format(file.uploadedAt, width > 768 ? 'PP' : 'LLL, dd')}
                  </h3>
                  <div>
                    <ChevronRight className="size-4" color="#A1A1AA" />
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
}
