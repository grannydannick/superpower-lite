import 'moment-timezone';

import { UpsellSequence } from '@/features/onboarding/components/upsell';

import { ConfiguratorLayout } from '../layouts';

export const UpsellStep = () => (
  <ConfiguratorLayout title="Additional services" className="bg-zinc-50">
    <UpsellSequence />
  </ConfiguratorLayout>
);
