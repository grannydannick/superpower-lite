import { m } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { H2, Body1, H4 } from '@/components/ui/typography';
import {
  WhyItMattersDialog,
  CitationsDialog,
} from '@/features/protocol/components/dialogs';
import { ProtocolIndexNumber } from '@/features/protocol/components/protocol-index-number';
import { ProtocolListingButton } from '@/features/protocol/components/protocol-listing-button';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { useGender } from '@/hooks/use-gender';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';
import { SymptomsCarousel } from '../../../symptoms-carousel';

import { BiomarkerCausesDialog } from './biomarker-causes-dialog';

interface GoalDetailStepProps {
  goalIndex: number;
}

export const GoalDetailStep = ({ goalIndex }: GoalDetailStepProps) => {
  const { next, getGoal, getGoalBiomarkers } = useProtocolStepperContext();
  const { gender } = useGender();
  const goal = getGoal(goalIndex);
  const resolvedBiomarkers = getGoalBiomarkers(goalIndex);

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  // Get citations from all actions (primary + additional)
  const citations = useMemo(() => {
    const primary = goal?.primaryAction.citations ?? [];
    const additional = (goal?.additionalActions ?? []).flatMap(
      (a) => a.citations ?? [],
    );
    return [...primary, ...additional];
  }, [goal?.primaryAction.citations, goal?.additionalActions]);

  if (!goal) {
    return null;
  }

  return (
    <ProtocolStepLayout className="gap-6">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <ProtocolIndexNumber
            index={goalIndex}
            className="text-5xl md:text-6xl"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <H2 className="md:text-2xl md:leading-tight">{goal.title}</H2>
          {goal.recoveryTime && (
            <Body1 className="text-sm text-secondary">
              {goal.recoveryTime}
            </Body1>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <H4 className="mb-0.5 text-lg">What we found</H4>
          <Body1 className="leading-relaxed text-secondary">
            {goal.description}
          </Body1>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <H4 className="mb-0.5 text-lg">How you might be feeling</H4>
          <SymptomsCarousel symptoms={goal.possibleSymptoms} />
        </m.div>

        <div className="space-y-2">
          {goal.biomarkers.length > 0 && (
            <BiomarkerCausesDialog
              biomarkers={resolvedBiomarkers}
              observationCount={goal.biomarkers.length}
              isLoading={resolvedBiomarkers.length === 0}
            >
              <ProtocolListingButton delay={0.4}>
                <div>
                  <H4 className="text-base">Your biomarkers</H4>
                  <Body1 className="text-sm text-secondary">
                    {resolvedBiomarkers.length > 0
                      ? `${resolvedBiomarkers.length} biomarkers linked to this`
                      : `${goal.biomarkers.length} biomarkers linked to this`}
                  </Body1>
                </div>
                <img
                  src="/protocol/goals/chart.webp"
                  alt="Biomarker chart"
                  className="h-20 w-32 object-contain"
                />
              </ProtocolListingButton>
            </BiomarkerCausesDialog>
          )}

          <WhyItMattersDialog
            goalTitle={goal.title}
            impactContent={goal.impactContent}
          >
            <ProtocolListingButton delay={0.6}>
              <div>
                <H4 className="text-base">Why this matters</H4>
                <Body1 className="text-sm text-secondary">
                  How this impacts your health
                </Body1>
              </div>
              <img
                src={`/protocol/twins/${gender === 'female' ? 'female' : 'male'}-twin-neutral.png`}
                alt="Impact visualization"
                className="my-4 size-16 object-cover"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              />
            </ProtocolListingButton>
          </WhyItMattersDialog>

          {citations.length > 0 && (
            <CitationsDialog citations={citations}>
              <ProtocolListingButton delay={0.8} compact className="py-2">
                <Body1 className="text-sm text-secondary">
                  {citations.length} Citations
                </Body1>
                <img
                  src="/protocol/what-we-do/protocols.webp"
                  alt="Research protocols"
                  className="h-10 w-14 object-contain"
                />
              </ProtocolListingButton>
            </CitationsDialog>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button className="w-full" onClick={handleNext}>
          How to fix this?
        </Button>
      </div>
    </ProtocolStepLayout>
  );
};
