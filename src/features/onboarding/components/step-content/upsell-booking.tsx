import { UpsellBooking } from '@/features/onboarding/components/upsell';

import { ConfiguratorLayout } from '../layouts';

export const UpsellBookingStep = () => (
  <ConfiguratorLayout title="Book additional services" className="bg-zinc-50">
    <UpsellBooking />
  </ConfiguratorLayout>
);
