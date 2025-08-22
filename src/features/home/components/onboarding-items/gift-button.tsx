import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { buildGiftUrl } from '@/features/home/utils/build-gift-url';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { TimelineItemStatus } from '@/types/api';

export function GiftButton({ status }: { status?: TimelineItemStatus }) {
  const { mutate } = useUpdateTask();
  const { data: user } = useUser();
  const giftUrl = buildGiftUrl(user);
  const { track } = useAnalytics();

  const handleClick = () => {
    track('clicked_gift_button');
    // Only mark as completed if it's not already done
    if (status !== 'DONE') {
      mutate({
        data: { status: 'completed' },
        taskName: 'onboarding-gift',
      });
    }
  };

  return (
    <Link
      to={giftUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <Button variant="outline" className="bg-white" size="medium">
        Gift Superpower
      </Button>
    </Link>
  );
}
