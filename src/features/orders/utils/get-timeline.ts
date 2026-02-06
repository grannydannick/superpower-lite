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
    { title: 'Test scheduled', complete: true },
    {
      title: 'Preparation instructions sent',
      time: 'Appointment complete',
      complete: false,
    },
    {
      title: 'View results & build your protocol',
      time: 'In 10 days',
      complete: false,
    },
  ];

  const creditTimeline = [
    { title: 'Complete purchase', complete: true },
    { title: 'Schedule your appointments', complete: false },
    { title: 'Results uploaded', time: 'In 10 days', complete: false },
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
