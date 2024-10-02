import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

import { AnnualReportBiomarkersTable } from '@/features/action-plan/components/biomarkers/annual-report-biomarkers-table';
import { BlockAccordion } from '@/features/action-plan/components/block-accordion';
import { cn } from '@/lib/utils';
import { Block, BlockGroup, BlockGroupItem } from '@/types/api';

export const HealthGradeComponent: ({
  grade,
}: {
  grade: string;
}) => ReactNode = ({ grade }) => {
  const backgroundColor = getHealthGradeColor(grade);
  return (
    <div
      className={`${backgroundColor} flex size-[28px] shrink-0 items-center justify-center rounded-full`}
    >
      <span className="text-sm">{grade}</span>
    </div>
  );
};

const getHealthGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-100';
    case 'B':
      return 'bg-[rgba(232,252,0,0.8)]';
    case 'C':
      return 'bg-[#FF68DE66]';
    case 'D':
      return 'bg-[#FF68DE66]';
    case 'E':
      return 'bg-[#FF68DE66]';
    case 'F':
      return 'bg-[#FF68DE66]';
    default:
      return 'bg-gray-200';
  }
};

const renderItemRefs = (itemRefs: BlockGroupItem['ref']) => {
  if (!itemRefs) return null;
  return (
    <div className="flex h-full justify-end gap-2">
      {itemRefs.map((ref) => {
        if (ref.type === 'TEXT_LINK' || ref.type === 'BUTTON_LINK') {
          return <RefLink key={ref.id} text={ref.text} href={ref.value} />;
        }
        return null;
      })}
    </div>
  );
};

const renderOtherItemComponent = (item: BlockGroupItem) => {
  return (
    <div className="flex h-full flex-col justify-between">
      {renderItemRefs(item.ref)}
    </div>
  );
};

export const BlockGroupComponent = ({
  blockGroup,
  className,
  children,
}: {
  blockGroup: BlockGroup;
  className?: string;
  children?: ReactNode;
}) => {
  let healthGrade: string = blockGroup.score;

  if (healthGrade === 'UNSET') {
    healthGrade = '-';
  }

  return (
    <div className={cn('health-grade-card p-5', className)}>
      <div className="flex gap-4">
        <div className=" flex gap-4">
          <HealthGradeComponent grade={healthGrade} />
          <div className="flex flex-col">
            <p className="text-zinc-900">{blockGroup.name}</p>
            <p className="max-w-[278px] pt-1 text-sm text-zinc-500 md:w-[250px]">
              {blockGroup.description || 'No description available'}
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export const RefLink = ({
  text,
  href,
  className,
}: {
  text: string;
  href: string;
  className?: string;
}) => {
  return (
    <a
      className={cn(
        'inline-flex h-7 w-fit items-center gap-1 rounded-[8px] bg-[#F7F7F7] pl-2 pr-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-200 self-end',
        className,
      )}
      href={href}
    >
      <span className="text-xs text-zinc-500 hover:text-zinc-700">{text}</span>
      <ArrowRight className="size-3 -rotate-45 text-zinc-500 hover:text-zinc-700" />
    </a>
  );
};

export const PhilosophyBlocks = ({
  philosophyBlocks,
  className,
}: {
  philosophyBlocks: Block[];
  className?: string;
}) => {
  return (
    <section
      className={cn('flex flex-col items-center justify-center', className)}
    >
      <div className="flex w-full flex-col items-center gap-1">
        {philosophyBlocks.map((block) => (
          <BlockAccordion key={block.id} block={block}>
            {block.blockGroup.map((group, groupIndex) => {
              const biomarkers = group.blockGroupItem.filter(
                (item) => item.type === 'BIOMARKER',
              );

              return (
                <BlockGroupComponent
                  key={groupIndex}
                  blockGroup={group}
                  className={cn(
                    {
                      'border-none': groupIndex === block.blockGroup.length - 1,
                    },
                    'border-b border-zinc-200',
                  )}
                >
                  {biomarkers.length > 0 ? (
                    <AnnualReportBiomarkersTable blockGroupItems={biomarkers} />
                  ) : (
                    group.blockGroupItem.map((item) => (
                      <div key={item.id}>{renderOtherItemComponent(item)}</div>
                    ))
                  )}
                </BlockGroupComponent>
              );
            })}
          </BlockAccordion>
        ))}
      </div>
    </section>
  );
};
