import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useIdentityVerification } from '@/hooks/use-identity-verification';

export const IdentityVerificationButton = ({
  buttonCopy,
}: {
  buttonCopy?: string;
}) => {
  const { needsVerification, verificationMutation } = useIdentityVerification();

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await verificationMutation.mutateAsync();
  };

  if (!needsVerification) {
    return null;
  }

  return (
    <Button
      onClick={handleVerify}
      className="w-full"
      disabled={verificationMutation.isPending}
    >
      {verificationMutation.isPending ? (
        <Spinner />
      ) : (
        buttonCopy || 'Verify Identity'
      )}
    </Button>
  );
};
