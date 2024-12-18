import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { Body1, H1 } from '@/components/ui/typography';
import { FilesHub } from '@/features/files/components/files-hub';

export const FilesRoute = () => {
  const navigate = useNavigate();

  return (
    <ContentLayout title="Files">
      <div
        className="hidden cursor-pointer items-center gap-2 md:flex"
        role="presentation"
        onClick={() => navigate('/data')}
      >
        <ChevronLeft className="text-zinc-400" />
        <Body1 className="text-zinc-500">Back to Data</Body1>
      </div>

      <div
        role="presentation"
        className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_32px_64px_0px_rgba(212,212,212,0.25)] md:hidden"
        onClick={() => navigate('/data')}
      >
        <ChevronLeft width={16} height={16} color="black" />
      </div>

      <div className="space-y-2">
        <H1>Health Records</H1>
        <Body1 className="text-zinc-500">
          Manage and import previous healthcare records into your Superpower
          dashboard
        </Body1>
      </div>
      <FilesHub />
    </ContentLayout>
  );
};
