import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { ScheduleFlow } from '@/features/orders/components/schedule';

export const Route = createFileRoute('/_app/_maps/schedule')({
  validateSearch: zodValidator(
    z.object({
      mode: z
        .enum(['test-kit', 'phlebotomy-kit', 'phlebotomy', 'advisory-call'])
        .optional()
        .catch(undefined),
    }),
  ),
  component: ScheduleComponent,
});

function ScheduleComponent() {
  const scheduleMode = Route.useSearch({ select: ({ mode }) => mode });

  return (
    <div className="flex min-h-dvh flex-col">
      <ScheduleFlow mode={scheduleMode ?? 'phlebotomy'} />
    </div>
  );
}
