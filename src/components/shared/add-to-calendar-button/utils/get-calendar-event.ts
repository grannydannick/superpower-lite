import { CalendarEvent } from 'calendar-link';
import { format } from 'date-fns';

import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { Address, CollectionMethodType, Slot } from '@/types/api';
import { formatAddress } from '@/utils/format';

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
    description: `This test is sent by Superpower, made available by Grail Labs.
    
Your blood draw for the Grail Galleri Multi Cancer Detection Test  is scheduled at ${formatAddress(address)} on ${format(new Date(slot.start), 'EEEE, MMMM do, yyyy, h:mm a')}
Your results will be uploaded to your dashboard once complete.
    
What to expect:
🧪 The report will be ready in ~14 days, after your samples are received at the lab.
🩸 The blood draw will only take ~10 min! Please remember to have your phone at hand prior to the appointment for reminders and updates.
    
What to do:
✅No fasting or preparation is required for this test.
🩺 Your phlebotomist will collect, prepare, and ship your sample for you.
What to have ready:
    
01 – Please remember to have your test kit with you: Once your phlebotomist arrives, they'll guide you through the test's sample collection.`,
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
