import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { QuestionnaireQuestion } from './questionnaire-question';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import { QuestionnaireItemType, shouldSkipQuestion } from './utils';

const hasAnswers = (item: QuestionnaireResponseItem): boolean => {
  if (item.answer && item.answer.length > 0) {
    return true;
  }

  if (item.item) {
    for (const child of item.item) {
      if (hasAnswers(child)) {
        return true;
      }
    }
  }

  return false;
};

// Component that renders the questionnaire form page in sequence
export const QuestionnaireFormPageSequence = ({
  onSave,
  initialProgressPercent,
}: {
  onSave: (item: QuestionnaireResponseItem[]) => void;
  initialProgressPercent?: number;
}) => {
  const [manualActiveStep, setManualActiveStep] = useState<number | null>(null);

  const {
    questionnaire,
    response,
    activeStep,
    setItems,
    checkForQuestionEnabled,
    nextStep,
    user,
  } = useQuestionnaireStore((s) => s);

  const items = useMemo(() => questionnaire.item ?? [], [questionnaire.item]);

  const effectiveStep =
    manualActiveStep !== null ? manualActiveStep : activeStep;

  const allQuestions = useMemo(() => {
    const result: Array<{
      item: QuestionnaireItem;
      response: QuestionnaireResponseItem;
      group: QuestionnaireItem | null;
      isAnswered: boolean;
    }> = [];

    items.forEach((item) => {
      if (item.type === QuestionnaireItemType.group && item.item) {
        if (!checkForQuestionEnabled(item)) {
          return;
        }

        item.item.forEach((subItem) => {
          // Skip questions that should be hidden (e.g., gender, identity verification)
          if (shouldSkipQuestion(subItem, questionnaire, user, response)) {
            return;
          }
          if (checkForQuestionEnabled(subItem)) {
            const groupResponseItem = response?.item?.find(
              (i) => i.linkId === item.linkId,
            );
            const nestedResponseItem = groupResponseItem?.item?.find(
              (i) => i.linkId === subItem.linkId,
            ) || { linkId: subItem.linkId };

            const isAnswered = hasAnswers(nestedResponseItem);

            result.push({
              item: subItem,
              response: nestedResponseItem,
              group: item,
              isAnswered,
            });
          }
        });
      } else {
        // Skip questions that should be hidden (e.g., gender, identity verification)
        if (shouldSkipQuestion(item, questionnaire, user, response)) {
          return;
        }
        if (checkForQuestionEnabled(item)) {
          const responseItem = response?.item?.find(
            (i) => i.linkId === item.linkId,
          ) || { linkId: item.linkId };

          result.push({
            item,
            response: responseItem,
            group: null,
            isAnswered: hasAnswers(responseItem),
          });
        }
      }
    });

    return result;
  }, [items, response, checkForQuestionEnabled, questionnaire, user]);

  const uniqueGroups = useMemo(() => {
    const groups = new Set(
      allQuestions.filter((q) => q.group).map((q) => q.group?.linkId),
    );
    return Array.from(groups);
  }, [allQuestions]);

  useEffect(() => {
    if (!document.getElementById('manual-debug')) {
      const debugElement = document.createElement('div');
      debugElement.id = 'manual-debug';
      debugElement.style.display = 'none';
      debugElement.dataset.step = effectiveStep.toString();
      document.body.appendChild(debugElement);

      return () => {
        document.body.removeChild(debugElement);
      };
    }
  }, [effectiveStep]);

  useEffect(() => {
    if (manualActiveStep !== null && activeStep !== manualActiveStep) {
      setManualActiveStep(null);
    }
  }, [activeStep, manualActiveStep]);

  useEffect(() => {
    if (
      allQuestions.length === 0 &&
      questionnaire.item &&
      questionnaire.item.length > 0
    ) {
      nextStep();
    }
  }, [allQuestions.length, nextStep, questionnaire.item]);

  if (!allQuestions.length || effectiveStep >= allQuestions.length) {
    console.error(
      'ERROR: !allQuestions.length || effectiveStep >= allQuestions.length condition triggered',
    );
    return null;
  }

  const currentQuestion = allQuestions[effectiveStep];

  const currentGroupIndex =
    currentQuestion && currentQuestion.group
      ? uniqueGroups.indexOf(currentQuestion.group.linkId)
      : 0;

  const currentGroupQuestions = currentQuestion
    ? allQuestions.filter(
        (q) => q.group?.linkId === currentQuestion.group?.linkId,
      )
    : [];

  const currentQuestionIndex = currentQuestion
    ? currentGroupQuestions.findIndex(
        (q) => q.item.linkId === currentQuestion.item.linkId,
      )
    : 0;

  const groupProgress =
    currentGroupQuestions.length > 0
      ? ((currentQuestionIndex + 1) / currentGroupQuestions.length) * 100
      : 0;
  const progressFloor =
    typeof initialProgressPercent === 'number' && initialProgressPercent > 0
      ? Math.min(initialProgressPercent, 100)
      : 0;
  const progressBarPercent = Math.max(groupProgress, progressFloor);

  const fadeAnimation = {
    hidden: { opacity: 0, filter: 'blur(1px)', pointerEvents: 'none' },
    visible: { opacity: 1, filter: 'blur(0px)', pointerEvents: 'auto' },
    exit: { opacity: 0, filter: 'blur(1px)', pointerEvents: 'none' },
  };

  return (
    <motion.div
      key="questionnaire"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <main className="flex min-h-svh w-full flex-col bg-zinc-100">
        <div className="flex flex-1 flex-col">
          <div className="mx-auto flex size-full max-w-[800px] flex-1 flex-col p-8 md:p-12">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-300">
              <div
                style={{
                  width: `${progressBarPercent}%`,
                }}
                className="absolute inset-0 h-full rounded-full bg-vermillion-900 transition-all duration-300"
              />
            </div>
            <SuperpowerLogo className="my-10 hidden md:block" />
            <AnimatePresence mode="wait">
              <motion.div
                key={`question-${currentQuestion.item.linkId}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeAnimation as Variants}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex h-full flex-1 flex-col space-y-6"
              >
                <QuestionnaireQuestion
                  item={currentQuestion.item}
                  response={currentQuestion.response}
                  onChange={setItems}
                  onSave={onSave}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="pointer-events-none sticky bottom-0 z-10 flex w-full flex-col">
          <div className="flex w-full justify-between">
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 0V25H25C11.1934 25 0 13.8071 0 0Z"
                fill="white"
              />
            </svg>

            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25 0V25H0C13.8066 25 25 13.8071 25 0Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="pointer-events-auto flex h-16 w-full items-center justify-between gap-6 truncate bg-white px-8 py-4">
            <div className="hidden flex-1 truncate md:block">
              <Body2 className="text-zinc-500">
                Progress is automatically saved
              </Body2>
            </div>
            <div className="hidden flex-1 items-center justify-center gap-3 truncate text-zinc-400 md:flex">
              <Body2 className="truncate font-normal text-black">
                {questionnaire.title}
              </Body2>
              {/*<ChevronRightIcon className="size-4" />*/}
              {/*<Body2 className="truncate font-normal text-zinc-400">*/}
              {/*  Schedule Test*/}
              {/*</Body2>*/}
              {/*<ChevronRightIcon className="size-4" />*/}
              {/*<Body2 className="truncate font-normal text-zinc-400">*/}
              {/*  You&apos;re In*/}
              {/*</Body2>*/}
            </div>
            <div className="flex flex-1 items-center justify-center gap-4 truncate py-3 md:justify-end md:py-0">
              <Body2
                className={cn(
                  'truncate font-normal text-zinc-400',
                  uniqueGroups.length > 1 ? 'hidden md:block' : 'block',
                )}
              >
                {currentQuestion && currentQuestion.group?.text}
              </Body2>
              {uniqueGroups.length > 1 && (
                <>
                  <div className="hidden h-7 w-px shrink-0 bg-zinc-200 md:block" />
                  <div className="flex shrink-0 items-center gap-2">
                    {Array.from({ length: uniqueGroups.length }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className={cn(
                            'h-2.5 w-1.5 rounded-[2px] transition-colors duration-300',
                            index <= currentGroupIndex
                              ? 'animate-jump-up bg-vermillion-900'
                              : 'bg-zinc-200',
                          )}
                        />
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};
