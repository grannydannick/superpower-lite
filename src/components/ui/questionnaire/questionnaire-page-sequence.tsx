import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { AnimatePresence, m, type Variants } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { Button } from '../button';

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
  onFinalSubmit,
  initialProgressPercent,
}: {
  onSave: (item: QuestionnaireResponseItem[]) => void;
  onFinalSubmit: () => void;
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
    prevStep,
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
      const timeoutId = setTimeout(() => {
        setManualActiveStep(null);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
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

  const fadeAnimation: Variants = {
    hidden: { opacity: 0, filter: 'blur(1px)', pointerEvents: 'none' },
    visible: { opacity: 1, filter: 'blur(0px)', pointerEvents: 'auto' },
    exit: { opacity: 0, filter: 'blur(1px)', pointerEvents: 'none' },
  };

  return (
    <m.div
      key="questionnaire"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <main className="flex min-h-svh w-full flex-col bg-zinc-100">
        <div className="flex flex-1 flex-col">
          <div className="mx-auto flex size-full max-w-[800px] flex-1 flex-col p-8 md:p-12">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevStep}
                aria-label="Go back"
                aria-hidden={effectiveStep === 0}
                tabIndex={effectiveStep === 0 ? -1 : 0}
                className={cn(
                  'h-fit shrink-0 text-zinc-400 transition-opacity duration-300 hover:text-zinc-600',
                  effectiveStep === 0 && 'pointer-events-none opacity-0',
                )}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-300">
                <div
                  style={{
                    width: `${progressBarPercent}%`,
                  }}
                  className="absolute inset-0 h-full rounded-full bg-black transition-all duration-300"
                />
              </div>
              <div aria-hidden className="size-5 shrink-0" />
            </div>
            <AnimatePresence mode="wait">
              <m.div
                key={`question-${currentQuestion.item.linkId}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeAnimation}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="mt-10 flex h-full flex-1 flex-col space-y-2"
              >
                {questionnaire.title && (
                  <Body2 className="font-normal text-zinc-500">
                    {questionnaire.title}
                  </Body2>
                )}
                <QuestionnaireQuestion
                  item={currentQuestion.item}
                  response={currentQuestion.response}
                  onChange={setItems}
                  onSave={onSave}
                  onSubmit={onFinalSubmit}
                />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </m.div>
  );
};
