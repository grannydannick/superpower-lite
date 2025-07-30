import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { getUpsellServices } from '@/features/onboarding/utils/get-upsell-services';
import { useOrders } from '@/features/orders/api';
import { useServices } from '@/features/services/api/get-services';
import { HealthcareService } from '@/types/api';

import { UpsellCover } from '../upsell-cover';

import { UpsellCheckout } from './upsell-checkout';
import { UpsellItemCover } from './upsell-item-cover';
import { UpsellItemDetails } from './upsell-item-details';

export const UpsellSequence = () => {
  const [upsells, setUpsells] = useState<HealthcareService[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showMainCover, setShowMainCover] = useState(true);

  const { data: serices, isLoading: isServicesLoading } = useServices();

  let upsellServices = getUpsellServices(serices?.services ?? []);

  const { data: orders, isLoading: isOrdersLoading } = useOrders();

  // we remove services that are already booked for
  upsellServices = upsellServices.filter((service) => {
    return !orders?.orders?.some((order) => order.name === service?.item.name);
  });

  // for each service there are two steps, the first one is the cover and the second one is the details
  const maxPosition = upsellServices.length * 2;

  // all even numbers in the positions are covers, so we check if we need to show it - avoiding having state chaos
  const isShowingCover = currentPosition % 2 === 0;

  // we get the current service index by dividing the current position by 2
  const currentServiceIndex = Math.floor(currentPosition / 2);
  // we get the current service by the index
  const currentService = upsellServices[currentServiceIndex];

  // if we have shown all services, we show the checkout
  const showCheckout = currentPosition >= maxPosition;

  // adds the upsell service to the cart
  const selectItem = (item: HealthcareService) => {
    setUpsells((prev) => [...prev, item]);
  };

  const goToNext = () => {
    if (currentPosition < maxPosition) {
      setCurrentPosition(currentPosition + 1);
    }
  };

  if (showMainCover) {
    return <UpsellCover goToNext={() => setShowMainCover(false)} />;
  }

  if (isServicesLoading || isOrdersLoading)
    return (
      <>
        <div className="mx-auto flex size-full max-w-[512px] flex-col justify-center gap-4 px-4 lg:px-0">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="mb-8 h-10 w-full max-w-56 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <div className="px-4 lg:px-0">
          <Skeleton className="size-full rounded-2xl" />
        </div>
      </>
    );

  if (showCheckout) {
    return <UpsellCheckout services={upsells} updateServices={setUpsells} />;
  }

  if (!currentService) return null;

  return isShowingCover ? (
    <UpsellItemCover cover={currentService.cover} goToNext={goToNext} />
  ) : (
    <UpsellItemDetails
      item={currentService.item}
      selectItem={selectItem}
      goToNext={goToNext}
    />
  );
};
