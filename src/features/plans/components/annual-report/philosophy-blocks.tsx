import { ArrowUpRight } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { HealthGradeComponent } from '@/components/ui/health-grade';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2 } from '@/components/ui/typography';
import {
  ENVIRONMENTAL_TOXINS,
  HEALTH_OPTIMIZATION,
  LOOK_AND_FEEL,
  NUTRITION_AND_GUT,
} from '@/const/health-score';
import { useBiomarkers } from '@/features/biomarkers/api';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { BlockAccordion } from '@/features/plans/components/annual-report/block-accordion';
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
        <div className=" flex items-center gap-4">
          <HealthGradeComponent grade={component.value} />
          <Body1>{component.title}</Body1>
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

export const PhilosophyBlocks = ({ className }: { className?: string }) => {
  const getBiomarkersQuery = useBiomarkers();
  if (getBiomarkersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!getBiomarkersQuery.data) {
    return null;
  }

  const healthScore = getBiomarkersQuery.data.biomarkers.find(
    (b) => b.name == 'Health Score',
  );

  if (!healthScore) {
    return null;
  }

  const latestScore = mostRecent(healthScore.value);

  const healthGrades =
    latestScore?.component.filter((c) => c.category === HEALTH_OPTIMIZATION) ??
    [];
  const environmentalGrades =
    latestScore?.component.filter((c) => c.category === ENVIRONMENTAL_TOXINS) ??
    [];
  const nutritionGrades =
    latestScore?.component.filter((c) => c.category === NUTRITION_AND_GUT) ??
    [];
  const lookAndFeelGrades =
    latestScore?.component.filter((c) => c.category === LOOK_AND_FEEL) ?? [];

  return (
    <section
      className={cn('flex flex-col items-center justify-center', className)}
    >
      <div className="flex w-full flex-col items-center gap-1">
        <BlockAccordion title={HEALTH_OPTIMIZATION}>
          {healthGrades.map((bc, groupIndex) => {
            // const biomarkers = group.blockGroupItem.filter(
            //   (item) => item.type === 'BIOMARKER',
            // );

            return (
              <BlockGroupComponent
                key={groupIndex}
                component={bc}
                className={cn(
                  {
                    'border-none': groupIndex === healthGrades.length - 1,
                  },
                  'border-b border-zinc-200',
                )}
              ></BlockGroupComponent>
            );
          })}
        </BlockAccordion>
        <BlockAccordion title={ENVIRONMENTAL_TOXINS}>
          {environmentalGrades.map((bc, groupIndex) => {
            // const biomarkers = group.blockGroupItem.filter(
            //   (item) => item.type === 'BIOMARKER',
            // );

            return (
              <BlockGroupComponent
                key={groupIndex}
                component={bc}
                className={cn(
                  {
                    'border-none': groupIndex === healthGrades.length - 1,
                  },
                  'border-b border-zinc-200',
                )}
              ></BlockGroupComponent>
            );
          })}
        </BlockAccordion>
        <BlockAccordion title={NUTRITION_AND_GUT}>
          {nutritionGrades.map((bc, groupIndex) => {
            // const biomarkers = group.blockGroupItem.filter(
            //   (item) => item.type === 'BIOMARKER',
            // );

            return (
              <BlockGroupComponent
                key={groupIndex}
                component={bc}
                className={cn(
                  {
                    'border-none': groupIndex === healthGrades.length - 1,
                  },
                  'border-b border-zinc-200',
                )}
              ></BlockGroupComponent>
            );
          })}
        </BlockAccordion>
        <BlockAccordion title={LOOK_AND_FEEL}>
          {lookAndFeelGrades.map((bc, groupIndex) => {
            // const biomarkers = group.blockGroupItem.filter(
            //   (item) => item.type === 'BIOMARKER',
            // );

            return (
              <BlockGroupComponent
                key={groupIndex}
                component={bc}
                className={cn(
                  {
                    'border-none': groupIndex === healthGrades.length - 1,
                  },
                  'border-b border-zinc-200',
                )}
              ></BlockGroupComponent>
            );
          })}
        </BlockAccordion>
      </div>
    </section>
  );
};
