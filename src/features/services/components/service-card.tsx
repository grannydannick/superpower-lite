import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { useService } from '../api/get-service';

export const ServiceCard = ({ serviceId }: { serviceId: string }) => {
  const serviceQuery = useService({
    serviceId,
  });

  if (serviceQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!serviceQuery.data) return null;

  return (
    <div className="group relative">
      <div className="flex h-full items-center gap-x-3 gap-y-2 rounded-[20px] bg-[#F7F7F7] px-5 py-4 sm:flex-col sm:items-start sm:gap-x-0 sm:rounded-[24px] sm:p-2">
        {/* <div className="aspect-[225/172] rounded-[20px] bg-white"> */}
        <img
          src={`/src/assets/services/${serviceQuery.data.name.replaceAll(' ', '_').toLowerCase().trim()}.png`}
          alt={serviceQuery.data.name}
          className="aspect-[225/172] size-9 rounded-[8px] object-cover sm:size-full sm:rounded-[20px]"
        />
        {/* </div> */}
        <div className="sm:space-y-1 sm:p-4">
          <p className="line-clamp-1 leading-5 sm:text-xl sm:leading-7">
            {serviceQuery.data.name}
          </p>
          <p className="line-clamp-1 text-sm text-[#A1A1A1] sm:line-clamp-3 sm:text-base">
            {serviceQuery.data.description}
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
