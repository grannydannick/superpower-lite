import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { getOnboardingAddOnsQueryOptions } from '@/features/add-on-panels/api/add-on-panels';
import { ScheduleFlow } from '@/features/orders/components/schedule';
import { SCHEDULE_MARKETPLACE_VARIANTS } from '@/features/orders/components/schedule/schedule-marketplace-variant';

export const Route = createFileRoute('/_app/_maps/schedule')({
  validateSearch: zodValidator(
    z.object({
      mode: z
        .enum(['test-kit', 'phlebotomy', 'advisory-call'])
        .optional()
        .catch(undefined),
      showAddons: z.boolean().optional().catch(undefined),
      variant: z
        .enum(SCHEDULE_MARKETPLACE_VARIANTS)
        .optional()
        .catch(undefined),
    }),
  ),
  loaderDeps: ({ search }) => ({
    mode: search.mode,
    showAddons: search.showAddons,
    variant: search.variant,
  }),
  loader: async ({ context, deps }) => {
    if (deps.mode === 'phlebotomy' && deps.showAddons) {
      await Promise.all([
        import('@/features/add-on-panels/add-on-panels-step'),
        context.queryClient.ensureQueryData(
          getOnboardingAddOnsQueryOptions({ collectionMethod: 'phlebotomy' }),
        ),
      ]);
    }

    return null;
  },
  component: ScheduleComponent,
});

function ScheduleComponent() {
  const { mode: scheduleMode, showAddons, variant } = Route.useSearch();

  return (
    <div className="flex min-h-dvh flex-col">
      <ScheduleFlow
        mode={scheduleMode ?? 'phlebotomy'}
        showAddons={showAddons ?? false}
        marketplaceVariant={
          showAddons === true ? (variant ?? 'add-ons') : undefined
        }
      />
    </div>
  );
}
