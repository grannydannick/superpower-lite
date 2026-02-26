import React from 'react';

import { Body1, H4 } from '@/components/ui/typography';

import { FileUploadButton } from './file-upload';

export const FilesEmpty = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-400px)] max-w-sm flex-col items-center justify-center text-center duration-500">
      <H4 className="mb-2">No healthcare records yet</H4>
      <Body1 className="mb-6 text-zinc-500">
        Integrate your healthcare records into superpower. Drop your files here
        or click to upload.
      </Body1>
      <FileUploadButton />
    </div>
  );
};
