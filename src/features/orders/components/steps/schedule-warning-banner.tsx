import { AlertTriangle } from 'lucide-react';

import { Body2, H4 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';

export const ScheduleWarningBanner = () => {
  const service = useOrder((s) => s.service);

  return (
    <>
      <div className="sticky top-0 mx-auto flex max-w-[calc(100%-2rem)] items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-md shadow-black/5 md:max-w-[calc(100%-7rem)]">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FC5F2B20]">
          <AlertTriangle className="size-5 text-vermillion-900" />
        </div>
        <div>
          <H4 className="text-left text-base">Schedule warning</H4>
          <Body2 className="text-left text-secondary">
            You have a recent or upcoming {service.name}. We recommend spacing
            blood tests 3+ months apart for optimal health insights.
          </Body2>
        </div>
      </div>
    </>
  );
};
