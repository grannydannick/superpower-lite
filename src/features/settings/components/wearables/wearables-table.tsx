import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  getWearablesQueryOptions,
  useWearables,
} from '@/features/settings/api/get-wearables';
import { MembershipBenefits } from '@/features/settings/components/membership/membership-benefits';
import { columns } from '@/features/settings/components/wearables/desktop/columns';
import { DataTable } from '@/features/settings/components/wearables/desktop/data-table';
import { WearablesMobile } from '@/features/settings/components/wearables/wearables-mobile';
import { WEARABLES } from '@/features/settings/const/wearables-benefits';

import { VitalLinkButton } from '../vital-button';

export function WearablesTable() {
  const { data, isLoading } = useWearables();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!data) return <></>;

  const { wearables } = data;

  if (!wearables) return <></>;

  return (
    <>
      {wearables.length > 0 && (
        <>
          {/*Desktop*/}
          <DataTable columns={columns} data={wearables} />
          {/*Mobile*/}
          <WearablesMobile wearables={wearables} />
        </>
      )}

      {wearables.length === 0 && <IntegrationsTableEmpty />}
    </>
  );
}

function IntegrationsTableEmpty(): JSX.Element {
  const queryClient = useQueryClient();

  return (
    <Card className="mt-10 md:mx-0 lg:mt-0">
      <section
        id="membership-benefits"
        className="space-y-8 px-6 py-8 md:px-14 md:py-12"
      >
        <div className="space-y-3">
          <h3 className="text-lg">Connect your wearables</h3>
          <p className="max-w-md text-zinc-500">
            Connect your wearable into our ecosystem to get the most
            comprehensive monitor of your health and activity.
          </p>
        </div>
        <MembershipBenefits benefits={WEARABLES} />
        <div className="grid pt-3">
          <VitalLinkButton
            callback={() =>
              queryClient.invalidateQueries({
                queryKey: getWearablesQueryOptions().queryKey,
              })
            }
          >
            Connect
          </VitalLinkButton>
        </div>
      </section>
    </Card>
  );
}
