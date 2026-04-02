// src/features/onboarding-circle/components/source-detail-modal.tsx

import { useNavigate } from '@tanstack/react-router';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

import type { SourceConfig } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

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

export function SourceDetailModal({
  source,
  open,
  onOpenChange,
}: SourceDetailModalProps) {
  const navigate = useNavigate();
  const complete = useOnboardingCircleStore((s) => s.complete);

  if (source == null) return null;

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
        {/* Drag bar */}
        <div className="mx-auto mt-3.5 h-1 w-10 rounded-full bg-zinc-200" />

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-[1.6rem]"
              style={{ background: source.colorBg }}
            >
              {source.icon}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">
                {source.id === 'wearables'
                  ? 'Connect Wearables'
                  : source.id === 'ai-context'
                    ? 'Import AI Context'
                    : source.id === 'labs'
                      ? 'Upload Previous Labs'
                      : 'Health Intake'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-zinc-400">
                {source.timeEstimate
                  ? `Takes about ${source.timeEstimate}`
                  : 'Pre-filled from checkout'}
              </p>
            </div>
          </div>

          {/* Why this is valuable */}
          <p className="mb-6 text-sm leading-relaxed text-zinc-500">
            {source.modal.whyValuable}
          </p>

          {/* What to do */}
          <div className="mb-6 rounded-xl bg-zinc-50 p-4">
            <h5 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
              What to do
            </h5>
            <p className="text-[13px] leading-relaxed text-zinc-600">
              {source.modal.whatToDo}
            </p>
          </div>

          {/* What you'll get */}
          <div className="mb-7 flex flex-col gap-3.5">
            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              What you'll unlock
            </h5>
            {source.modal.benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm">
                  {benefit.icon}
                </div>
                <div>
                  <h5 className="text-[13px] font-semibold text-zinc-900">
                    {benefit.title}
                  </h5>
                  <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {source.ctaAction.type !== 'none' && (
            <button
              type="button"
              onClick={handleCta}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              {source.ctaLabel}
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
