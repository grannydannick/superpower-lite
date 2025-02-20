import React from 'react';

import { AtHomeNoticeSection } from '@/features/onboarding/components/configurator/at-home-notice-section';
import { VerifyCouponCode } from '@/features/onboarding/components/configurator/verify-coupon-code';

import {
  SectionBilling,
  SectionSubscriptions,
} from '../components/configurator';

export const CONFIGURATOR_ITEMS = [
  {
    component: <SectionSubscriptions />,
  },
  {
    component: <AtHomeNoticeSection />,
  },
  {
    component: <VerifyCouponCode />,
  },
  {
    component: <SectionBilling />,
  },
];
