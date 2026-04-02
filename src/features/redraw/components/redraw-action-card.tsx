import { ChevronRight } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import { MemberRedraw } from '@/features/redraw/api/get-redraws';
import { getServiceImage } from '@/utils/service';

type RedrawActionCardProps = {
  redraw: Pick<
    MemberRedraw,
    'serviceRequestId' | 'serviceName' | 'serviceNames'
  >;
  onClick?: () => void;
};

export const RedrawActionCard = ({
  redraw,
  onClick = () => undefined,
}: RedrawActionCardProps) => {
  const serviceName =
    redraw.serviceName ?? redraw.serviceNames[0] ?? 'Superpower Blood Panel';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 rounded-[20px] px-4 py-2 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src={getServiceImage(serviceName)}
          alt={serviceName}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">Recollection Available</Body1>
          <Body2 className="text-zinc-600">Recollect your missing tests</Body2>
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </div>
    </button>
  );
};
