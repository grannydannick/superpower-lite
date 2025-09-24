import { FileText, MapPin, Heart } from 'lucide-react';

import { IconListItem } from '@/components/shared/icon-list';

export const EVENT_DRAW_STEPS: IconListItem[] = [
  {
    icon: FileText,
    title:
      'Click "Purchase" to complete the Superpower intake survey before the event',
    description:
      'Make sure to go through the intake and answer questions about your health before the event. This is required to participate in the event draw.',
  },
  {
    icon: MapPin,
    title: 'Attend the event and complete your blood draw',
    description:
      'Our certified phlebotomists will be on-site to collect your sample. The process takes 15 minutes per person. Bring a valid ID and arrive during your designated time slot.',
  },
  {
    icon: Heart,
    title: 'Receive your results within 5-7 days in your dashboard',
    description:
      "Your blood panel will be processed and available in your Superpower dashboard. You'll receive notifications when results are ready.",
  },
];
