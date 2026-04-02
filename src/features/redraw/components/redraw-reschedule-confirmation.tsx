import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, H2 } from '@/components/ui/typography';
import { RequestGroup } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { RedrawRescheduleMode } from './redraw-reschedule-mode';

export function RedrawRescheduleConfirmation({
  mode,
  requestGroup,
}: {
  mode: RedrawRescheduleMode;
  requestGroup: RequestGroup;
}) {
  const serviceName =
    requestGroup.orders.length === 1
      ? requestGroup.orders[0].serviceName
      : undefined;

  return (
    <div className="flex flex-col justify-center gap-4 px-4 md:max-w-none">
      <ProgressiveImage
        src={
          serviceName
            ? getServiceImage(serviceName)
            : '/services/custom_blood_panel.png'
        }
        alt={'Superpower service'}
        className="h-[337px] w-full rounded-[20px] bg-zinc-50 object-contain"
      />
      <div className="max-w-[220px] space-y-4 md:max-w-none">
        <H2 className="text-zinc-900">
          Are you sure you want to {mode} your recollection?
        </H2>
      </div>
      {mode === 'cancel' ? (
        <Body1 className="text-zinc-500">
          You can schedule a new recollection from your dashboard as long as the
          requisition remains active.
        </Body1>
      ) : null}
    </div>
  );
}
