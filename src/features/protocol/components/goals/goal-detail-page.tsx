import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Link } from '@tanstack/react-router';
import { m } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { extractObservationId } from '@/features/messages/utils/parse-fhir-citation';
import { useSupplementProductLookup } from '@/features/protocol/hooks/use-supplement-product-lookup';
import { useGender } from '@/hooks/use-gender';
import { Biomarker } from '@/types/api';

import type { ProtocolAction, ProtocolGoal } from '../../api';
import {
  ACTION_TYPE_FALLBACK_IMAGE,
  getActionTypeImage,
} from '../../const/protocol-constants';
import {
  AdditionalContentDialog,
  CitationsDialog,
  WhyItMattersDialog,
} from '../dialogs';
import { ProtocolIndexNumber } from '../protocol-index-number';
import { ProtocolMarkdown } from '../protocol-markdown';
import { BiomarkerCausesDialog } from '../reveal/steps/key-actions/biomarker-causes-dialog';
import { SymptomsCarousel } from '../symptoms-carousel';

interface GoalDetailPageProps {
  goal: ProtocolGoal;
  goalIndex: number;
  protocolId: string;
  backLink: string;
}

export const GoalDetailPage = ({
  goal,
  goalIndex,
  protocolId: _protocolId,
  backLink,
}: GoalDetailPageProps) => {
  const { gender } = useGender();

  // Fetch biomarkers data
  const { data: allBiomarkers } = useBiomarkers();

  // Build an index mapping observation IDs to their parent biomarkers
  const observationBiomarkerIndex = useMemo(() => {
    const index = new Map<string, Biomarker>();
    if (!allBiomarkers?.biomarkers) return index;
    for (const biomarker of allBiomarkers.biomarkers) {
      for (const result of biomarker.value ?? []) {
        if (result.id) {
          index.set(result.id.toString(), biomarker);
        }
      }
    }
    return index;
  }, [allBiomarkers]);

  // Resolve biomarkers from FHIR references (e.g., "Observation/uuid" -> biomarker)
  const resolvedBiomarkers = useMemo(() => {
    if (!goal.biomarkers || observationBiomarkerIndex.size === 0) return [];

    const resolvedList: Biomarker[] = [];
    const seenBiomarkerIds = new Set<string>();

    for (const reference of goal.biomarkers) {
      const biomarker = observationBiomarkerIndex.get(
        extractObservationId(reference),
      );

      // Deduplicate - multiple observations may belong to the same biomarker
      if (biomarker && !seenBiomarkerIds.has(biomarker.id)) {
        seenBiomarkerIds.add(biomarker.id);
        resolvedList.push(biomarker);
      }
    }

    return resolvedList;
  }, [goal.biomarkers, observationBiomarkerIndex]);

  // Get citations from all actions (primary + additional)
  const citations = useMemo(() => {
    const primary = goal.primaryAction?.citations ?? [];
    const additional = (goal.additionalActions ?? []).flatMap(
      (a) => a.citations ?? [],
    );
    return [...primary, ...additional];
  }, [goal.primaryAction?.citations, goal.additionalActions]);

  const { primaryAction } = goal;
  const additionalActions = goal.additionalActions ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 lg:px-0">
      {/* Back button */}
      <Link
        to={backLink}
        className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Back</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <ProtocolIndexNumber
          index={goalIndex}
          className="shrink-0 text-4xl md:text-5xl"
        />
        <div className="min-w-0 flex-1">
          <H2 className="text-xl md:text-2xl">{goal.title}</H2>
          {goal.recoveryTime && (
            <Body2 className="mt-1 text-secondary">{goal.recoveryTime}</Body2>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabsPrimitive.Root defaultValue="findings">
        <UnderlineTabs>
          <TabsPrimitive.Trigger
            value="findings"
            className="relative pb-3 text-sm font-medium text-zinc-500 transition-colors data-[state=active]:text-zinc-900 hover:text-zinc-700"
          >
            Findings
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            value="actions"
            className="relative pb-3 text-sm font-medium text-zinc-500 transition-colors data-[state=active]:text-zinc-900 hover:text-zinc-700"
          >
            Actions
          </TabsPrimitive.Trigger>
        </UnderlineTabs>

        <TabsPrimitive.Content value="findings" className="mt-6">
          <FindingsTab
            goal={goal}
            resolvedBiomarkers={resolvedBiomarkers}
            citations={citations}
            twinSrc={`/protocol/twins/${gender === 'female' ? 'female' : 'male'}-twin-neutral.png`}
          />
        </TabsPrimitive.Content>

        <TabsPrimitive.Content value="actions" className="mt-6">
          <ActionsTab
            goal={goal}
            primaryAction={primaryAction}
            additionalActions={additionalActions}
          />
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>

      {/* Ask Superpower AI */}
      <div className="space-y-4 pt-4">
        <H4>Ask Superpower AI</H4>
        <AiSuggestions
          context={`I'm looking at my protocol goal: "${goal.title}". ${goal.description || ''} Please give me relevant questions I can ask about this goal.`}
          showAskOwn
        />
      </div>
    </div>
  );
};

// Underline Tabs Component with orange indicator
const UnderlineTabs = ({ children }: { children: React.ReactNode }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector(
      '[data-state="active"]',
    ) as HTMLElement;
    if (activeTab) {
      setIndicatorStyle({
        width: activeTab.offsetWidth,
        left: activeTab.offsetLeft,
      });
    }
  }, []);

  useLayoutEffect(() => {
    updateIndicator();

    if (!tabsRef.current) return;

    const observer = new MutationObserver((mutations) => {
      const hasStateChange = mutations.some(
        (m) => m.type === 'attributes' && m.attributeName === 'data-state',
      );
      if (hasStateChange) updateIndicator();
    });

    observer.observe(tabsRef.current, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={tabsRef}
      className="relative flex gap-6 border-b border-zinc-200"
    >
      {children}
      <div
        className="absolute bottom-0 h-0.5 bg-vermillion-900 transition-all duration-200 ease-out"
        style={{
          width: `${indicatorStyle.width}px`,
          left: `${indicatorStyle.left}px`,
        }}
      />
    </TabsPrimitive.List>
  );
};

// Findings Tab Component
interface FindingsTabProps {
  goal: ProtocolGoal;
  resolvedBiomarkers: Biomarker[];
  citations: NonNullable<ProtocolAction['citations']>;
  twinSrc: string;
}

const FindingsTab = ({
  goal,
  resolvedBiomarkers,
  citations,
  twinSrc,
}: FindingsTabProps) => {
  return (
    <div className="space-y-6">
      {/* How you might be feeling */}
      {goal.possibleSymptoms && goal.possibleSymptoms.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <H4 className="mb-3 text-base">How you might be feeling</H4>
          <SymptomsCarousel symptoms={goal.possibleSymptoms} />
        </m.div>
      )}

      {/* What we found */}
      {goal.description && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <H4 className="mb-2 text-base">What we found</H4>
          <ProtocolMarkdown
            content={goal.description}
            className="text-sm leading-relaxed text-secondary"
          />
        </m.div>
      )}

      {/* Biomarkers and Impact cards */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {goal.biomarkers && goal.biomarkers.length > 0 && (
          <BiomarkerCausesDialog
            biomarkers={resolvedBiomarkers}
            observationCount={goal.biomarkers.length}
            isLoading={resolvedBiomarkers.length === 0}
          >
            <button
              type="button"
              className="group flex w-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow shadow-black/[.03] transition-colors hover:border-zinc-300"
            >
              <div className="mb-2 flex w-full items-start justify-between">
                <div>
                  <H4 className="text-base">Your biomarkers</H4>
                  <Body2 className="text-secondary">
                    {resolvedBiomarkers.length > 0
                      ? `${resolvedBiomarkers.length} biomarkers linked to this`
                      : `${goal.biomarkers.length} biomarkers linked to this`}
                  </Body2>
                </div>
                <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-500" />
              </div>
              <img
                src="/protocol/goals/chart.webp"
                alt="Biomarker chart"
                className="mt-auto h-20 w-full object-contain object-center"
              />
            </button>
          </BiomarkerCausesDialog>
        )}

        {goal.impactContent && (
          <WhyItMattersDialog
            goalTitle={goal.title}
            impactContent={goal.impactContent}
          >
            <button
              type="button"
              className="group flex w-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow shadow-black/[.03] transition-colors hover:border-zinc-300"
            >
              <div className="mb-2 flex w-full items-start justify-between">
                <div>
                  <H4 className="text-base">Why this matters</H4>
                  <Body2 className="text-secondary">
                    How this impacts your health
                  </Body2>
                </div>
                <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-500" />
              </div>
              <img
                src={twinSrc}
                alt="Impact visualization"
                className="mt-auto h-28 self-center object-cover"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              />
            </button>
          </WhyItMattersDialog>
        )}

        {citations.length > 0 && (
          <CitationsDialog citations={citations}>
            <button
              type="button"
              className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-left shadow shadow-black/[.03] transition-colors hover:border-zinc-300"
            >
              <Body2 className="text-secondary">
                {citations.length} Citations
              </Body2>
              <div className="flex items-center gap-3">
                <img
                  src="/protocol/what-we-do/protocols.webp"
                  alt="Research protocols"
                  className="h-10 w-14 object-contain"
                />
                <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-500" />
              </div>
            </button>
          </CitationsDialog>
        )}
      </m.div>
    </div>
  );
};

