import { X } from 'lucide-react';
import { useState } from 'react';

import { ContentLayout } from '@/components/layouts';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Body1, Body3, H2 } from '@/components/ui/typography';
import { MemberRedraw } from '@/features/redraw/api/get-redraws';

import { RedrawPreparationDialog } from './redraw-preparation-dialog';

type RedrawOverviewPageProps = {
  redraw: Pick<MemberRedraw, 'serviceRequestId' | 'missingBiomarkers'>;
  onConfirmSkip?: () => Promise<void> | void;
  isSkipPending?: boolean;
  onContinue?: () => void;
};

export const RedrawOverviewPage = ({
  redraw,
  onConfirmSkip = async () => undefined,
  isSkipPending = false,
  onContinue = () => undefined,
}: RedrawOverviewPageProps) => {
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);
  const [hasAcknowledgedSkip, setHasAcknowledgedSkip] = useState(false);
  const [isPreparationDialogOpen, setIsPreparationDialogOpen] = useState(false);
  const missingBiomarkers =
    redraw.missingBiomarkers.length > 0 ? redraw.missingBiomarkers : ['N/A'];

  const handleSkipDialogOpenChange = (open: boolean) => {
    setIsSkipDialogOpen(open);

    if (!open) {
      setHasAcknowledgedSkip(false);
    }
  };

  const handleConfirmSkip = async () => {
    await onConfirmSkip();
    handleSkipDialogOpenChange(false);
  };

  return (
    <ContentLayout
      title="Recollection"
      className="max-w-[1120px] space-y-6 md:space-y-8"
    >
      <div className="space-y-6">
        <Header title="Free redraw available" className="items-start" />

        <section className="rounded-[28px] border border-zinc-200 bg-white px-7 py-6 md:px-8 md:py-7">
          <div className="space-y-6">
            <Body1 className="max-w-[880px] text-secondary">
              Our partner lab couldn&apos;t process these tests from your recent
              panel:
            </Body1>

            <div
              className="rounded-[24px] bg-zinc-50 p-5"
              data-testid="main-biomarker-card"
            >
              <div
                className="flex items-center gap-4 sm:gap-5"
                data-testid="missing-biomarkers-row"
              >
                <BloodDropIcon />

                <ul className="list-disc space-y-1 pl-5 text-base leading-7 text-zinc-700 marker:text-zinc-500">
                  {missingBiomarkers.map((biomarker) => (
                    <li key={biomarker}>{biomarker}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4" data-testid="main-copy-stack">
              <Body1 className="max-w-[920px] text-secondary">
                You&apos;re eligible for a free redraw, which requires a new
                appointment.
              </Body1>

              <div className="space-y-4">
                <Body1 className="max-w-[920px] text-secondary">
                  If you&apos;d prefer to skip this redraw, we&apos;ll release
                  your available results and personalized protocol to your
                  dashboard.
                </Body1>
                <Body3 className="max-w-[920px] pt-[18px] text-zinc-400">
                  Note: once skipped, the free redraw for this panel is no
                  longer available.
                </Body3>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <Button
            type="button"
            variant="outline"
            className="h-16 rounded-[20px] text-base text-zinc-900"
            onClick={() => handleSkipDialogOpenChange(true)}
          >
            Skip redraw
          </Button>
          <Button
            type="button"
            className="h-16 rounded-[20px] text-base"
            onClick={() => {
              setIsPreparationDialogOpen(true);
            }}
          >
            Continue to book
          </Button>
        </div>
      </div>

      <Dialog open={isSkipDialogOpen} onOpenChange={handleSkipDialogOpenChange}>
        <DialogContent className="w-full max-w-[592px] gap-0 rounded-[32px] px-8 pb-8 pt-10 sm:px-10">
          <DialogTitle className="sr-only">Skip free redraw</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm that you want to skip the free redraw for your missing
            tests.
          </DialogDescription>

          <div className="absolute right-6 top-6">
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-sm p-1 text-zinc-400 transition-colors hover:text-zinc-600"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </DialogClose>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 pr-10">
              <H2>Skip free redraw?</H2>
            </div>

            <Body1 className="text-secondary">
              These tests from your recent panel couldn&apos;t be processed:
            </Body1>

            <div
              className="rounded-[24px] bg-zinc-50 p-5"
              data-testid="skip-dialog-biomarker-card"
            >
              <div
                className="flex items-center gap-4"
                data-testid="skip-dialog-details"
              >
                <BloodDropIcon />
                <div className="space-y-4">
                  <ul className="list-disc space-y-1 pl-5 text-base leading-7 text-zinc-700 marker:text-zinc-500">
                    {missingBiomarkers.map((biomarker) => (
                      <li key={`skip-${biomarker}`}>{biomarker}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Body1 className="text-secondary">
              If you skip, the free redraw for these tests expires and your
              remaining results will be released to your dashboard within the
              next few hours.
              <span className="block pt-4">
                We&apos;ll let you know when they&apos;re ready.
              </span>
            </Body1>

            <div
              className="flex items-center gap-4"
              data-testid="skip-dialog-checkbox-row"
              role="presentation"
              onClick={() => {
                setHasAcknowledgedSkip((current) => !current);
              }}
            >
              <AnimatedCheckbox
                checked={hasAcknowledgedSkip}
                onCheckedChange={(checked) => {
                  setHasAcknowledgedSkip(checked === true);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="size-5 border border-zinc-200 bg-white data-[state='checked']:border-transparent"
                aria-label="I understand I'm skipping the free redraw for these tests"
              />
              <span className="cursor-pointer text-sm leading-5 text-zinc-500">
                I understand I&apos;m skipping the free redraw for these tests
              </span>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="h-14 min-w-[120px] rounded-[16px] text-base"
                disabled={!hasAcknowledgedSkip || isSkipPending}
                onClick={() => {
                  void handleConfirmSkip();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RedrawPreparationDialog
        open={isPreparationDialogOpen}
        onOpenChange={setIsPreparationDialogOpen}
        onContinue={() => {
          setIsPreparationDialogOpen(false);
          onContinue();
        }}
      />
    </ContentLayout>
  );
};

function BloodDropIcon() {
  return (
    <svg
      viewBox="0 0 36 36"
      className="h-9 w-9 shrink-0"
      aria-hidden="true"
      data-testid="blood-drop-icon"
    >
      <circle cx="18" cy="18" r="14" fill="#FBE9E3" />
      <path
        data-testid="blood-drop-shape"
        fill="#FF5A2A"
        d="M18 11.8C18.8 11.8 20.9 14.4 21.6 15.8C22.3 17.3 22.8 18.9 22.8 20.3C22.8 23.3 20.7 25.2 18 25.2C15.3 25.2 13.2 23.3 13.2 20.3C13.2 18.9 13.7 17.3 14.4 15.8C15.1 14.4 17.2 11.8 18 11.8Z"
      />
    </svg>
  );
}
