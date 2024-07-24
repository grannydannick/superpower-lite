import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useConsult } from '../api/get-consult';

export const ConsultCard = ({ consultId }: { consultId: string }) => {
  const consultQuery = useConsult({
    consultId,
  });

  if (consultQuery.isLoading) {
    return <SkeletonConsultCard />;
  }

  if (!consultQuery.data) return null;

  return (
    <div className="group relative">
      <div className="flex flex-row items-center gap-x-3 gap-y-12 rounded-[20px] bg-[#F7F7F7] px-5 py-4 sm:flex-col sm:items-start sm:p-6">
        <img
          src={`/src/assets/practitioners/${consultQuery.data.practitioner.replaceAll('.', '').replaceAll(' ', '_').trim()}.png`}
          alt={consultQuery.data.practitioner}
          className="size-9 rounded-[8px] sm:size-16 sm:rounded-[16px]"
        />
        <div>
          <p className="line-clamp-1 leading-5 sm:text-xl sm:leading-7">
            {consultQuery.data.name}
          </p>
          <p className="line-clamp-1 text-sm text-[#A1A1A1] sm:line-clamp-2 sm:text-base">
            Next: Tomorrow, 10:00am
          </p>
        </div>
      </div>
      <div className="bottom-3 right-3 hidden opacity-0 transition-opacity group-hover:opacity-100 sm:absolute sm:block">
        <Button className="rounded-full p-2.5">
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

const SkeletonConsultCard = () => {
  return (
    <div className="group relative">
      <div className="flex flex-row items-center gap-x-3 gap-y-12 rounded-[20px] bg-zinc-50/40 px-5 py-4 sm:flex-col sm:items-start sm:p-6">
        <Skeleton className="size-9 rounded-[8px] sm:size-16 sm:rounded-[16px]" />
        <div className="w-full space-y-3">
          <Skeleton className="h-4 w-1/2 sm:h-5" />
          <Skeleton className="h-4 w-3/4 sm:h-4" />
        </div>
      </div>
      <div className="bottom-3 right-3 hidden opacity-0 transition-opacity group-hover:opacity-100 sm:absolute sm:block">
        <Button className="rounded-full p-2.5">
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
