import { AtHomeNoticeSection } from '@/components/shared/at-home-notice-section';

import {
  SubscriptionsSection,
  VerifyCouponCodeSection,
  BillingSection,
} from '../components/configurator';

export const CONFIGURATOR_ITEMS = [
  {
    component: <SubscriptionsSection />,
  },
  {
    component: <AtHomeNoticeSection />,
  },
  // we need to have 2 components inside parent to avoid layout jump on VerifyCouponCodeSection's animation exit
  {
    component: (
      <>
        <VerifyCouponCodeSection />
        <BillingSection />
      </>
    ),
  },
];
