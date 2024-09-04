import { ClockIcon } from 'lucide-react';
import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/features/services/api/get-services';
import { cn } from '@/lib/utils';
import { Order } from '@/types/api';

export function UpcomingOrderCard(order: Order): JSX.Element {
  const { data, isLoading } = useServices();

  const date = moment(order.timestamp).tz(moment.tz.guess());
  const address = order.location.address;
  const webAddress = order.location.webAddress;

  // X hours before appointment
  const READY_NUM_HOURS_BEFORE_APPT = 1;
  const isAppointmentSoon =
    new Date(order.timestamp).getTime() - Date.now() <
    1000 * 60 * 60 * READY_NUM_HOURS_BEFORE_APPT;
  const isLinkReady = webAddress?.url && isAppointmentSoon;

  const onClickLinkReady = () => {
    if (!isLinkReady) return;
    window.open(webAddress.url, '_top', 'noreferrer');
  };

  const SERVICES_WITH_ONLINE_VISIT = ['1-1 Advisory Call'];

  const isOnlineVisit = SERVICES_WITH_ONLINE_VISIT.includes(order.name);

  const healthcareService = data?.services.find(
    (s) => s.id === order.serviceId,
  );

  return (
    <Card>
      <div className="flex flex-col justify-between p-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {!isLoading ? (
            <img
              src={healthcareService?.image}
              alt={order.name}
              className="size-[80px] rounded-lg border border-zinc-200 object-cover"
            />
          ) : (
            <Skeleton className="h-[80px] min-w-[80px] rounded-lg" />
          )}
          <div className="space-y-2 md:space-y-1">
            <h2 className="text-xl text-primary">{order.name}</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {webAddress ? (
                <p className="line-clamp-1">
                  Zoom link will be available {READY_NUM_HOURS_BEFORE_APPT} hour
                  {READY_NUM_HOURS_BEFORE_APPT === 1 ? '' : 's'} before the call
                </p>
              ) : address ? (
                <p className="line-clamp-1">{address.line.join(', ')}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-6 md:mt-0 md:flex-row md:items-center">
          <div className="flex flex-row text-sm text-zinc-400 md:flex-col">
            <>
              <span>{date.format('MMMM Do')}</span>
              <svg
                className={`mx-1.5 w-1 fill-[#A5A5AD] md:hidden`}
                viewBox="0 0 2 2"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              <span>{date.format('h:mma')}</span>
            </>
          </div>

          {/*{order.method.includes('IN_LAB') ? (*/}
          {/*  <QRCodeModal appointmentId={order?.externalId} />*/}
          {/*) : null}*/}
          {isOnlineVisit && (
            <Button
              disabled={!isLinkReady}
              className={cn(
                !isLinkReady &&
                  'bg-[#F6F6F6] text-[#A1A1AA] disabled:opacity-100',
                'text-sm',
              )}
              onClick={onClickLinkReady}
            >
              {isLinkReady ? null : (
                <ClockIcon color="#A1A1AA" size={16} className="mr-2" />
              )}
              {isAppointmentSoon ? 'Launch' : 'Upcoming'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// export function QRCodeModal({
//   appointmentId,
// }: {
//   appointmentId: string | undefined;
// }): JSX.Element {
//   const { isLoading, data } = useAppointment(appointmentId);
//
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center">
//         <Loading className="size-4" />
//       </div>
//     );
//   }
//
//   if (!data?.appointment?.qrCode) {
//     return <></>;
//   }
//
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="w-full text-sm md:w-auto">Check In</Button>
//       </DialogTrigger>
//       <DialogContent className="size-auto items-center justify-center">
//         <div
//           className="flex size-[300px] items-center p-6"
//           dangerouslySetInnerHTML={{ __html: data?.appointment?.qrCode }}
//         />
//       </DialogContent>
//     </Dialog>
//   );
// }
