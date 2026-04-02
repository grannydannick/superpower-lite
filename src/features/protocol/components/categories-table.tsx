import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { m } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Fragment, Suspense, lazy, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getBiomarkerColor } from '@/components/ui/charts/utils/get-biomarker-color';
import { H4 } from '@/components/ui/typography';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';

const AssistantChatSheet = lazy(() =>
  import('@/features/messages/components/assistant/assistant-chat-sheet').then(
    (m) => ({ default: m.AssistantChatSheet }),
  ),
);
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { Biomarker, CategoryValue } from '@/types/api';

interface CategoryGroup {
  category: string;
  value: CategoryValue;
  biomarkers: Biomarker[];
}

interface CategoriesTableProps {
  categories: CategoryGroup[];
  maxVisibleBiomarkers?: number;
}

const MAX_VISIBLE_BIOMARKERS = 2;

interface BiomarkerRowProps {
  biomarker: Biomarker;
}

const BiomarkerRow = ({ biomarker }: BiomarkerRowProps) => {
  const latestResult = biomarker.value?.[0];
  const colors = getBiomarkerColor(biomarker.status);
  const isOutOfRange =
    biomarker.status === 'HIGH' || biomarker.status === 'LOW';

  return (
    <BiomarkerDialog biomarker={biomarker}>
      <button
        className="w-full rounded-xl text-left transition-colors hover:bg-zinc-50"
        style={isOutOfRange ? { backgroundColor: colors.light } : undefined}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-3.5">
          <p
            className="min-w-0 flex-1 text-sm font-medium"
            style={{ color: isOutOfRange ? colors.default : undefined }}
          >
            {biomarker.name}
          </p>
          <div className="flex flex-1 shrink-0 items-center gap-1 text-sm">
            <ChevronUp
              className="size-4 shrink-0"
              style={{ color: colors.default }}
            />
            <span
              className="font-medium tabular-nums"
              style={{ color: isOutOfRange ? colors.default : undefined }}
            >
              {latestResult?.quantity?.value || '--'}
            </span>
            <span className="text-zinc-500">
              {latestResult?.quantity?.unit || 'mg/dL'}
            </span>
          </div>
          <div className="w-20 shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-center text-sm tabular-nums text-zinc-400">
            {biomarker.ranges.quest?.[0]?.low?.value || 0}-
            {biomarker.ranges.quest?.[0]?.high?.value || 20}
          </div>
        </div>
      </button>
    </BiomarkerDialog>
  );
};

interface CollapsibleBiomarkersProps {
  biomarkers: Biomarker[];
  isExpanded: boolean;
}

const CollapsibleBiomarkers = ({
  biomarkers,
  isExpanded,
}: CollapsibleBiomarkersProps) => {
  return (
    <m.div
      initial={false}
      animate={{
        height: isExpanded ? 'auto' : 0,
        opacity: isExpanded ? 1 : 0,
      }}
      transition={{
        height: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
        opacity: {
          duration: 0.2,
          ease: 'easeInOut',
        },
      }}
      className="overflow-hidden"
    >
      {biomarkers.map((biomarker) => (
        <Fragment key={biomarker.id}>
          <div className="mx-3 h-px bg-zinc-100" />
          <BiomarkerRow biomarker={biomarker} />
        </Fragment>
      ))}
    </m.div>
  );
};

export const CategoriesTable = ({
  categories,
  maxVisibleBiomarkers = MAX_VISIBLE_BIOMARKERS,
}: CategoriesTableProps) => {
  const { track } = useAnalytics();
  const width = useWindowWidth();
  const navigate = useNavigate();
  const open = useAssistantStore((s) => s.open);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRevealMode = pathname.startsWith('/protocol/reveal/');

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMessage, setSheetMessage] = useState('');

  const isMobile = width ? width < 1024 : false;

  const handleBiomarkerQuestion = (biomarkerName: string) => {
    const prompt = `What is ${biomarkerName}?`;

    if (isMobile) {
      if (isRevealMode) {
        setSheetMessage(prompt);
        setSheetOpen(true);
      } else {
        navigate({ to: '/concierge', search: { defaultMessage: prompt } });
      }
    } else {
      open(prompt);
    }

    track('clicked_biomarker_question', {
      biomarker_name: biomarkerName,
      prompt,
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <>
      <div className="flex-1 space-y-2">
        {categories.map((categoryGroup, groupIndex) => {
          const isExpanded = expandedCategories.has(categoryGroup.category);
          const hasMoreBiomarkers =
            categoryGroup.biomarkers.length > maxVisibleBiomarkers;
          const visibleBiomarkers = categoryGroup.biomarkers.slice(
            0,
            maxVisibleBiomarkers,
          );
          const collapsedBiomarkers =
            categoryGroup.biomarkers.slice(maxVisibleBiomarkers);

          return (
            <m.div
              key={categoryGroup.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow shadow-black/[.03]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-1 flex size-8 items-center justify-center rounded-lg bg-gradient-to-r',
                    categoryGroup.value === 'A' &&
                      'from-green-500 via-green-400 to-green-500',
                    categoryGroup.value === 'B' &&
                      'from-yellow-500 via-yellow-400 to-yellow-500',
                    categoryGroup.value === 'C' &&
                      'from-pink-500 via-pink-400 to-pink-500',
                    categoryGroup.value === '-' &&
                      'from-zinc-500 via-zinc-400 to-zinc-500',
                  )}
                >
                  <H4 className="leading-none text-white">
                    {categoryGroup.value}
                  </H4>
                </div>
                <div className="flex-1">
                  <H4 className="text-base">{categoryGroup.category}</H4>
                  <p className="text-sm text-zinc-600">
                    {categoryGroup.biomarkers.length} Biomarker
                    {categoryGroup.biomarkers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  className="-mr-2 -mt-2 size-8 p-0 hover:bg-zinc-100"
                  onClick={() =>
                    handleBiomarkerQuestion(categoryGroup.category)
                  }
                >
                  <AnimatedIcon state="idle" size={20} />
                </Button>
              </div>

              <div>
                {/* Always visible biomarkers */}
                {visibleBiomarkers.map((biomarker, index) => (
                  <Fragment key={biomarker.id}>
                    {index > 0 && <div className="mx-3 h-px bg-zinc-100" />}
                    <BiomarkerRow biomarker={biomarker} />
                  </Fragment>
                ))}

                {/* Collapsible biomarkers */}
                {hasMoreBiomarkers && (
                  <CollapsibleBiomarkers
                    biomarkers={collapsedBiomarkers}
                    isExpanded={isExpanded}
                  />
                )}

                {/* View all / Show less button */}
                {hasMoreBiomarkers && (
                  <m.button
                    onClick={() => toggleCategory(categoryGroup.category)}
                    className="flex w-full items-center justify-center gap-1 pt-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{isExpanded ? 'Show less' : 'View all'}</span>
                    <m.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="flex items-center justify-center"
                    >
                      <ChevronDown className="size-4" />
                    </m.span>
                  </m.button>
                )}
              </div>
            </m.div>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <AssistantChatSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          defaultMessage={sheetMessage}
        />
      </Suspense>
    </>
  );
};
