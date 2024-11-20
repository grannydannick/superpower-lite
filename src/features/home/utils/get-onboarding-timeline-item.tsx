import { TimelineItem } from '@/types/api';

import {
  IdentityDialog,
  InsuranceDialog,
  TypeformDialog,
  WearableDialog,
} from '../components/onboarding-items';

export const getOnboardingTimelineItem = (timelineItem: TimelineItem) => {
  const questionnaireId = timelineItem.id;
  switch (timelineItem.name) {
    case 'Identity':
      return {
        image: 'services/full_genetic_sequencing.png',
        button: <IdentityDialog questionnaireId={questionnaireId} />,
      };

    case 'Intake':
      return {
        image: 'timeline/typeform.png',
        button: <TypeformDialog questionnaireId={questionnaireId} />,
      };
    case 'Wearable':
      return {
        image: 'timeline/wearables.webp',
        button: <WearableDialog questionnaireId={questionnaireId} />,
      };
    case 'Insurance':
      return {
        image: 'timeline/insurance.webp',
        button: <InsuranceDialog questionnaireId={questionnaireId} />,
      };
    default:
      return null;
  }
};
