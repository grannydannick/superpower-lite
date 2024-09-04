import { useVitalLink } from '@tryvital/vital-link';
import React, { ReactNode, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { useVitalToken } from '@/shared/api/get-vital-token';

export function VitalLinkButton({
  className,
  callback,
  children,
}: {
  className?: string;
  callback?: () => void;
  children: ReactNode;
}): JSX.Element {
  const { data, refetch } = useVitalToken({});

  const [isLoading, setLoading] = useState(false);

  const onSuccess = useCallback(
    (_metadata: unknown) => {
      // Device is now connected.
      // TODO: If we don't receive webhooks in the short term
      // and use them to allow retrieval and disconnect of
      // devices.
      // Then, we need to use this as a temporary hack.
      console.log(_metadata);

      callback && callback();
    },
    [callback],
  );

  const onExit = useCallback(
    (_metadata: unknown) => {
      // User has quit the link flow.
      console.log(_metadata);
      refetch();
    },
    [refetch],
  );

  const onError = useCallback(
    (_metadata: unknown) => {
      // Error encountered in connecting device.
      console.log(_metadata);
      refetch();
    },
    [refetch],
  );

  const config = {
    onSuccess,
    onExit,
    onError,
    env: env.VITAL_ENV || 'sandbox',
  };

  const { open, ready } = useVitalLink(config);

  const handleVitalOpen = async () => {
    setLoading(true);
    open(data?.linkToken);
    setLoading(false);
  };

  return (
    <Button
      type="button"
      onClick={handleVitalOpen}
      disabled={isLoading || !ready}
      className={className}
    >
      {children}
    </Button>
  );
}
