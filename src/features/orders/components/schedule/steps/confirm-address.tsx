import { useEffect } from 'react';

import { H2 } from '@/components/ui/typography';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { useScheduleStore } from '../../../stores/schedule-store';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const ConfirmAddressStep = () => {
  const { updateLocation, location } = useScheduleStore((s) => s);
  const { data: user } = useUser();

  useEffect(() => {
    if (!user?.primaryAddress) {
      return;
    }

    updateLocation({
      address: user.primaryAddress,
      capabilities: ['APPOINTMENT_SCHEDULING'],
      name: '',
      slots: [],
    });
  }, [user?.primaryAddress, updateLocation]);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className={cn('space-y-8')}>
        <H2 className="text-2xl md:text-3xl">Confirm shipping address</H2>
        <CurrentAddressCard />
      </div>
      <ScheduleFlowFooter nextBtnDisabled={!location} />
    </div>
  );
};
