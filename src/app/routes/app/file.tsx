import { format } from 'date-fns';
import { ChevronLeft, Ellipsis } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { useFiles } from '@/features/files/api/get-files';
import { ContentType } from '@/features/files/components/content-type';
import { MenuDropdown } from '@/features/files/components/menu-dropdown';
import { capitalize } from '@/utils/format';

export function MobileFileRoute(): JSX.Element {
  const navigate = useNavigate();
  const { fileId } = useParams();

  const { data } = useFiles();

  const file = data?.files.find((file) => file.id === fileId);

  if (!file) {
    return <>File not found</>;
  }

  return (
    <main className="container flex min-h-dvh flex-1 flex-col bg-zinc-50 px-6 md:p-5">
      <div className="flex items-center justify-between gap-3 pb-4 pt-16">
        <div
          role="presentation"
          className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_32px_64px_0px_rgba(212,212,212,0.25)]"
          onClick={() => navigate('/vault')}
        >
          <ChevronLeft width={16} height={16} color="black" />
        </div>
        <div className="min-w-0 flex-1 text-center text-sm">
          <h3 className="text-[#18181B]">Details</h3>
          <h3 className="line-clamp-1 text-[#71717A]">{file.name}</h3>
        </div>
        <MenuDropdown file={file}>
          <div className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_32px_64px_0px_rgba(212,212,212,0.25)]">
            <Ellipsis width={16} height={16} color="black" />
          </div>
        </MenuDropdown>
      </div>
      <Card className="mt-[28px]">
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-1 text-[#A1A1AA]">File</div>
          <div className="col-span-2 text-[#52525B]">
            <h3 className="line-clamp-1">{file.name}</h3>
          </div>

          <div className="col-span-1 text-[#A1A1AA]">Type</div>
          <div className="col-span-2 text-[#52525B]">
            <ContentType contentType={file.contentType} />
          </div>

          <div className="col-span-1 text-[#A1A1AA]">Status</div>
          <div className="col-span-2 text-[#52525B]">
            {capitalize(file.status.toLowerCase())}
          </div>

          <div className="col-span-1 text-[#A1A1AA]">Uploaded</div>
          <div className="col-span-2 text-[#52525B]">
            {format(file.uploadedAt, 'PP')}
          </div>
        </div>
      </Card>
    </main>
  );
}
