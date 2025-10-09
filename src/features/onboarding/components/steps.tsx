import {
  AdvancedUpgradeStep,
  BookingStep,
  CommitmentStep,
  HeardAboutUsStep,
  MissionStep,
  QuestionnaireStep,
  ShareStep,
  UpdateInfoStep,
  UpsellBookingStep,
  UpsellStep,
} from '@/features/onboarding/components/step-content';
import { StepItem } from '@/lib/stepper/stepper-store-creator';

export const steps: StepItem[] = [
  {
    id: 'update-info',
    content: <UpdateInfoStep />,
  },
  {
    id: 'advanced-upgrade',
    content: <AdvancedUpgradeStep />,
  },
  {
    id: 'heard-about-us',
    content: <HeardAboutUsStep />,
  },
  {
    id: 'intake',
    content: <QuestionnaireStep showIntro={true} />,
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
    id: 'booking',
    content: <BookingStep />,
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
