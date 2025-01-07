import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { HealthcareService } from '@/types/api';

export const getConciergeData = (service: HealthcareService) => [
  {
    value: 'concierge',
    title: 'Concierge',
    description:
      'Your dedicated concierge team is always just a text away – for help with logistics, ordering, scheduling or clarifying questions.',
  },
  {
    value: 'longevity_advisor',
    title: 'Longevity Advisor',
    description:
      'Your dedicated longevity and functional medicine trained advisor is available to answer health questions related to your plan or test results, and available for consultations and coaching any time.',
    action: (
      <HealthcareServiceDialog healthcareService={service}>
        <Button className="gap-4 p-3" variant="outline">
          <img
            className="size-12 min-w-12 rounded-xl object-cover"
            src="/services/1-1_advisory_call.png"
            alt="longevity-team"
          />
          <Body2>Book a consult</Body2>
          <ChevronRight className="size-3 text-zinc-400" />
        </Button>
      </HealthcareServiceDialog>
    ),
  },
  {
    value: 'physician',
    title: 'Physician',
    description:
      'All prescriptions will be reviewed and managed by a functional medicine and longevity trained medical doctor. Superpower will send medication specific questions to your physician.',
  },
];
