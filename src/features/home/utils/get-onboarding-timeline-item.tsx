import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { TimelineItem } from '@/types/api';

import {
  IdentityDialog,
  InsuranceDialog,
  WearableDialog,
  GiftButton,
} from '../components/onboarding-items';

const ONBOARDING_ITEMS = {
  IMPORT_MEDICAL_DATA: 'Identity',
  INTAKE: 'Intake',
  SCREENING: 'Screening',
  WEARABLES: 'Wearable',
  INSURANCE: 'Insurance',
  GIFT: 'Gift friends & family 100 years',
} as const;

export const getOnboardingTimelineItem = (timelineItem: TimelineItem) => {
  switch (timelineItem.name) {
    case ONBOARDING_ITEMS.IMPORT_MEDICAL_DATA:
      return {
        image: 'services/full_genetic_sequencing.png',
        button: <IdentityDialog />,
      };
    case ONBOARDING_ITEMS.INTAKE:
      return {
        image: 'timeline/typeform.png',
        button: (
          <Link to={`/questionnaire/intake`}>
            <Button variant="outline" className="bg-white" size="medium">
              Complete
            </Button>
          </Link>
        ),
      };
    case ONBOARDING_ITEMS.SCREENING:
      return {
        image: 'timeline/typeform.png',
        button: (
          <Link to={`/questionnaire/${INTAKE_QUESTIONNAIRE}`}>
            <Button variant="outline" className="bg-white" size="medium">
              Complete
            </Button>
          </Link>
        ),
      };
    case ONBOARDING_ITEMS.WEARABLES:
      return {
        image: 'timeline/wearables.webp',
        button: <WearableDialog />,
      };
    case ONBOARDING_ITEMS.INSURANCE:
      return {
        image: 'timeline/insurance.webp',
        button: <InsuranceDialog />,
      };
    case ONBOARDING_ITEMS.GIFT:
      return {
        image: 'timeline/gift-superpower.png',
        button: <GiftButton status={timelineItem.status} />,
      };
    default:
      return null;
  }
};
