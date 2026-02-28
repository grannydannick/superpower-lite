import { DialogTrigger } from '@radix-ui/react-dialog';
import { addDays, format, startOfDay } from 'date-fns';
import { X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { RxSubscription } from '@/types/api';
import { getRxImageUrl } from '@/utils/prescription';

import { useUpdateRefillDate } from '../api/update-refill-date';

export const ChangeRefillDialog = ({
  children,
  subscription,
}: {
  children: ReactNode;
  subscription: RxSubscription;
}) => {
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-6">
          <ChangeRefillDialogContent subscription={subscription} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-[592px] px-14 py-16">
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        <ChangeRefillDialogContent subscription={subscription} />
      </DialogContent>
    </Dialog>
  );
};

const ChangeRefillDialogContent = ({
  subscription,
}: {
  subscription: RxSubscription;
}) => {
  const [date, setDate] = useState<Date | undefined>();
  const updateRefillDateMutation = useUpdateRefillDate();

  const updateDate = async () => {
    if (!date) return;

    await updateRefillDateMutation.mutateAsync({
      id: subscription.contract.id,
      anchorDate: date.toISOString(),
    });
  };

  if (updateRefillDateMutation.isSuccess) {
    return <ChangeRefillConfirmation subscription={subscription} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H2>Change refill date</H2>
        <Body1 className="text-secondary">
          Want to adjust your refill date? Delay your refill date for up to two
          weeks, once per refill period. An earlier refill requires manual
          approval.
        </Body1>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-full space-y-1.5 rounded-xl border px-3 py-2">
          <Body2 className="text-secondary">Current refill date</Body2>
          <Body1>
            {format(new Date(subscription.contract.anchorDate), 'MMM d, yyyy')}
          </Body1>
        </div>
        <div className="w-full space-y-1.5 rounded-xl border px-3 py-2">
          <Body2 className="text-secondary">Updated refill date</Body2>
          {date ? (
            <Body1>{format(date, 'MMM d, yyyy')}</Body1>
          ) : (
            <Body1 className="text-zinc-400">Select below</Body1>
          )}
        </div>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="flex w-full rounded-2xl border"
        classNames={{
          months: 'relative flex w-full flex-col',
          month: 'relative w-full space-y-4',
          month_grid: 'w-full border-collapse space-y-1',
          weekdays: 'flex w-full',
          weekday:
            'text-muted-foreground flex-1 text-center font-normal text-[0.8rem]',
          week: 'flex w-full mt-2',
          day: 'flex-1 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day_button:
            'h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium',
        }}
        disabled={{
          before: addDays(startOfDay(subscription.contract.anchorDate), 2),
        }}
        defaultMonth={new Date(subscription.contract.anchorDate)}
      />
      <div className="flex flex-col items-center justify-end gap-2.5 md:flex-row">
        <Button
          variant="outline"
          className="w-full md:w-auto"
          disabled={updateRefillDateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          className="w-full md:w-auto"
          disabled={!date || updateRefillDateMutation.isPending}
          onClick={updateDate}
        >
          {updateRefillDateMutation.isPending ? <Spinner /> : 'Confirm'}
        </Button>
      </div>
    </div>
  );
};

const ChangeRefillConfirmation = ({
  subscription,
}: {
  subscription: RxSubscription;
}) => {
  const imgUrl = getRxImageUrl(
    subscription.medicationRequest?.medicationDisplay,
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <img
        className="size-[287px] object-cover"
        src={imgUrl}
        alt={subscription.medicationRequest?.medicationDisplay}
      />
      <div className="space-y-2 text-center">
        <H3>Refill date confirmed</H3>
        <Body1 className="text-secondary">
          We’ve adjusted your refill date and you will receive your next refill
          on {format(new Date(subscription.contract.anchorDate), 'MMM d, yyyy')}
        </Body1>
      </div>
    </div>
  );
};
