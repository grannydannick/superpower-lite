import { Ban, Clock8, GlassWater, Pill, UtensilsCrossed } from 'lucide-react';

import { IconListItem } from '@/components/shared/icon-list';

export const TEST_STEPS: IconListItem[] = [
  {
    icon: Pill,
    title: '72 Hours Before',
    description:
      'Stop taking supplements containing biotin such as multivitamins, B-complex, or hair, skin and nail vitamins. Continue taking prescribed medication.',
  },
  {
    icon: UtensilsCrossed,
    title: '24 Hours Before',
    description:
      'Avoid strenuous exercise and hold off on any alcohol or heavy, fatty foods. These can influence your results.',
  },
  {
    icon: GlassWater,
    title: '10 Hours Before',
    description:
      'Begin fasting the night before your appointment. Make sure to eat prior to your fasting period, and please avoid any food or caffeine during your 10 hour fast. We encourage you to drink plenty of water to stay hydrated!',
  },
];

export const WALK_IN_TEST_STEPS: IconListItem[] = [
  {
    icon: Clock8,
    title: 'Complete Your Draw Soon',
    description:
      'To keep your order active and ensure timely processing of your results, please walk in to your chosen facility within 3–10 days of booking.',
  },
  {
    icon: Ban,
    title: 'Don’t Cancel After Draw',
    description:
      'After completing your blood draw, your order will remain visible in the Orders tab of your portal until results are received. Please don’t cancel these orders once your draw is complete, as it can disrupt result processing and delay your results.',
  },
];
