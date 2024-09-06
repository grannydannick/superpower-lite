import { CollectionMethodsType } from '@/features/orders/types/collection-method';

export const COLLECTION_METHODS: CollectionMethodsType[] = [
  {
    name: 'In-person lab',
    value: 'IN_LAB',
    description: 'Perform testing at a partner clinic.',
    price: 0,
  },
  {
    name: 'At-home visit',
    value: 'AT_HOME',
    description:
      'Stress-free at your home or office. A nurse will come to you.',
    cancelationText: 'Late cancellation or rescheduling fees apply.',
    price: 7900,
  },
];
