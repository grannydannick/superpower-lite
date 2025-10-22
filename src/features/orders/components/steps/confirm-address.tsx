import { useEffect } from 'react';

import { H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useOrder } from '@/features/orders/stores/order-store';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const ConfirmAddress = () => {
  const { updateLocation, location } = useOrder((s) => s);
  const { data: user } = useUser();

  useEffect(() => {
    if (!user?.primaryAddress) {
      return;
    }

    updateLocation({
      address: user.primaryAddress,
      capabilities: ['APPOINTMENT_SCHEDULING'],
      name: '',
    });
  }, [user?.primaryAddress]);

  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <H2 className="text-2xl md:text-3xl">Confirm shipping address</H2>
        <CurrentAddressCard disableEdit={true} />
      </div>
      <HealthcareServiceFooter nextBtnDisabled={!location} />
    </>
  );
};
