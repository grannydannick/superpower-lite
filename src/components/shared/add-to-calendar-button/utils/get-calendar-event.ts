import { CalendarEvent } from 'calendar-link';

import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { Address, CollectionMethodType, Slot } from '@/types/api';

export const getCalendarEvent = ({
  slot,
  address,
  collectionMethod,
  service,
}: {
  slot: Slot;
  address: Address;
  collectionMethod: CollectionMethodType;
  service:
    | typeof SUPERPOWER_BLOOD_PANEL
    | typeof GRAIL_GALLERI_MULTI_CANCER_TEST;
}) => {
  const cancerEvent: CalendarEvent = {
    title: 'Superpower - Cancer Test Window',
    start: slot?.start,
    duration: [
      (new Date(slot.end).getTime() - new Date(slot.start).getTime()) /
        (1000 * 60 * 60),
      'hour',
    ],
    description: 'Add description here',
    location: `${address?.line.join(' ')}, ${address?.city}, ${address?.state}, ${address?.postalCode}`,
  };

  const bloodDrawEvent: CalendarEvent = {
    title: 'Superpower - Lab Draw Window 💉👩',
    start: slot.start,
    duration: [
      (new Date(slot.end).getTime() - new Date(slot.start).getTime()) /
        (1000 * 60 * 60),
      'hour',
    ],
    description:
      collectionMethod === 'AT_HOME'
        ? `🧪 Results take ~10 days to fully process, but most will be visible within just a few days. 

🩸 The blood draw will only take ~10 min and the nurse will arrive within your confirmed 2-hour window.

What to do:

🍽️ Fasting is required for 10 hours prior to your appointment. Drink plenty of water and no caffeine.`
        : `🧪 Results take ~10 days to fully process, but most will be visible within just a few days.

🩸 The blood draw will only take ~10 min! Please remember to arrive at least 5 minutes before your appointment starts.`,
    location: `${address?.line.join(' ')}, ${address?.city}, ${address?.state}, ${address?.postalCode}`,
  };

  if (service === 'Grail Galleri Multi Cancer Test') {
    return cancerEvent;
  }

  return bloodDrawEvent;
};
