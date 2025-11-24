import { ContentLayout } from '@/components/layouts';
import { Link } from '@/components/ui/link';
import { H3 } from '@/components/ui/typography';
import { FilesHub } from '@/features/files/components/files-hub';

export const FilesRoute = () => {
  return (
    <ContentLayout title="Records" className="max-md:pt-4">
      <FilesHub
        headerSlot={
          <div className="mt-1 flex gap-4 md:mb-2 md:mt-0">
            <Link to="/data">
              <H3 className="border-b-2 border-b-transparent text-black/20 transition-all hover:text-black/40">
                Twin
              </H3>
            </Link>
            <Link to="/data/records">
              <H3>Records</H3>
            </Link>
          </div>
        }
      />
    </ContentLayout>
  );
};
