import { ReactNode, useMemo } from 'react';

import { HealthGradeComponent } from '@/components/ui/health-grade';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { ServiceActivity } from '@/features/plans/components/activities/plan-activity';
import { useBiomarkerCategoriesWithUpsells } from '@/features/plans/hooks/use-biomarker-categories-with-upsells';
import { useLatestHealthScore } from '@/features/plans/hooks/use-latest-health-score';
import { cn } from '@/lib/utils';
import { BiomarkerComponent } from '@/types/api';

import { COMPONENT_DESCRIPTIONS } from './component-descriptions';

export const BlockGroupComponent = ({
  className,
  children,
  component,
}: {
  className?: string;
  children?: ReactNode;
  component: BiomarkerComponent;
}) => {
  const { title, value } = component;

  const { description, hasCustomDescription } = useMemo(() => {
    const componentDescription =
      COMPONENT_DESCRIPTIONS[title as keyof typeof COMPONENT_DESCRIPTIONS];
    if (
      componentDescription &&
      value in componentDescription &&
      componentDescription[value as keyof typeof componentDescription]
    ) {
      return {
        description:
          componentDescription[value as keyof typeof componentDescription],
        hasCustomDescription: true,
      };
    }

    let defaultDescription = '';
    switch (value) {
      case 'A':
        defaultDescription = 'good';
        break;
      case 'B':
        defaultDescription = 'normal';
        break;
      default:
        defaultDescription = 'out of range';
    }

    return {
      description: defaultDescription,
      hasCustomDescription: false,
    };
  }, [value, title]);

  if (value === '-') {
    return null;
  }

  return (
    <div className={cn('health-grade-card p-5', className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HealthGradeComponent grade={component.value} />
            <Body1>{component.title}</Body1>
          </div>
        </div>
        {hasCustomDescription ? (
          <Body2 className="text-zinc-500">{description}</Body2>
        ) : (
          <Body2 className="text-zinc-500">
            Your {title} is {description} based on our records.
          </Body2>
        )}
        {children}
      </div>
    </div>
  );
};

const BiomarkerBlocks = ({
  biomarkers,
  prefix,
}: {
  biomarkers: BiomarkerComponent[];
  prefix: string;
}) => {
  return biomarkers.map((bc, groupIndex) => (
    <BlockGroupComponent
      key={`${prefix}-${groupIndex}`}
      component={bc}
      className="border-b border-zinc-200"
    />
  ));
};

export const PhilosophyBlocks = ({ className }: { className?: string }) => {
  const {
    latestScore,
    healthGrades,
    isLoading: isHealthScoreLoading,
  } = useLatestHealthScore();

  const {
    environmentalBiomarkers,
    nutritionBiomarkers,
    environmentalService,
    nutritionService,
    isLoading: biomarkerCategoriesLoading,
  } = useBiomarkerCategoriesWithUpsells(latestScore?.component ?? []);

  if (isHealthScoreLoading || biomarkerCategoriesLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!latestScore) {
    return null;
  }

  return (
    <section className={cn('flex flex-col', className)}>
      <div className="flex w-full flex-col gap-1">
        <div className="mt-8 flex flex-col gap-2">
          <H4>Overview</H4>
          <Body1>
            We have processed 100+ biomarkers to provide you with this
            comprehensive report.
          </Body1>
        </div>
        <BiomarkerBlocks biomarkers={healthGrades} prefix="health" />
        <BiomarkerBlocks
          biomarkers={environmentalBiomarkers.validBiomarkers}
          prefix="environmental"
        />
        <BiomarkerBlocks
          biomarkers={nutritionBiomarkers.validBiomarkers}
          prefix="nutrition"
        />
        {environmentalService && environmentalBiomarkers.hasNulls && (
          <ServiceActivity service={environmentalService} />
        )}
        {nutritionService && nutritionBiomarkers.hasNulls && (
          <ServiceActivity service={nutritionService} />
        )}
      </div>
    </section>
  );
};
