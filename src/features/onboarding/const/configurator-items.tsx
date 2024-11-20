import React from 'react';

import { SectionBilling, SectionPackages } from '../components/configurator';

export const CONFIGURATOR_ITEMS = [
  {
    component: <SectionPackages />,
  },
  {
    component: <SectionBilling />,
  },
];
