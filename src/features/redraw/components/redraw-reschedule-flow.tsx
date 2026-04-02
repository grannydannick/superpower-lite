import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import { Link } from '@/components/ui/link';
import { Body2 } from '@/components/ui/typography';
import { RequestGroup } from '@/types/api';

import { getScheduledRedrawOrder } from '../utils/get-scheduled-redraw-order';

import { RedrawRescheduleConfirmation } from './redraw-reschedule-confirmation';
import { RedrawRescheduleDetails } from './redraw-reschedule-details';
import { RedrawRescheduleFlowFooter } from './redraw-reschedule-flow-footer';
import { RedrawRescheduleMode } from './redraw-reschedule-mode';

export function RedrawRescheduleFlow({
  requestGroup,
}: {
  requestGroup: RequestGroup;
}) {
  const [mode, setMode] = useState<RedrawRescheduleMode>('default');
  const redrawOrder = getScheduledRedrawOrder(requestGroup);

  if (!redrawOrder) {
    return null;
  }

  let content = null;

  switch (mode) {
    case 'default':
      content = (
        <RedrawRescheduleDetails
          requestGroup={requestGroup}
          redrawOrder={redrawOrder}
          setMode={setMode}
        />
      );
      break;
    case 'cancel':
    case 'reschedule':
      content = (
        <RedrawRescheduleConfirmation requestGroup={requestGroup} mode={mode} />
      );
      break;
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Link>
      </div>
      {content}
      <RedrawRescheduleFlowFooter
        requestGroup={requestGroup}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
}
