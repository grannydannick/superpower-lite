import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { URLTabs, TabsContent } from '@/components/ui/slider-tabs';
import { H3 } from '@/components/ui/typography';
import { FinishScheduleList } from '@/features/orders/components/finish-schedule-list';
import { RequestGroupsList } from '@/features/orders/components/request-groups-list';
import { CompletedRequestGroupsList } from '@/features/orders/components/request-groups-list-completed';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';

const TABS = [
  { value: 'all', label: 'All orders' },
  { value: 'active', label: 'Active orders' },
  { value: 'past', label: 'Past orders' },
];

export const OrdersRoute = () => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'active' || rawTab === 'past' ? rawTab : 'all';

  const setTab = (value: 'all' | 'active' | 'past') => {
    setSearchParams((params) => {
      if (value === 'all') params.delete('tab');
      else params.set('tab', value);
      return params;
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-9 lg:px-0">
      <div className="space-y-2">
        <H3>Your orders</H3>
        <div className="relative">
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto pr-8 md:flex-wrap md:overflow-visible md:pr-10">
            {TABS.map((opt) => {
              const isActive =
                activeTab === (opt.value as 'all' | 'active' | 'past');

              return (
                <Button
                  key={opt.value}
                  type="button"
                  size={isMobile ? 'small' : 'medium'}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full py-2.5 border shadow-none transition-colors',
                    isActive ? 'border-primary' : 'border-input text-secondary',
                  )}
                  aria-pressed={isActive}
                  onClick={() => setTab(opt.value as 'all' | 'active' | 'past')}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <URLTabs defaultTab="all">
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
      </URLTabs>
    </div>
  );
};
