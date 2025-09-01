import { GlassWater, Pill, UtensilsCrossed } from 'lucide-react';

import { IconListItem } from '@/components/shared/icon-list';

export const TEST_STEPS: IconListItem[] = [
  {
    icon: Pill,
    title: '72 Hours Before',
    description:
      'Stop taking supplements containing biotin such as multivitamins, B-complex, or hair skin and nail vitamins. Continue taking prescribed medication.',
  },
  {
    icon: UtensilsCrossed,
    title: '24 Hours Before',
    description:
      'Avoid strenuous exercise and hold off on any alcohol or heavy, fatty foods. These all can influence your results.',
  },
  {
    icon: GlassWater,
    title: '10 Hours Before',
    description:
      'Begin fasting prior to your appointment. Make sure to eat prior to your fasting period, and please avoid any food or caffeine during your 10 hour fast. We encourage you to drink plenty of water to stay hydrated!',
  },
];
