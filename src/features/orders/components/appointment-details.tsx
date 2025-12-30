import {
  Calendar,
  MapPin,
  HomeIcon,
  VideoIcon,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import moment from 'moment-timezone';
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
  console.log(data);
  const file = data?.files?.find(
    (f) =>
      f.name?.startsWith('lab-order-') &&
      f.orderIds?.some((id) => orderIds.includes(id)),
  );

  const { mutateAsync } = useDownloadFile();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!file) return;
    const blob = await mutateAsync({ fileId: file.id });
    downloadBlob(blob, file.name);
  };

  if (isLoading || !file) return null;

  return (
    <div className="flex gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <PdfFileIcon className="-mt-0.5 size-4 text-vermillion-900" />
          <Body1 className="text-secondary">Lab Order</Body1>
        </div>
        <div className="pl-6">
          <a
            href="#"
            onClick={handleDownload}
            className="line-clamp-1 max-w-[180px] text-sm font-medium text-vermillion-900"
          >
            {file.name}
          </a>
        </div>
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
}: AppointmentDetailsProps): React.ReactNode {
  if (!location?.address) {
    return null;
  }

  const renderAddToCalendar = () => {
    if (!slot || !collectionMethod || !location?.address) return null;

    return (
      <AddToCalendar
        address={location.address}
        slot={slot}
        collectionMethod={collectionMethod}
        variant="vermillion"
      />
    );
  };

  const collectionMethodLabel = (() => {
    if (isAdvisory === true) return 'Video call';
    if (isTestKit === true) return 'Shipping address';
    return 'Address';
  })();

  const collectionMethodIcon = (() => {
    if (isAdvisory === true)
      return <VideoIcon className="size-5 text-zinc-500" />;
    // TODO: this should be switch
    return collectionMethod === 'AT_HOME' ? (
      <HomeIcon className="size-4 text-zinc-500" />
    ) : (
      <MapPin className="size-4 text-zinc-500" />
    );
  })();

  return (
    <div className="flex flex-col gap-4">
      <H4>{isTestKit ? 'Shipping details' : 'Appointment details'}</H4>
      <div className="flex flex-col gap-4">
        {orderIds ? <OrderFileLinkFromFiles orderIds={orderIds} /> : null}
        {slot && timezone ? (
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="-mt-0.5 size-4 text-secondary" />
                  <Body1 className="text-secondary">
                    {collectionMethod === 'IN_LAB' ? 'In lab' : 'At home'}{' '}
                    appointment
                  </Body1>
                </div>
                <div className="space-y-2 pl-6">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <Body1>
                      {moment(slot.start).tz(timezone).format('MMM Do, YYYY')}
                    </Body1>
                    <DotIcon
                      fill="currentColor"
                      className="hidden text-zinc-300 sm:block"
                    />
                    <Body1>
                      {moment(slot.start).tz(timezone).format('h:mma')}-{' '}
                      {moment(slot.end).tz(timezone).format('h:mma z')}
                    </Body1>
                  </div>
                  {renderAddToCalendar()}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {price && price > 0 ? (
          <div className="flex gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="-mt-0.5 size-4 text-secondary" />
                <Body1 className="text-secondary">Price</Body1>
              </div>

              <div className="pl-6">
                <Body1>{formatMoney(price)}</Body1>
              </div>
            </div>
          </div>
        ) : null}
        {location?.address ? (
          <div className="flex gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {collectionMethodIcon}
                <Body1 className="text-secondary">
                  {collectionMethodLabel}
                </Body1>
              </div>
              <div className="pl-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Body1>{location.address.line.join(' ')}</Body1>
                    {!location.capabilities.includes(
                      'APPOINTMENT_SCHEDULING',
                    ) ? (
                      <Badge variant="vermillion">WALK IN</Badge>
                    ) : null}
                  </div>
                  <Body1>
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
