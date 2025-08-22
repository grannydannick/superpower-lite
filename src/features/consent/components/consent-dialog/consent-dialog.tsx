import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { LabeledCheckbox } from '@/components/shared/labeled-checkbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { LEGAL_DESCLAIMERS, LEGAL_LINKS } from '@/const';
import { useCreateConsent, useGetConsent } from '@/features/consent/api';
import { useUser } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';

interface ConsentDialogProps {
  isOpen?: boolean;
  onSubmit?: () => void;
  children?: ReactNode;
  initialStep?: 0 | 1;
}

export const ConsentDialog = ({
  isOpen,
  onSubmit,
  children,
  initialStep = 0,
}: ConsentDialogProps) => {
  const { pathname } = useLocation();
  const { checkAdminActorAccess } = useAuthorization();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(initialStep);
  const { data: user } = useUser();

  const isControlled = typeof isOpen === 'boolean';
  const open = isControlled ? (isOpen as boolean) : internalOpen;

  const { isLoading, data } = useGetConsent({
    userId: user?.id || '',
  });

  const hasConsent = data?.exists === true;
  const isAdmin = checkAdminActorAccess();

  useEffect(() => {
    if (isControlled) return;
    if (!user) return;
    if (isLoading) return;
    // do not show consent modal for admins
    if (isAdmin) return;

    if (pathname.includes('onboarding')) return; // should always be disabled in onboarding

    if (!hasConsent) setInternalOpen(true);
  }, [isControlled, user, isLoading, hasConsent, isAdmin, pathname]);

  const handleClose = (next: boolean) => {
    if (isControlled) return; // parent controls
    setInternalOpen(next);
  };

  const onConsentSubmit = () => {
    onSubmit?.();
    handleClose(false);
  };

  // if consent exists only return trigger
  if (hasConsent) return children;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="overflow-scroll px-6 pt-6 md:px-14 md:pt-16"
        data-testid="consent-modal"
        preventCloseAutoFocus
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) =>
          // allow test or dev to escape this
          ['test', 'development'].includes(process.env.NODE_ENV as string)
            ? undefined
            : event.preventDefault()
        }
      >
        {step === 0 ? (
          <ConsentNotice onNext={() => setStep(1)} />
        ) : (
          <ConsentConfirmation
            onPrev={() => setStep(0)}
            onSubmit={onConsentSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const ConsentConfirmation = ({
  onPrev,
  onSubmit,
}: {
  onPrev: () => void;
  onSubmit?: () => void;
}) => {
  const [checked, setChecked] = useState(false);
  const createConsentMutation = useCreateConsent({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Consent submitted successfully');
      },
      onError: () => {
        toast.error('Failed to submit consent');
      },
    },
  });

  const onConsentAgreement = async () => {
    await createConsentMutation.mutateAsync({
      data: {
        agreedAt: new Date().toISOString(),
      },
    });
    onSubmit?.();
  };

  return (
    <div>
      <DialogTitle className="mb-6 flex items-start justify-between">
        <H2 className="text-center">Informed Consent</H2>
      </DialogTitle>
      <div className="relative">
        <ScrollArea className="h-52 rounded-2xl border border-zinc-200">
          <div className="p-6">
            <Body2 className="text-zinc-500">{LEGAL_DESCLAIMERS.common}</Body2>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-2xl bg-gradient-to-b from-white" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-2xl bg-gradient-to-t from-white" />
        </ScrollArea>
      </div>

      <div className="flex w-full flex-col space-y-6 py-6 md:space-y-8 md:py-8">
        <LabeledCheckbox
          id="textMessageConsent"
          checked={checked}
          onCheckedChange={(value) => setChecked(value)}
          label="By clicking “I agree”, you acknowledge that you have read, understand and consent to the Informed Medical Consent policy."
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full" onClick={onPrev}>
            Back
          </Button>
          <Button
            className="w-full"
            onClick={onConsentAgreement}
            disabled={createConsentMutation.isPending || !checked}
          >
            {createConsentMutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConsentNotice = ({ onNext }: { onNext: () => void }) => {
  return (
    <div>
      <div className="space-y-4">
        <DialogTitle className="flex items-start justify-between">
          <H2>We&rsquo;ve updated our Legal Documents</H2>
        </DialogTitle>

        <Body1 className="text-left text-zinc-500">
          This includes our Terms of Service, Privacy Policy, Informed Consent
          and Membership Agreement. These changes clarify things like membership
          terms, telehealth consent, and how we keep your data safe.
        </Body1>
        <Body1 className="text-left text-zinc-500">
          You can read the updated versions here:
        </Body1>
        <ul className="space-y-2 pl-4">
          {LEGAL_LINKS.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="flex items-center gap-2 text-vermillion-900"
              >
                <span className="size-1.5 rounded-full bg-zinc-300" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <Body1 className="text-left text-zinc-500">
          The updated Informed Consent document will be provided on the next
          page for you to read through.
        </Body1>
        <Body1 className="text-left text-zinc-500">
          Thanks for being part of Superpower!
        </Body1>
      </div>
      <div className="flex w-full flex-col items-end gap-2 py-6 md:w-auto md:flex-row md:py-8">
        <Button className="w-full" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
