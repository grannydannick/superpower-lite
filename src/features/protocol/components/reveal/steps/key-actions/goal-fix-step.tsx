import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { H2, H4 } from '@/components/ui/typography';
import { CommitActionButton } from '@/features/protocol/components/commit-action-button';
import { AdditionalContentDialog } from '@/features/protocol/components/dialogs';
import { ProtocolMarkdown } from '@/features/protocol/components/protocol-markdown';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import {
  ACTION_TYPE_FALLBACK_IMAGE,
  getActionTypeImage,
} from '@/features/protocol/const/protocol-constants';
import { useSupplementProductLookup } from '@/features/protocol/hooks/use-supplement-product-lookup';
import { useRevealBuilderStore } from '@/features/protocol/stores/reveal-builder-store';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

interface GoalFixStepProps {
  goalIndex: number;
}

export const GoalFixStep = ({ goalIndex }: GoalFixStepProps) => {
  const { next, getGoal } = useProtocolStepperContext();
  const getSupplementProduct = useSupplementProductLookup();
  const { committedActions } = useRevealBuilderStore();
  const goal = getGoal(goalIndex);
  const isPrimaryActionAdded = goal
    ? goal.primaryAction.id in committedActions
    : false;

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  const citations = useMemo(() => {
    return goal?.primaryAction.citations ?? [];
  }, [goal?.primaryAction.citations]);

  if (!goal) {
    return null;
  }

  const { primaryAction } = goal;
  const actionTitle =
    goal.titleCopyVariations?.keyActionTitle ?? `How to fix ${goal.title}`;
  const actionImage = getActionTypeImage(primaryAction.content);

  const whyContent =
    primaryAction.content.type === 'supplement'
      ? primaryAction.content.why
      : primaryAction.description;
  const lookOutForContent =
    primaryAction.content.type === 'supplement'
      ? primaryAction.content.lookOutFor
      : null;
  const supplementProduct =
    primaryAction.content.type === 'supplement'
      ? getSupplementProduct(primaryAction.content.productId)
      : null;

  return (
    <ProtocolStepLayout className="w-full items-start gap-4">
      <div className="space-y-2">
        <Badge variant="secondary" className="gap-2 bg-zinc-100 pr-4">
          <IconSparkle className="size-4 text-vermillion-900" />
          <span className="text-sm text-secondary">Key Action</span>
        </Badge>
        <H2 className="mb-4 text-2xl">{actionTitle}</H2>
      </div>

      <div className="w-full space-y-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-zinc-200 bg-white p-4"
        >
          <div className="mb-4 flex items-center gap-3">
            <img
              src={actionImage}
              alt={primaryAction.title}
              className="size-10 rounded-lg object-contain"
              onError={(e) => {
                e.currentTarget.src = ACTION_TYPE_FALLBACK_IMAGE;
              }}
            />
            <H4 className="flex-1 text-base">{primaryAction.title}</H4>
          </div>

          <div className="media-organic-reveal mb-4 flex justify-center">
            <img
              src={actionImage}
              alt={primaryAction.title}
              className="h-56 w-full object-cover object-top rounded-mask"
              onError={(e) => {
                e.currentTarget.src = ACTION_TYPE_FALLBACK_IMAGE;
              }}
            />
          </div>

          <ProtocolMarkdown
            content={primaryAction.description}
            className="text-sm text-secondary [&>div]:mb-0"
          />

          <div className="mt-4 flex items-center justify-between">
            <AdditionalContentDialog
              actionTitle={primaryAction.title}
              actionImage={actionImage}
              whyContent={whyContent}
              lookOutForContent={lookOutForContent}
              additionalContent={primaryAction.additionalContent}
              supplementProduct={supplementProduct}
              citations={citations}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-secondary transition-colors hover:text-zinc-700"
              >
                Learn more
                <ChevronRight className="size-4" />
              </button>
            </AdditionalContentDialog>

            <CommitActionButton action={primaryAction} goalId={goal.id} />
          </div>
        </m.div>
      </div>

      <Button className="w-full" onClick={handleNext}>
        {isPrimaryActionAdded ? 'Continue' : 'Skip'}
      </Button>
    </ProtocolStepLayout>
  );
};
