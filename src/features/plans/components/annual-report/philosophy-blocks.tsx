import { ArrowUpRight } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { HealthGradeComponent } from '@/components/ui/health-grade';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { ServiceActivity } from '@/features/plans/components/activities/plan-activity';
import { useBiomarkerCategoriesWithUpsells } from '@/features/plans/hooks/use-biomarker-categories-with-upsells';
import { useLatestHealthScore } from '@/features/plans/hooks/use-latest-health-score';
import { cn } from '@/lib/utils';
import { BiomarkerComponent } from '@/types/api';

export const BlockGroupComponent = ({
  className,
  children,
  component,
}: {
  className?: string;
  children?: ReactNode;
  component: BiomarkerComponent;
}) => {
  const navigate = useNavigate();

  const { title, value } = component;

  const description = useMemo(() => {
    if (value === '-') return '';
    if (value === 'A') return 'good';
    if (value === 'B') return 'normal';
    return 'out of range';
  }, [value]);

  return (
    <div className={cn('health-grade-card p-5', className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HealthGradeComponent grade={component.value} />
            <Body1>{component.title}</Body1>
          </div>
          {component.value === '-' ? (
            <Badge
              className="cursor-pointer gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-zinc-400"
              onClick={() => navigate('/services')}
            >
              <Body2 className="text-zinc-500">Get a score</Body2>
              <ArrowUpRight width={16} height={16} />
            </Badge>
          ) : null}
        </div>
        {component.value !== '-' ? (
          <Body2 className="max-w-[221px] text-zinc-500">
            Your {title} is {description} based on our records.
          </Body2>
        ) : null}
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
