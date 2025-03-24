import React from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { TimelineItem } from '@/types/api';

import {
  IdentityDialog,
  InsuranceDialog,
  WearableDialog,
} from '../components/onboarding-items';

export const getOnboardingTimelineItem = (timelineItem: TimelineItem) => {
  switch (timelineItem.name) {
    case 'Identity':
      return {
        image: 'services/full_genetic_sequencing.png',
        button: <IdentityDialog />,
      };

    case 'Intake':
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
    case 'Wearable':
      return {
        image: 'timeline/wearables.webp',
        button: <WearableDialog />,
      };
    case 'Insurance':
      return {
        image: 'timeline/insurance.webp',
        button: <InsuranceDialog />,
      };
    default:
      return null;
  }
};
