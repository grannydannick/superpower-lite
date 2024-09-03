import React from 'react';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  StepItem,
  StepperStoreProvider,
  useStepper,
} from '@/components/ui/stepper';
import { CancelMembership } from '@/features/settings/components/membership/cancel-membership';
import { BenefitsStep } from '@/features/settings/components/membership/steps/benefits';
import { ConfirmationStep } from '@/features/settings/components/membership/steps/confirmation';
import { GotItStep } from '@/features/settings/components/membership/steps/got-it';
import { Subscription } from '@/types/api';

interface CancelMembershipDialogProps {
  children: JSX.Element;
  membership?: Subscription;
}

export const CancelMembershipDialog = ({
  children,
  membership,
}: CancelMembershipDialogProps): JSX.Element => {
  const CANCEL_STEPS: StepItem[] = [
    { content: <BenefitsStep />, id: 'benefits' },
    { content: <ConfirmationStep />, id: 'confirmation' },
    { content: <GotItStep />, id: 'gotit' },
  ];

  return (
    <StepperStoreProvider steps={CANCEL_STEPS}>
      <CancelDialog membership={membership}>{children}</CancelDialog>
    </StepperStoreProvider>
  );
};

const CancelDialog = ({
  children,
  membership,
}: CancelMembershipDialogProps): JSX.Element => {
  const { resetSteps } = useStepper((s) => s);
  return (
    <Dialog onOpenChange={resetSteps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {membership && <CancelMembership subscription={membership} />}
    </Dialog>
  );
};
