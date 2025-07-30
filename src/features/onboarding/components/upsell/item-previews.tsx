import { useMemo } from 'react';

import { Body1, Body2 } from '@/components/ui/typography';
import { useUpsellOrders } from '@/features/onboarding/hooks/use-upsell-orders';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';

import { getImageForUpsellService } from '../../utils/get-image-for-upsell-service';

import { ItemPreview } from './item-preview';

export const ItemPreviews = ({
  selectedServices,
}: {
  selectedServices?: HealthcareService[];
}) => {
  const { data: allServices } = useServices();
  const { data: upsellOrders } = useUpsellOrders();

  const selectedOrders = useMemo(() => {
    const items = [] as HealthcareService[];

    upsellOrders.map((order) => {
      if (allServices) {
        const service = allServices.services.find(
          (s) => s.id === order.serviceId,
        );

        if (!service) return;

        items.push({ ...service, image: getImageForUpsellService(service) });
      }
    });

    return items;
  }, [upsellOrders, allServices]);

  const items =
    selectedServices && selectedServices.length > 0
      ? selectedServices
      : selectedOrders;

  return (
    <div
      className={
        'relative top-8 order-first mx-auto grid size-full h-96 max-h-[calc(100dvh-4.5rem)] max-w-[calc(100dvw-2rem)] grid-cols-2 place-items-center content-center items-center gap-4 overflow-hidden rounded-3xl bg-white p-4 transition-all lg:sticky lg:order-last lg:h-auto'
      }
    >
      {items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'rounded-3xl bg-white relative',
              items.length === 1 && 'col-span-2',
              index % 2 !== 0 && 'md:top-56 top-24',
            )}
          >
            <ItemPreview image={item.image ?? ''} />
          </div>
        ))
      ) : (
        <div className="absolute left-1/2 top-1/2 mx-auto flex size-full max-w-80 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
          <img
            className="size-40 object-contain lg:size-80"
            src="/onboarding/upsell/empty_box.webp"
            alt="No additional tests selected"
          />
          <Body1 className="mb-2.5 text-center">
            No additional tests selected
          </Body1>
          <Body2 className="text-center text-zinc-500">
            Select a test from the{' '}
            <span className="hidden md:inline-block">left</span>{' '}
            <span className="inline-block md:hidden">bottom</span> to gain
            additional insights about your health.
          </Body2>
        </div>
      )}
    </div>
  );
};
