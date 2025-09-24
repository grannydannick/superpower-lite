import { isEventDrawCoupon, getEventDrawMetadata } from '@/utils/access-code';

export const useEventDraw = () => {
  const isEventDrawUserValue = isEventDrawCoupon();
  const metadata = getEventDrawMetadata();
  const eventDrawLocation = metadata?.location ?? '';
  const eventDrawTime = metadata?.time ?? '';

  return {
    isEventDrawUser: isEventDrawUserValue,
    eventDrawLocation,
    eventDrawTime,
  };
};
