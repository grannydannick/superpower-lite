import { AnimatedTimelineType } from '@/components/ui/animated-timeline';
import { CollectionMethodType, ServiceGroup } from '@/types/api';

export const getTimeline = (
  collectionMethod?: CollectionMethodType,
  type: ServiceGroup | 'credit' = 'credit',
): AnimatedTimelineType[] => {
  const testKitTimeline = [
    { title: 'Test ordered', complete: true },
    {
      title: 'At-home testing',
      complete: false,
    },
    { title: 'Test results processed within 2-4 weeks', complete: false },
    { title: 'Results uploaded', complete: false },
  ];

  const bloodPanelTimeline = [
    { title: 'Test ordered', complete: true },
    { title: 'Schedule a test appointment', complete: true },
    {
      title:
        collectionMethod === 'IN_LAB'
          ? 'Phlebotomist completes your blood draw appointment in ~15 minutes'
          : 'At-home testing',
      complete: false,
    },
    { title: 'Test results processed within 10 days', complete: false },
    { title: 'Results uploaded', complete: false },
    { title: 'Action plan ready', complete: false },
  ];

  const creditTimeline = [
    { title: 'Complete purchase', complete: true },
    { title: 'Schedule your appointments', complete: false },
    { title: 'Test appointment', complete: false },
    { title: 'Results uploaded within 10 days', complete: false },
  ];

  switch (type) {
    case 'test-kit':
      return testKitTimeline;
    case 'credit':
      return creditTimeline;
    default:
      return bloodPanelTimeline;
  }
};
