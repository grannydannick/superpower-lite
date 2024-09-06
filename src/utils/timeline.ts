import { HealthcareService } from '@/types/api';
import { TimelineType } from '@/types/timeline';

export const getServiceTimeline = (
  healthcareService: HealthcareService | null,
): TimelineType[] => {
  if (!healthcareService) return [];

  if (healthcareService.phlebotomy) {
    return [
      { title: 'Pre-appointment procedures', complete: true },
      {
        title:
          'Phlebotomist completes your blood draw appointment in ~15 minutes',
        complete: false,
      },
      { title: 'Test results processed within 10 days', complete: false },
      { title: 'Results uploaded ', complete: false },
    ];
  } else {
    return [];
  }
};
