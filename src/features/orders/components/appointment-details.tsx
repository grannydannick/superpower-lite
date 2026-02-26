import { TZDateMini, tzName } from '@date-fns/tz';
import { format } from 'date-fns';
import {
  MapPin,
  HomeIcon,
  VideoIcon,
  ArrowRight,
  DollarSign,
  Calendar,
} from 'lucide-react';
import React from 'react';

import { PdfFileIcon } from '@/components/icons';
import { DotIcon } from '@/components/icons/dot';
import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Badge } from '@/components/ui/badge';
import { Body1, H4 } from '@/components/ui/typography';
import { useFiles } from '@/features/files/api';
import { useDownloadFile } from '@/features/files/api/download-file';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { openInMaps } from '@/features/orders/utils/open-in-maps';
import { CollectionMethodType, Slot, PhlebotomyLocation } from '@/types/api';
import { isIOS } from '@/utils/browser-detection';
import { formatMoney } from '@/utils/format-money';
import { resolveTimeZone } from '@/utils/timezone';

interface AppointmentDetailsProps {
  slot?: Slot;
  timezone?: string;
  location?: PhlebotomyLocation | null;
  collectionMethod?: CollectionMethodType;
  isAdvisory?: boolean;
  isTestKit?: boolean;
  orderIds?: string[];
  price?: number;
}

function OrderFileLinkFromFiles({ orderIds }: { orderIds: string[] }) {
  const { data, isLoading } = useFiles();
  const file = data?.files?.find(
    (f) =>
      f.name?.startsWith('lab-order-') &&
      f.orderIds?.some((id) => orderIds.includes(id)),
  );

  const { mutateAsync } = useDownloadFile();

  const handleDownload = async () => {
    if (!file) return;
    const blob = await mutateAsync({ fileId: file.id });
    downloadBlob(blob, file.name);
  };

  if (isLoading || !file) return null;

  return (
    <div className="flex gap-2">
      <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
        <PdfFileIcon className="size-4 text-vermillion-900" />
      </div>
      <div className="space-y-2">
        <Body1>Lab Order</Body1>
        <button
          type="button"
          onClick={() => {
            void handleDownload();
          }}
          className="line-clamp-1 max-w-[180px] text-sm font-medium text-vermillion-900"
        >
          {file.name}
        </button>
      </div>
    </div>
  );
}

export function AppointmentDetails({
  slot,
  timezone,
  location,
  collectionMethod,
  orderIds,
  isAdvisory,
  isTestKit,
  price,
}: AppointmentDetailsProps) {
  if (!location?.address) {
    return null;
  }

  const effectiveTimeZone =
    timezone != null ? resolveTimeZone(timezone) : undefined;

  const collectionMethodLabel = (() => {
    if (isAdvisory === true) return 'Video call';
    if (isTestKit === true) return 'Shipping address';
    return 'Address';
  })();

  const collectionMethodIcon = (() => {
    if (isAdvisory === true)
      return <VideoIcon className="size-4 text-vermillion-900" />;

    return collectionMethod === 'AT_HOME' ? (
      <HomeIcon className="size-4 text-vermillion-900" />
    ) : (
      <MapPin className="size-4 text-vermillion-900" />
    );
  })();

  return (
    <div className="flex flex-col gap-6">
      <H4>{isTestKit ? 'Shipping details' : 'Appointment details'}</H4>
      <div className="flex flex-col gap-6">
        {orderIds ? <OrderFileLinkFromFiles orderIds={orderIds} /> : null}
        {slot && effectiveTimeZone != null ? (
          <div className="flex gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
              <Calendar className="size-4 text-vermillion-900" />
            </div>
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="space-y-2">
                {isAdvisory ? (
                  <Body1>Video appointment</Body1>
                ) : (
                  <Body1>
                    {collectionMethod === 'IN_LAB' ? 'In lab' : 'At home'}{' '}
                    appointment
                  </Body1>
                )}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <Body1 className="text-secondary">
                      {format(
                        new TZDateMini(slot.start, effectiveTimeZone),
                        'MMM do, yyyy',
                      )}
                    </Body1>
                    <DotIcon
                      fill="currentColor"
                      className="hidden text-zinc-300 sm:block"
                    />
                    <Body1 className="text-secondary">
                      {format(
                        new TZDateMini(slot.start, effectiveTimeZone),
                        'h:mmaaa',
                      )}
                      -{' '}
                      {format(
                        new TZDateMini(slot.end, effectiveTimeZone),
                        'h:mmaaa',
                      )}{' '}
                      {tzName(
                        effectiveTimeZone,
                        new TZDateMini(slot.end, effectiveTimeZone),
                        'short',
                      )}
                    </Body1>
                  </div>
                  {collectionMethod ? (
                    <AddToCalendar
                      address={location.address}
                      slot={slot}
                      collectionMethod={collectionMethod}
                      variant="vermillion"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {price && price > 0 ? (
          <div className="flex gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
              <DollarSign className="size-4 text-vermillion-900" />
            </div>
            <div className="space-y-2">
              <Body1>Price</Body1>
              <Body1 className="text-secondary">{formatMoney(price)}</Body1>
            </div>
          </div>
        ) : null}
        {location?.address && !isAdvisory ? (
          <div className="flex gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
              {collectionMethodIcon}
            </div>
            <div className="space-y-2">
              <Body1>{collectionMethodLabel}</Body1>
              <div>
                <div className="flex items-center gap-2">
                  <Body1 className="text-secondary">
                    {location.address.line.join(' ')}
                  </Body1>
                  {!location.capabilities.includes('APPOINTMENT_SCHEDULING') ? (
                    <Badge variant="vermillion">WALK IN</Badge>
                  ) : null}
                </div>
                <Body1 className="text-secondary">
                  {location.address.city}, {location.address.state},{' '}
                  {location.address.postalCode}
                </Body1>
              </div>
              {location?.address && collectionMethod !== 'AT_HOME' && (
                <div className="mt-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-vermillion-900 transition-all duration-200 hover:opacity-75"
                    onClick={(e) => {
                      e.preventDefault();
                      const mapType = isIOS() ? 'apple' : 'google';
                      openInMaps(location, mapType);
                    }}
                  >
                    <>
                      View directions{' '}
                      <ArrowRight className="mb-0.5 size-[15px]" />
                    </>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
