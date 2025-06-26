import { H3 } from '@/components/ui/typography';
import { FilesHub } from '@/features/files/components/files-hub';

export const Vault = () => {
  return (
    <div className="md:space-y-8">
      <H3 className="mb-4 hidden md:block">Health Records</H3>
      <FilesHub />
    </div>
  );
};