// Actions Tab Component
interface ActionsTabProps {
  goal: ProtocolGoal;
  primaryAction: ProtocolAction;
  additionalActions: ProtocolAction[];
}

const ActionsTab = ({
  goal: _goal,
  primaryAction,
  additionalActions,
}: ActionsTabProps) => {
  const getSupplementProduct = useSupplementProductLookup();

  if (!primaryAction) {
    return (
      <div className="py-8 text-center">
        <Body1 className="text-secondary">
          No actions available for this goal.
        </Body1>
      </div>
    );
  }

  const actionImage = getActionTypeImage(primaryAction.content);
  const whyContent =
    primaryAction.content.type === 'supplement'
      ? primaryAction.content.why
      : primaryAction.description;
  const lookOutForContent =
    primaryAction.content.type === 'supplement'
      ? primaryAction.content.lookOutFor
      : null;
  const primaryActionProduct =
    primaryAction.content.type === 'supplement'
      ? getSupplementProduct(primaryAction.content.productId)
      : null;
  const primaryActionCitations = primaryAction.citations ?? [];

  return (
    <div className="space-y-6">
      {/* Key Action */}
      <div>
        <H4 className="mb-3 text-base">Key Action</H4>
        <AdditionalContentDialog
          actionTitle={primaryAction.title}
          actionImage={actionImage}
          whyContent={whyContent}
          lookOutForContent={lookOutForContent}
          additionalContent={primaryAction.additionalContent}
          supplementProduct={primaryActionProduct}
          citations={primaryActionCitations}
        >
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300"
            role="button"
            tabIndex={0}
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={actionImage}
                alt={primaryAction.title}
                className="size-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = ACTION_TYPE_FALLBACK_IMAGE;
                }}
              />
              <H4 className="flex-1 text-base">{primaryAction.title}</H4>
            </div>

            <ProtocolMarkdown
              content={primaryAction.description}
              className="text-sm text-secondary [&>div]:mb-0"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-secondary">
                Learn more
                <ChevronRight className="size-4" />
              </span>
            </div>
          </m.div>
        </AdditionalContentDialog>
      </div>

      {/* Additional Actions */}
      {additionalActions.length > 0 && (
        <div>
          <H4 className="mb-3 text-base">Additional Actions</H4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {additionalActions.map((action, index) => {
              const actionImg = getActionTypeImage(action.content);
              const actionProduct =
                action.content.type === 'supplement'
                  ? getSupplementProduct(action.content.productId)
                  : null;
              const actionWhyContent =
                action.content.type === 'supplement'
                  ? action.content.why
                  : action.description;
              const actionLookOutFor =
                action.content.type === 'supplement'
                  ? action.content.lookOutFor
                  : null;
              const actionCitations = action.citations ?? [];

              return (
                <AdditionalContentDialog
                  key={action.id || index}
                  actionTitle={action.title}
                  actionImage={actionImg}
                  whyContent={actionWhyContent}
                  lookOutForContent={actionLookOutFor}
                  additionalContent={action.additionalContent}
                  supplementProduct={actionProduct}
                  citations={actionCitations}
                >
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={actionImg}
                        alt={action.title}
                        className="size-10 rounded-lg object-cover rounded-mask"
                        onError={(e) => {
                          e.currentTarget.src = ACTION_TYPE_FALLBACK_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <H4 className="text-sm">{action.title}</H4>
                      </div>
                    </div>

                    {action.description && (
                      <ProtocolMarkdown
                        content={action.description}
                        className="mt-2 text-xs text-secondary [&>div]:mb-0"
                      />
                    )}

                    <div className="mt-3 flex items-center">
                      <span className="flex items-center gap-1 text-sm text-secondary">
                        Learn more
                        <ChevronRight className="size-4" />
                      </span>
                    </div>
                  </m.div>
                </AdditionalContentDialog>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
