import React from 'react';

import { H2 } from '@/components/ui/typography';
import { FilesHub } from '@/features/files/components/files-hub';

export const Vault = () => {
  return (
    <div className="md:space-y-8">
      <H2 className="hidden md:block">Health Records</H2>
      <FilesHub />
    </div>
  );
};
