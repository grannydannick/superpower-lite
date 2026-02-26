import React from 'react';

import { Body1, H4 } from '@/components/ui/typography';

export const FilesNotFound = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-400px)] max-w-sm flex-col items-center justify-center text-center duration-500">
      <H4 className="mb-2">Nothing to be found</H4>
      <Body1 className="mb-4 text-zinc-500">
        There are no records matching your search. Try a different search term
        instead.
      </Body1>
    </div>
  );
};
