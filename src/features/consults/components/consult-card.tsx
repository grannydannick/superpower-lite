import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { useConsult } from '../api/get-consult';

export const ConsultCard = ({ consultId }: { consultId: string }) => {
  const consultQuery = useConsult({
    consultId,
  });

  if (consultQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultQuery.data) return null;

  return (
    <div className="group relative">
      <div className="flex flex-col space-y-12 rounded-[20px] bg-[#F7F7F7] p-6">
        <img
          src={`/src/assets/practitioners/${consultQuery.data.practitioner.replaceAll('.', '').replaceAll(' ', '_').trim()}.png`}
          alt={consultQuery.data.practitioner}
          className="size-16 rounded-[16px]"
        />
        <div>
          <p className="line-clamp-1 text-xl leading-7">
            {consultQuery.data.name}
          </p>
          <p className="line-clamp-2 text-[#A1A1A1]">Next: Tomorrow, 10:00am</p>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button className="rounded-full p-2.5">
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
