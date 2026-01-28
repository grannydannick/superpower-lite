import { useLocation } from 'react-router-dom';

import { ScheduleFlow } from '@/features/orders/components/schedule';
import { ServiceGroup } from '@/types/api';

export const ScheduleRoute = () => {
  const { search } = useLocation();

  const params = new URLSearchParams(search);

  const mode = params.get('mode');

  // TODO: probably validate mode
  return (
    <div className="flex min-h-dvh flex-col">
      <ScheduleFlow mode={mode ? (mode as ServiceGroup) : 'phlebotomy'} />
    </div>
  );
};
