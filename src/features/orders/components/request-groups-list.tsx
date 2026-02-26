import { Link } from '@tanstack/react-router';
import { ChevronDown, CalendarPlus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';
import { capitalize } from '@/utils/format';

import { useVisibleRequestGroups } from '../../services/hooks/use-visible-request-groups';

import { RequestGroupCard } from './request-group-card';

type RequestGroupsListProps = {
  status: OrderStatus;
};

export const RequestGroupsList = React.memo(
  ({ status }: RequestGroupsListProps) => {
    const [collapsibleOpen, setCollapsibleOpen] = useState(false);
    const {
      isLoading,
      visibleRequestGroups,
      totalFiltered,
      restRequestGroups,
      defaultVisible,
    } = useVisibleRequestGroups({ status });

    if (isLoading) {
      return (
        <div className="flex h-48 w-full items-center justify-center">
          <Spinner variant="primary" size="lg" />
        </div>
      );
    }

    if (totalFiltered === 0)
      return <RequestGroupsListListEmpty status={status} />;

    return (
      <section className="space-y-2">
        <H4>{capitalize(status)} orders</H4>
        <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
          <div className="grid gap-5">
            <RequestGroupCard requestGroups={visibleRequestGroups} />
          </div>

          <CollapsibleContent>
            <div className="mt-5 grid gap-5">
              <RequestGroupCard requestGroups={restRequestGroups} />
            </div>
          </CollapsibleContent>

          {totalFiltered > defaultVisible && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="small"
                className="mx-auto mt-5 flex flex-row items-center space-x-2 text-secondary"
              >
                <Body1>
                  {collapsibleOpen
                    ? 'Collapse'
                    : `${totalFiltered - defaultVisible} more bookings`}
                </Body1>
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-300 ease-in-out',
                    collapsibleOpen ? 'rotate-180' : 'rotate-0',
                  )}
                />
                <span className="sr-only">
                  {collapsibleOpen
                    ? 'Collapse'
                    : `${totalFiltered - defaultVisible} more bookings`}
                </span>
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </section>
    );
  },
);

RequestGroupsList.displayName = 'OrdersList';

export const RequestGroupsListListEmpty = ({
  status,
}: RequestGroupsListProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300">
      <div className="group relative">
        <div
          className={cn(
            'mx-auto flex max-w-[420px] flex-col items-center justify-center py-10 text-center transition-all ease-out',
            'lg:group-hover:opacity-30 lg:group-hover:blur-sm',
          )}
        >
          <h3 className="mt-4 text-lg">No {status} orders yet</h3>
          <p className="mb-4 mt-2 text-sm text-secondary">
            You have no {status} orders.
          </p>
          {/* Mobile-only CTA (< md) */}
          <div className="lg:hidden">
            <Button asChild size="medium">
              <Link to="/services">Get Started</Link>
            </Button>
          </div>
        </div>

        <Link
          to="/services"
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'pointer-events-none scale-95 opacity-0 transition-all duration-200 ease-out',
            'lg:pointer-events-auto lg:group-hover:scale-100 lg:group-hover:opacity-100',
            'active:scale-100 active:opacity-100',
          )}
          aria-label="Get started with services"
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl">
            <CalendarPlus />
            <span className="text-base font-medium">Get Started</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
