import {
  Calendar,
  MapPin,
  HomeIcon,
  VideoIcon,
  ArrowRight,
  TestTube,
} from 'lucide-react';
import moment from 'moment';
import React, { useMemo } from 'react';

import { PdfFileIcon } from '@/components/icons';
import { DotIcon } from '@/components/icons/dot';
import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { useFiles } from '@/features/files/api';
import { useDownloadFile } from '@/features/files/api/download-file';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { openInMaps } from '@/features/orders/utils/open-in-maps';
import { useServices } from '@/features/services/api';
import {
  CollectionMethodType,
  Slot,
  HealthcareService,
  PhlebotomyLocation,
} from '@/types/api';
import { isIOS } from '@/utils/browser-detection';

interface OrderAppointmentDetailsProps {
  slot?: Slot;
  timezone?: string;
  location?: PhlebotomyLocation | null;
  collectionMethod?: CollectionMethodType;
  serviceName?: string;
  orderId?: string;
  isPhlebotomy?: boolean;
  supportsLabOrder?: boolean;
  selectedPanels?: string[];
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
    <div className="flex gap-4 py-6">
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

export function OrderAppointmentDetails({
  slot,
  timezone,
  location,
  collectionMethod,
  orderId,
  serviceName,
  isPhlebotomy,
  supportsLabOrder,
  selectedPanels,
}: OrderAppointmentDetailsProps): React.ReactNode {
  if (!location?.address) {
    return null;
  }

  const renderAddToCalendar = () => {
    if (!slot || !serviceName || !collectionMethod || !location?.address)
      return null;

    if (supportsLabOrder === false) {
      return null;
    }

    return (
      <AddToCalendar
        address={location.address}
        slot={slot}
        serviceName={serviceName}
        collectionMethod={collectionMethod}
        variant="vermillion"
      />
    );
  };

  const method = collectionMethod ?? 'IN_LAB';
  const isAdvisoryCall = serviceName === ADVISORY_CALL;

  const collectionMethodLabel = (() => {
    if (isAdvisoryCall) return 'Video call';
    return 'Address';
  })();

  const collectionMethodIcon = (() => {
    if (isAdvisoryCall) return <VideoIcon className="size-5 text-zinc-500" />;
    return method === 'AT_HOME' ? (
      <HomeIcon className="size-4 text-zinc-500" />
    ) : (
      <MapPin className="size-4 text-zinc-500" />
    );
  })();

  return (
    <div>
      <H4>{isPhlebotomy ? 'Appointment details' : 'Details'}</H4>

      {orderId ? <OrderFileLinkFromFiles orderId={orderId} /> : null}
      {isPhlebotomy && slot && timezone ? (
        <div className="flex gap-4 py-6">
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
      {location?.address ? (
        <div className="flex gap-4 py-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {collectionMethodIcon}
              <Body1 className="text-secondary">{collectionMethodLabel}</Body1>
            </div>
            <div className="pl-6">
              <div>
                <div className="flex items-center gap-2">
                  <Body1>{location.address.line.join(' ')}</Body1>
                  {!location.capabilities.includes('APPOINTMENT_SCHEDULING') ? (
                    <Badge variant="vermillion">WALK IN</Badge>
                  ) : null}
                </div>
                <Body1>
                  {location.address.city}, {location.address.state},{' '}
                  {location.address.postalCode}
                </Body1>
              </div>
              {location?.address && method !== 'AT_HOME' && (
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
      {selectedPanels && selectedPanels.length > 0 ? (
        <OrderSelectedPanels selectedPanels={selectedPanels} />
      ) : null}
    </div>
  );
}

const OrderSelectedPanels = ({
  selectedPanels,
}: {
  selectedPanels: string[];
}) => {
  const servicesQuery = useServices({ group: 'blood-panel-addon' });

  const { loading, selectedServices } = useMemo(() => {
    const services = servicesQuery.data?.services ?? [];
    const byId = new Map(services.map((s) => [s.id, s]));

    const selectedServices = selectedPanels
      .map((id) => byId.get(id))
      .filter((s): s is HealthcareService => Boolean(s));

    return {
      loading: servicesQuery.isLoading,
      selectedServices,
    };
  }, [servicesQuery.data?.services, servicesQuery.isLoading, selectedPanels]);

  return (
    <div className="flex gap-4 py-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TestTube className="-mt-0.5 size-4 text-secondary" />
          <Body1 className="text-secondary">Selected panels</Body1>
        </div>
        <div className="w-full pl-6">
          <div className="space-y-1">
            {loading &&
              Array(6)
                .fill(0)
                .map((_, i) => <Skeleton className="h-6 w-full" key={i} />)}
            {selectedServices.map((s) => (
              <Body1 key={s.id}>{s.name}</Body1>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
