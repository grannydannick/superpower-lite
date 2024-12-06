import React from 'react';

import {
  SectionBilling,
  SectionSubscriptions,
} from '../components/configurator';

export const CONFIGURATOR_ITEMS = [
  {
    component: <SectionSubscriptions />,
  },
  {
    component: <SectionBilling />,
  },
];
