import { Collapsible } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { Fragment, useState } from 'react';

import { CreditActionCard } from '@/features/orders/components/credit-action-card';
import { cn } from '@/lib/utils';
import { Credit } from '@/types/api';

import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { Body1 } from '../ui/typography';

const EMPTY_CREDITS: Credit[] = [];

export const ActionableAccordion = ({
  credits = EMPTY_CREDITS,
}: {
  credits?: Credit[];
}) => {
  const [open, setOpen] = useState(false);

  const totalActionable = credits.length;

  return (
    <div className="rounded-[20px] border border-vermillion-900 bg-white shadow-[0_0_4px_0_rgba(252,95,43,0.5)]">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="group relative flex w-full items-center gap-3 p-4 text-left">
            <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
              <div className="size-1.5 rounded-full bg-vermillion-900" />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <Body1 className="text-zinc-900">
                You have {totalActionable} actionable
                {totalActionable === 1 ? '' : 's'}
              </Body1>
              <ChevronDown
                className={cn(
                  'size-5 text-zinc-400 transition-transform duration-200',
                  !open && '-rotate-90',
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div>
            <Separator />
            {credits.map((c, index) => (
              <Fragment key={c.id}>
                <CreditActionCard credit={c} />
                {index !== credits.length - 1 ? <Separator /> : null}
              </Fragment>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
