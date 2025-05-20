import {
  BookingStep,
  CommitmentStep,
  ConfiguratorStep,
  UpsellStep,
  UpsellBookingStep,
  MissionStep,
  ShareStep,
  QuestionnaireStep,
} from '@/features/onboarding/components/step-content';
import { StepItem } from '@/lib/stepper/stepper-store-creator';

export const steps: StepItem[] = [
  {
    id: 'configurator',
    content: <ConfiguratorStep />,
  },
  {
    id: 'intake',
    content: <QuestionnaireStep type="intake" showIntro={true} />,
  },
  {
    id: 'screening',
    content: <QuestionnaireStep type="screening" />,
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
