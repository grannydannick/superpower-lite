import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/slider-tabs';
import { H3 } from '@/components/ui/typography';
import { FinishScheduleList } from '@/features/orders/components/finish-schedule-list';
import { RequestGroupsList } from '@/features/orders/components/request-groups-list';
import { CompletedRequestGroupsList } from '@/features/orders/components/request-groups-list-completed';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';

const ordersSearchSchema = z.object({
  tab: z.enum(['active', 'past']).optional().catch(undefined),
});

export const Route = createFileRoute('/_app/orders/')({
  validateSearch: zodValidator(ordersSearchSchema),
  component: OrdersComponent,
});

const TABS = [
  { value: 'all', label: 'All orders' },
  { value: 'active', label: 'Active orders' },
  { value: 'past', label: 'Past orders' },
] as const;

function OrdersComponent() {
  const isMobile = useIsMobile();
  const navigate = Route.useNavigate();
  const tab = Route.useSearch({ select: (s) => s.tab });
  const activeTab = tab ?? 'all';

  const setTab = (value: 'all' | 'active' | 'past') => {
    void navigate({
      search: (prev) => {
        return {
          ...prev,
          tab: value === 'all' ? undefined : value,
        };
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-9 lg:px-0">
      <div className="space-y-2">
        <H3>Your orders</H3>
        <div className="relative">
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-10">
            {TABS.map((opt) => {
              const isActive = activeTab === opt.value;

              return (
                <Button
                  key={opt.value}
                  type="button"
                  size={isMobile ? 'small' : 'medium'}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full border py-2.5 shadow-none transition-colors',
                    isActive ? 'border-primary' : 'border-input text-secondary',
                  )}
                  aria-pressed={isActive}
                  onClick={() => setTab(opt.value)}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <Tabs value={activeTab}>
        <TabsContent value="all" className="space-y-10">
          <FinishScheduleList />
          <RequestGroupsList status={OrderStatus.active} />
          <CompletedRequestGroupsList />
        </TabsContent>

        <TabsContent value="active" className="space-y-10">
          <RequestGroupsList status={OrderStatus.active} />
        </TabsContent>

        <TabsContent value="past" className="space-y-10">
          <CompletedRequestGroupsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
