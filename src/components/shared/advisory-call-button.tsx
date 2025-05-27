import { ClockIcon, VideoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { READY_NUM_HOURS_BEFORE_ADVISORY } from '@/const';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/api';

export const AdvisoryCallButton = ({ order }: { order: Order }) => {
  const webAddress = order.location.webAddress;

  if (!webAddress || order.status === OrderStatus.completed) {
    return;
  }

  const isAppointmentSoon =
    new Date(order.startTimestamp).getTime() > Date.now() &&
    new Date(order.startTimestamp).getTime() - Date.now() <
      1000 * 60 * 60 * READY_NUM_HOURS_BEFORE_ADVISORY;

  const isLinkReady = webAddress.url && isAppointmentSoon;

  const onClickLinkReady = () => {
    if (!isLinkReady) return;
    window.open(webAddress.url, '_blank', 'noreferrer');
  };

  return (
    <Button
      disabled={!isLinkReady}
      className={cn(
        !isLinkReady && 'bg-zinc-100 text-zinc-400 disabled:opacity-100',
        'text-sm gap-2',
      )}
      variant={isLinkReady ? 'outline' : 'default'}
      onClick={onClickLinkReady}
    >
      {isLinkReady ? null : <ClockIcon color="#A1A1AA" size={16} />}
      {isAppointmentSoon ? 'Launch' : 'Upcoming'}
      {isAppointmentSoon ? <VideoIcon /> : null}
    </Button>
  );
};
