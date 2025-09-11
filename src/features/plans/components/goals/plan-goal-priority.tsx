import { cva } from 'class-variance-authority';

import { Body2 } from '@/components/ui/typography';

const getPriorityVariant = cva('shrink-0 rounded-full px-2 py-0.5', {
  variants: {
    priority: {
      'high-priority': 'bg-pink-50 text-pink-700',
      'medium-priority': 'bg-yellow-50/20 text-yellow-700',
      'low-priority': 'bg-green-50 text-green-700',
    },
  },
});

export const PlanGoalPriority = ({ code }: { code?: string }) => {
  // Only render if the code is one of the expected values
  const validPriorities = ['high-priority', 'medium-priority', 'low-priority'];

  if (!code || !validPriorities.includes(code)) {
    return null;
  }

  const priority = code as 'high-priority' | 'medium-priority' | 'low-priority';

  const text = () => {
    switch (priority) {
      case 'high-priority':
        return 'High priority';
      case 'medium-priority':
        return 'Medium priority';
      case 'low-priority':
        return 'Low priority';
      default:
        return '';
    }
  };

  return <Body2 className={getPriorityVariant({ priority })}>{text()}</Body2>;
};
