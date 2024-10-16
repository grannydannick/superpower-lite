import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { FileUpload } from '@/components/shared/upload-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ADVISORY_CALL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useCreateFile, useDownloadFile } from '@/features/files/api';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { useServices } from '@/features/services/api/get-services';
import { useAuthorization } from '@/lib/authorization';
import { Order } from '@/types/api';

export function CompletedOrderCard(order: Order): JSX.Element {
  const navigate = useNavigate();
  const { data, isLoading } = useServices({});
  const { checkAccess } = useAuthorization();
  const { mutate: createFile } = useCreateFile({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Added file!');
      },
    },
  });
  const { mutate: downloadFile } = useDownloadFile({
    mutationConfig: {
      onSuccess: (data) => {
        downloadBlob(data, `${order.name} Results.pdf`);
      },
    },
  });

  const healthcareService = data?.services.find(
    (s) => s.id === order.serviceId,
  );

  const SERVICES_WITH_ADDRESS = [SUPERPOWER_BLOOD_PANEL, CUSTOM_BLOOD_PANEL];
  const isBloodDraw = SERVICES_WITH_ADDRESS.includes(order.name);
  const isOneOnOne = order.name === ADVISORY_CALL;

  const isAdmin = checkAccess({ allowedRoles: ['SUPER_ADMIN'] });
  const hasFile = Boolean(order.fileId);

  const renderButton = (): JSX.Element => {
    if (isBloodDraw) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('./data')}
        >
          View Results
        </Button>
      );
    } else if (hasFile) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            downloadFile({
              fileId: order.fileId as string,
            })
          }
          disabled={!order.fileId}
        >
          Download Results
        </Button>
      );
    } else if (isOneOnOne) {
      return (
        <Button variant="outline" className="w-full" disabled>
          Complete
        </Button>
      );
    } else {
      return (
        <Button variant="outline" className="w-full" disabled>
          Pending
        </Button>
      );
    }
  };

  // const submitFile = async (file: SuperpowerFile): Promise<void> => {
  //   await superpower.post(`orders/${order.id}/complete`, {
  //     fileId: file.id,
  //   });
  //   await queryClient.invalidateQueries({ queryKey: ['orders'] });
  // };

  return (
    <Card>
      <div className="flex items-center space-x-2 p-5 md:h-36 md:justify-center md:p-10">
        {isLoading ? (
          <Skeleton className="h-16 min-w-16 rounded-lg" />
        ) : (
          <img
            src={healthcareService?.image}
            className="size-16 rounded-lg border border-zinc-200 object-cover object-center"
            alt={order.name}
          />
        )}
        <div className="flex flex-col">
          <h2 className="line-clamp-1 text-primary lg:text-base">
            {order.name}
          </h2>
          <span className="text-zinc-400 md:text-sm">
            <TimestampDisplay
              timestamp={new Date(order.timestamp)}
              timezone={order.timezone}
            />
          </span>
        </div>
      </div>
      <hr />
      <div className="w-full space-y-2 p-5">
        {isAdmin && (
          <FileUpload
            onChange={(files) => {
              createFile({ data: { file: files[0] } });
            }}
          >
            <Button className="w-full">Upload file</Button>
          </FileUpload>
        )}
        {renderButton()}
      </div>
    </Card>
  );
}
