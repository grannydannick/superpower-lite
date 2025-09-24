import { IconList } from '@/components/shared/icon-list';
import { Body1 } from '@/components/ui/typography';

import { EVENT_DRAW_STEPS } from '../const/event-draw-steps';

export const EventDrawRecommendations = () => {
  return (
    <>
      <Body1 className="text-secondary">
        You will receive an email with event details and location.
      </Body1>
      <IconList items={EVENT_DRAW_STEPS} className="my-8" />
    </>
  );
};
