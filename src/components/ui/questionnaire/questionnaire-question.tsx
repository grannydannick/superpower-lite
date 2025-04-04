import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { ArrowLeftIcon, SmileIcon } from 'lucide-react';
import { useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { QuestionnaireFormRepeatableItem } from './questionnaire-repeatable-item';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import {
  ensureNestedResponseItems,
  isResponseEmpty,
  QuestionnaireItemType,
  validateRequiredFields,
} from './utils';

interface QuestionnaireQuestionProps {
  item: QuestionnaireItem;
  response: QuestionnaireResponseItem;
  onChange: (response: QuestionnaireResponseItem[]) => void;
  onSave: (response: QuestionnaireResponseItem[]) => void;
}

/**
 * This component is used to render a questionnaire question.
 * It takes an item, a response, and onChange and onSave functions.
 */
export const QuestionnaireQuestion = ({
  item,
  response,
  onChange,
  onSave,
}: QuestionnaireQuestionProps) => {
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );
  const { nextStep, prevStep, activeStep, getLastQuestion } =
    useQuestionnaireStore((s) => s);
  const currentResponse = useQuestionnaireStore((s) => s.response);

  const showBackButton = activeStep > 0;
  const lastQuestion = getLastQuestion();
  const isLastQuestion = lastQuestion?.linkId === item.linkId;

  // If https://superpower.com/fhir/StructureDefinition/questionnaire-description is available in the extension array, use it as the description
  const description = item.extension?.find(
    (e) =>
      e.url ===
      'https://superpower.com/fhir/StructureDefinition/questionnaire-description',
  )?.valueString;

  const handleNextStep = () => {
    ensureNestedResponseItems(item, response, onChange);

    if (currentResponse.item) {
      onSave(currentResponse.item);
    }

    if (isLastQuestion) {
      return;
    }

    if (!item.required) {
      if (localErrors.length > 0) {
        setLocalErrors([]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      nextStep();
      return;
    }

    const missingFields = validateRequiredFields(
      item,
      response,
      checkForQuestionEnabled,
    );

    if (missingFields) {
      setLocalErrors(missingFields);
      return;
    }

    setLocalErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    nextStep();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !isLastQuestion &&
      e.key === 'Enter' &&
      !isResponseEmpty(item, response, checkForQuestionEnabled)
    ) {
      e.preventDefault();
      handleNextStep();
    }
  };

  if (!checkForQuestionEnabled(item)) {
    return (
      <div className="space-y-6">
        <H2 className="italic">{item.text}</H2>
        <Alert>
          <SmileIcon className="size-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You do not have to fill this section, move forward
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-2">
          {showBackButton && (
            <Button
              type="button"
              className="w-full bg-white"
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
          )}
          <Button type="button" className="w-full" onClick={handleNextStep}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      key={item.linkId}
      className="relative flex h-full flex-1 flex-col space-y-4 pt-12 md:pt-0"
    >
      {showBackButton && (
        <button
          tabIndex={-1}
          type="button"
          className="text-zinc-400 transition-all hover:text-zinc-500 md:hidden"
          onClick={prevStep}
        >
          <ArrowLeftIcon />
        </button>
      )}
      <SuperpowerLogo className="size-32 h-12 md:hidden" />
      <div className="flex h-full flex-1 flex-col justify-between gap-6 md:translate-y-0 md:justify-start">
        {item.type === QuestionnaireItemType.group ? (
          <div className="space-y-6">
            <div className="mb-10">
              <Body1 className={cn('text-2xl', description ? 'mb-3' : 'mb-5')}>
                {item.text}
              </Body1>
              {description && (
                <Body2 className="text-secondary">{description}</Body2>
              )}
            </div>
            <div
              className={cn(
                'grid grid-cols-1 gap-4',
                // only map to 2 columns if "default" input field
                (item.item?.every(
                  (i) => i.type === QuestionnaireItemType.integer,
                ) ||
                  item.item?.every(
                    (i) => i.type === QuestionnaireItemType.string,
                  )) &&
                  item.item?.length > 1
                  ? 'md:grid-cols-2'
                  : '',
              )}
            >
              {item.item?.map((nestedItem) => (
                <QuestionnaireFormRepeatableItem
                  nested
                  key={nestedItem.linkId}
                  item={nestedItem}
                  response={
                    response.item?.find(
                      (i) => i.linkId === nestedItem.linkId,
                    ) || { linkId: nestedItem.linkId }
                  }
                  onChange={(newItems) => {
                    if (!response.item) {
                      response.item = [];
                    }

                    const existingItemIndex = response.item.findIndex(
                      (i) => i.linkId === nestedItem.linkId,
                    );

                    if (existingItemIndex >= 0) {
                      response.item[existingItemIndex] = newItems[0];
                    } else {
                      response.item.push(newItems[0]);
                    }

                    onChange([response]);
                  }}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </div>
          </div>
        ) : item.type === QuestionnaireItemType.display ? (
          <div className="space-y-4">
            <Body1 className="text-2xl">{item.prefix}</Body1>
            <Body1 className="mb-8 text-sm text-zinc-500">{item.text}</Body1>
            {description && (
              <Body2 className="mb-10 text-secondary">{description}</Body2>
            )}
          </div>
        ) : (
          <QuestionnaireFormRepeatableItem
            key={item.linkId}
            item={item}
            response={response}
            onChange={onChange}
            isError={localErrors.includes(item.linkId)}
            onKeyDown={handleKeyDown}
          />
        )}
        <div className="mt-12 flex flex-col gap-2 md:mt-0">
          {showBackButton && (
            <button
              tabIndex={-1}
              type="button"
              className="absolute -left-12 top-1 hidden text-zinc-400 transition-all hover:text-zinc-500 md:block"
              onClick={prevStep}
            >
              <ArrowLeftIcon />
            </button>
          )}
          {isLastQuestion ? (
            <Button type="submit" className="ml-auto w-full md:w-[108px]">
              Submit
            </Button>
          ) : (
            <div
              className={cn(
                'ml-auto flex w-full flex-col-reverse gap-4 md:w-auto md:flex-row',
                item.type === QuestionnaireItemType.display && 'md:w-full',
              )}
            >
              {!item.required &&
                item.type !== QuestionnaireItemType.group &&
                item.type !== QuestionnaireItemType.display && (
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-auto w-full bg-white hover:bg-white/75 md:w-[108px]"
                    onClick={handleNextStep}
                  >
                    Skip
                  </Button>
                )}
              <Button
                type="button"
                className={cn(
                  'ml-auto w-full md:w-[108px]',
                  item.type === QuestionnaireItemType.display && 'md:w-full',
                )}
                onClick={() => {
                  handleNextStep();
                }}
                disabled={isResponseEmpty(
                  item,
                  response,
                  checkForQuestionEnabled,
                )}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
