import {
  CommitmentStep,
  ConfiguratorStep,
  MissionStep,
  PrimaryAddressStep,
} from '@/features/onboarding/components/step-content';
import { BookingStep } from '@/features/onboarding/components/step-content/booking';
import { ShareStep } from '@/features/onboarding/components/step-content/share';
import { UpsellStep } from '@/features/onboarding/components/step-content/upsell';
import { UpsellBookingStep } from '@/features/onboarding/components/step-content/upsell-booking';
import { StepItem } from '@/lib/stepper';

export const steps: StepItem[] = [
  {
    id: 'primary-address',
    content: <PrimaryAddressStep />,
  },
  {
    id: 'configurator',
    content: <ConfiguratorStep />,
  },
  {
    id: 'booking',
    content: <BookingStep />,
  },
  {
    id: 'upsell',
    content: <UpsellStep />,
  },
  {
    id: 'upsell-booking',
    content: <UpsellBookingStep />,
  },
  {
    id: 'mission',
    content: <MissionStep />,
  },
  {
    id: 'commitment',
    content: <CommitmentStep />,
  },
  {
    id: 'share',
    content: <ShareStep />,
  },
];
