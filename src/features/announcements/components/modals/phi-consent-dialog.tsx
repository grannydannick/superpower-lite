import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Body1, H3 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { ConsentType } from '@/types/api';

import { useCreateConsent } from '../../api';
import { useNeedsPhiMarketingConsent } from '../../hooks/use-needs-phi-marketing-consent';

const SIZE = 10;
const OFFSET = 12;
const MAX_NAME_LENGTH = 8;

type PhiConsentDialogProps = {
  onFinished?: () => void;
};

export const PhiConsentDialog = ({ onFinished }: PhiConsentDialogProps) => {
  const { data } = useUser();

  const [_open, _setOpen] = useState(false);
  const { needsConsent: shouldShow } = useNeedsPhiMarketingConsent();
  useEffect(() => {
    _setOpen(shouldShow);
  }, [shouldShow]);

  const createConsentMutation = useCreateConsent({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Preferences saved');
        _setOpen(false);
      },
      onError: () => {
        toast.error('Failed to save preferences');
      },
    },
  });

  const handleAgree = async () => {
    await createConsentMutation.mutateAsync({
      data: {
        agreedAt: new Date().toISOString(),
        type: ConsentType.PHI_MARKETING,
        accepted: true,
      },
    });
    onFinished?.();
  };

  const handleClose = async () => {
    // Create consent with accepted = false
    await createConsentMutation.mutateAsync({
      data: {
        agreedAt: new Date().toISOString(),
        type: ConsentType.PHI_MARKETING,
        accepted: false,
      },
    });
    _setOpen(false);
    onFinished?.();
  };

  return (
    <Dialog open={_open} onOpenChange={_setOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] space-y-8 px-8 pb-4 pt-12 sm:max-w-md">
        <div
          className="relative mx-auto h-40 w-full"
          style={{
            perspective: '500px',
            perspectiveOrigin: '50% calc(50% - 150px)',
          }}
        >
          <div
            className="absolute left-1/2 top-[68px] z-10"
            style={{ transformStyle: 'preserve-3d' as const }}
          >
            {data?.firstName && (
              <div className="[transform-style:preserve-3d]">
                {Array.from({ length: 24 }, (_, i) => {
                  const baseWidth = 32;
                  const radius = 120;
                  const height = 72;
                  const angle = (360 / 24) * i;
                  const left = OFFSET - baseWidth * i;
                  const panelWidth = Math.max(
                    6,
                    Math.round(baseWidth * (1 - i / 24)),
                  );
                  const name =
                    data?.firstName?.slice(0, MAX_NAME_LENGTH) +
                    (data?.firstName?.length > MAX_NAME_LENGTH ? '…' : '');

                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                        width: `${panelWidth}px`,
                        height: `${height}px`,
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        className="absolute top-1/2 -translate-y-1/2 bg-gradient-to-t from-white/50 to-white bg-clip-text font-medium leading-none tracking-tight text-transparent"
                        style={{
                          left: `${left}px`,
                          width: 'max-content',
                          fontSize: `${SIZE}px`,
                          transformOrigin: '50% 50%',
                          display: 'inline-block',
                        }}
                      >
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <img
            src="/action-plan/superpower-bottle.webp"
            alt="Superpower Pill Bottle"
            className="size-full object-contain"
          />
        </div>
        <div className="space-y-6">
          <div className="mx-auto max-w-sm space-y-2">
            <H3 className="text-center">Get personalized guidance</H3>
            <Body1 className="text-center text-secondary">
              Receive personalized offers & reminders based on your Action Plan
              & Lab results. Superpower will use your health data for this. Opt
              out anytime.
            </Body1>
          </div>
          <div className="flex flex-col justify-center">
            <Button
              onClick={handleAgree}
              variant="default"
              className="rounded-full text-center"
            >
              I agree
            </Button>
            <Button
              variant="ghost"
              className="text-center"
              onClick={handleClose}
            >
              No, thank you
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
