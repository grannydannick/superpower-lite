import { Calendar, MapPin, ArrowUpRight, FileIcon } from 'lucide-react';
import moment from 'moment';
import React from 'react';

import { PdfFileIcon } from '@/components/icons';
import { DotIcon } from '@/components/icons/dot';
import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Body1, H4 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_ADVANCED_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useFiles } from '@/features/files/api';
import { useDownloadFile } from '@/features/files/api/download-file';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { Location, CollectionMethodType, Slot } from '@/types/api';

interface OrderAppointmentDetailsProps {
  slot?: Slot;
  timezone: string;
  location?: Location | null;
  collectionMethod?: CollectionMethodType;
  serviceName?: string;
  orderId?: string;
}

function OrderFileLinkFromFiles({ orderId }: { orderId: string }) {
  const { data, isLoading } = useFiles();
  const file = data?.files?.find(
    (f) => f.orderId === orderId && f.name.startsWith('lab-order-'),
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
    <div className="flex gap-4 px-4 py-6">
      <FileIcon className="size-5 text-zinc-500" />
      <div className="space-y-1">
        <span className="text-sm text-zinc-500">Lab Order</span>
        <div className="flex items-center gap-2">
          <PdfFileIcon className="size-5 text-vermillion-900" />
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

export function OrderAppointmentDetails({
  slot,
  timezone,
  location,
  collectionMethod,
  orderId,
  serviceName,
}: OrderAppointmentDetailsProps): React.ReactNode {
  if (!location?.address) {
    return null;
  }

  // generate maps URL
  const mapsUrl = location?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address.line.join(' ') + ', ' + location.address.city + ', ' + location.address.state + ' ' + location.address.postalCode)}`
    : '#';

  const renderAddToCalendar = () => {
    if (!slot || !serviceName || !collectionMethod || !location?.address)
      return null;

    if (
      serviceName !== SUPERPOWER_BLOOD_PANEL &&
      serviceName !== SUPERPOWER_ADVANCED_BLOOD_PANEL &&
      serviceName !== GRAIL_GALLERI_MULTI_CANCER_TEST
    ) {
      return null;
    }

    return (
      <AddToCalendar
        address={location.address}
        slot={slot}
        service={serviceName}
        collectionMethod={collectionMethod}
      />
    );
  };

  return (
    <div>
      <H4>Appointment details</H4>

      {orderId ? <OrderFileLinkFromFiles orderId={orderId} /> : null}
      <div className="flex gap-4 px-4 py-6">
        <Calendar className="size-5 text-zinc-500" />
        <div className="space-y-1">
          <Body1 className="text-zinc-500">Date scheduled</Body1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Body1>
              {moment(slot?.start).tz(timezone).format('MMM Do, YYYY')}
            </Body1>
            <DotIcon fill="#18181B" className="hidden sm:block" />
            <Body1>
              {moment(slot?.start).tz(timezone).format('h:mma')}-{' '}
              {moment(slot?.end).tz(timezone).format('h:mma z')}
            </Body1>
          </div>
          {renderAddToCalendar()}
        </div>
      </div>
      {location?.address ? (
        <div className="flex gap-4 px-4 py-6">
          <MapPin className="size-5 text-zinc-500" />
          <div className="space-y-1">
            <Body1 className="text-zinc-500">Location</Body1>
            <div>
              <Body1>{location.address.line.join(' ')}</Body1>
              <Body1>
                {location.address.city}, {location.address.state},{' '}
                {location.address.postalCode}
              </Body1>
            </div>
            {location?.address && (
              <div className="mt-2">
                <a
                  href={mapsUrl}
                  className="flex items-center gap-1 text-sm font-medium text-vermillion-900"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in maps <ArrowUpRight className="size-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
