import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Body2, Body3, H4 } from '@/components/ui/typography';

import type { SourceConfig } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { getSourceIcon } from './source-row';

interface SourceDetailModalProps {
  source: SourceConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOAST_MESSAGES: Record<string, string> = {
  intake: 'Intake complete \u2014 focus areas identified',
  wearables: 'Wearables connected \u2014 recovery insights ready',
  'ai-context': 'AI context imported \u2014 3 health themes found',
  labs: 'Labs uploaded \u2014 historical trends generated',
};

export function SourceDetailModal({ source, open, onOpenChange }: SourceDetailModalProps) {
  const navigate = useNavigate();
  const complete = useOnboardingCircleStore((s) => s.complete);

  if (source == null) return null;

  const Icon = getSourceIcon(source.iconName);

  const handleCta = () => {
    complete(source.id);
    onOpenChange(false);
    toast(TOAST_MESSAGES[source.id] ?? 'Step complete');

    if (source.ctaAction.type === 'navigate') {
      void navigate({
        to: source.ctaAction.to,
        search: source.ctaAction.search,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0" preventCloseAutoFocus>
        <div className="mx-auto mt-3.5 h-1 w-10 rounded-full bg-zinc-200" />

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: `${source.color}12` }}
            >
              <Icon size={24} style={{ color: source.color }} />
            </div>
            <div>
              <DialogTitle asChild>
                <H4 className="text-zinc-900">{source.title}</H4>
              </DialogTitle>
              <Body3 className="p-0 text-zinc-400">
                {source.timeEstimate
                  ? `Takes about ${source.timeEstimate}`
                  : 'Pre-filled from checkout'}
              </Body3>
            </div>
          </div>

          {/* Why this is valuable */}
          <Body2 className="mb-6 p-0 text-zinc-500">{source.modal.whyValuable}</Body2>

          {/* What to do */}
          <div className="mb-6 rounded-xl bg-zinc-50 p-4">
            <Body3 className="mb-1 p-0 font-bold uppercase tracking-widest text-zinc-400">
              What to do
            </Body3>
            <Body3 className="p-0 leading-relaxed text-zinc-600">
              {source.modal.whatToDo}
            </Body3>
          </div>

          {/* Benefits */}
          <div className="mb-7 flex flex-col gap-3.5">
            <Body3 className="p-0 font-bold uppercase tracking-widest text-zinc-400">
              What you'll unlock
            </Body3>
            {source.modal.benefits.map((benefit) => {
              const BenefitIcon = getSourceIcon(benefit.iconName);
              return (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <BenefitIcon size={14} className="text-zinc-500" />
                  </div>
                  <div>
                    <Body3 className="p-0 font-semibold text-zinc-900">{benefit.title}</Body3>
                    <Body3 className="mt-0.5 p-0 text-zinc-500">{benefit.description}</Body3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          {source.ctaAction.type !== 'none' && (
            <Button onClick={handleCta} className="w-full">
              {source.ctaLabel} <span className="ml-1">{'\u2192'}</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
