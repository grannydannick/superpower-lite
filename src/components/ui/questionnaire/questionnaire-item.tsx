import { getTypedPropertyValue } from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { RX_CONSENT_PAYMENT_LINKID } from './const/special-linkids';
import { QuestionnaireErrorWrapper } from './questionnaire-error-wrapper';
import { getCurrentAnswer } from './questionnaire-types/common';
import {
  QuestionnaireChoiceDropDownInput,
  QuestionnaireChoiceSetInput,
} from './questionnaire-types/multi-select';
import { MultipleChoice } from './questionnaire-types/multiple-choice';
import { RadioButtons } from './questionnaire-types/radio-buttons';
import { RatingScale } from './questionnaire-types/rating-scale';
import {
  getNumericBounds,
  isMultipleChoice,
  QuestionnaireItemType,
} from './utils';

export interface QuestionnaireFormItemProps {
  item: QuestionnaireItem;
  index: number;
  response: QuestionnaireResponseItem;
  onChange: (newResponseItem: QuestionnaireResponseItem) => void;
  isError?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  nested?: boolean;
  onValidationChange?: (linkId: string, hasError: boolean) => void;
}

export const QuestionnaireFormItem = ({
  item,
  index,
  response,
  onChange,
  isError = false,
  onKeyDown,
  nested,
  onValidationChange,
}: QuestionnaireFormItemProps) => {
  const [localError, setLocalError] = useState(isError);
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Ensure parent state is reset if the component unmounts (e.g. when navigating away)
  useEffect(() => {
    return () => {
      if (item.linkId) {
        onValidationChange?.(item.linkId, false);
      }
    };
  }, [item.linkId, onValidationChange]);

  function onChangeAnswer(
    newResponseAnswer:
      | QuestionnaireResponseItemAnswer
      | QuestionnaireResponseItemAnswer[],
  ): void {
    setLocalError(false);
    let updatedAnswers: QuestionnaireResponseItemAnswer[];
    if (Array.isArray(newResponseAnswer)) {
      updatedAnswers = newResponseAnswer;
    } else if (index >= (response?.answer?.length ?? 0)) {
      updatedAnswers = (response?.answer ?? []).concat([newResponseAnswer]);
    } else {
      const newAnswers = (response?.answer ?? []).map((a, idx) =>
        idx === index ? newResponseAnswer : a,
      ) as QuestionnaireResponseItemAnswer[];
      updatedAnswers = newAnswers ?? [];
    }

    // Note: Medplum does not accept empty strings or NaN values, so we remove them
    updatedAnswers = updatedAnswers
      .map((answer) => {
        const cleanedAnswer = { ...answer };
        if (
          cleanedAnswer.valueString === '' ||
          cleanedAnswer.valueString === undefined ||
          (typeof cleanedAnswer.valueString === 'string' &&
            cleanedAnswer.valueString.trim() === '')
        ) {
          delete cleanedAnswer.valueString;
        }
        if (Number.isNaN(cleanedAnswer.valueInteger)) {
          delete cleanedAnswer.valueInteger;
        }
        if (Number.isNaN(cleanedAnswer.valueDecimal)) {
          delete cleanedAnswer.valueDecimal;
        }
        return cleanedAnswer;
      })
      .filter((answer) =>
        Object.keys(answer).some((key) => key.startsWith('value')),
      );

    const { answer: _previousAnswer, ...restResponse } = response;

    const updatedResponse: QuestionnaireResponseItem =
      updatedAnswers.length > 0
        ? {
            ...restResponse,
            linkId: response?.linkId ?? item.linkId,
            text: item.text,
            answer: updatedAnswers,
          }
        : {
            ...restResponse,
            linkId: response?.linkId ?? item.linkId,
            text: item.text,
          };

    onChange(updatedResponse);
  }

  const type = item.type;
  if (!type) {
    return null;
  }

  const name = item.linkId;
  if (!name) {
    return null;
  }

  const initial =
    item.initial && item.initial.length > 0 ? item.initial[0] : undefined;

  const defaultValue =
    getCurrentAnswer(response, index) ??
    getTypedPropertyValue(
      { type: 'QuestionnaireItemInitial', value: initial },
      'value',
    );

  // Special case: render a single confirm action as a submit button
  const isConsentPaymentSingleConfirm =
    item.linkId === RX_CONSENT_PAYMENT_LINKID &&
    Array.isArray(item.answerOption) &&
    item.answerOption.length === 1 &&
    !!item.answerOption[0].valueString;

  if (isConsentPaymentSingleConfirm) {
    const confirmLabel = item.answerOption?.[0].valueString as string;
    return (
      <QuestionnaireErrorWrapper isError={localError}>
        <Button
          type="button"
          className="w-full"
          onClick={(e) => {
            // 1) set the answer
            onChangeAnswer({ valueString: confirmLabel });

            // 2) submit on the next microtask so the store has the new answer
            const formEl =
              (e.currentTarget.closest('form') as HTMLFormElement | null) ??
              (document.querySelector('form') as HTMLFormElement | null);

            queueMicrotask(() => {
              if (!formEl) return;
              const maybeRequestSubmit = (formEl as HTMLFormElement)
                .requestSubmit;
              if (typeof maybeRequestSubmit === 'function') {
                (formEl as HTMLFormElement).requestSubmit();
              } else {
                formEl.dispatchEvent(
                  new Event('submit', { bubbles: true, cancelable: true }),
                );
              }
            });
          }}
        >
          {confirmLabel}
        </Button>
      </QuestionnaireErrorWrapper>
    );
  }

  // Helpers to extract values and check if we have a rating scale
  const hasAnswerOptions = item.answerOption && item.answerOption.length > 0;
  const firstValueInteger = hasAnswerOptions
    ? item.answerOption![0].valueInteger
    : undefined;
  const lastValueInteger = hasAnswerOptions
    ? item.answerOption![item.answerOption!.length - 1].valueInteger
    : undefined;
  const isScaleOneToFive = firstValueInteger === 1 && lastValueInteger === 5;
  const isScaleOneToTen = firstValueInteger === 1 && lastValueInteger === 10;

  const isRatingScale =
    hasAnswerOptions &&
    firstValueInteger &&
    (isScaleOneToFive || isScaleOneToTen);

  /**
   * This switch statement is used to render the correct component for the item type.
   * It takes the item type and returns the correct component (some components are shared between item types).
   */
  switch (type) {
    // Display, mainly used for covers in each group (beginning)
    case QuestionnaireItemType.display:
      return <p key={item.linkId}>{item.text}</p>;
    // Boolean item type, used for yes/no questions
    case QuestionnaireItemType.boolean:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={item.linkId}
              name={item.linkId}
              defaultChecked={defaultValue?.value}
              onCheckedChange={(checked) => {
                onChangeAnswer({ valueBoolean: !!checked });
              }}
              required={item.required}
            />
            <label
              htmlFor={item.linkId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                localError ? 'text-destructive' : null,
              )}
            >
              {item.text}
            </label>
          </div>
        </QuestionnaireErrorWrapper>
      );
    // Decimal item type, used for numeric questions
    case QuestionnaireItemType.decimal: {
      const { min: decimalMin, max: decimalMax } = getNumericBounds(item);
      const getDecimalErrorMessage = (value: number) => {
        if (
          decimalMin !== undefined &&
          decimalMax !== undefined &&
          (value < decimalMin || value > decimalMax)
        ) {
          return `Please enter a value between ${decimalMin} and ${decimalMax}.`;
        }
        if (decimalMin !== undefined && value < decimalMin) {
          return `Please enter a value greater than or equal to ${decimalMin}.`;
        }
        if (decimalMax !== undefined && value > decimalMax) {
          return `Please enter a value less than or equal to ${decimalMax}.`;
        }
        return null;
      };

      return (
        <QuestionnaireErrorWrapper
          isError={localError || !!rangeError}
          message={rangeError ?? undefined}
        >
          <Input
            placeholder="Tell us here..."
            type="number"
            step="any"
            id={name}
            inputMode="decimal" // mobile devices show decimal keypad
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            min={decimalMin}
            max={decimalMax}
            onChange={(e) => {
              const value = e.currentTarget.valueAsNumber;
              if (Number.isNaN(value)) {
                setRangeError(null);
                setLocalError(false);
                if (item.linkId) {
                  onValidationChange?.(item.linkId, false);
                }
                onChangeAnswer({
                  valueDecimal: value,
                });
                return;
              }

              const errorMessage = getDecimalErrorMessage(value);
              if (errorMessage) {
                setRangeError(errorMessage);
                setLocalError(true);
                if (item.linkId) {
                  onValidationChange?.(item.linkId, true);
                }
                return;
              }

              setRangeError(null);
              setLocalError(false);
              if (item.linkId) {
                onValidationChange?.(item.linkId, false);
              }
              onChangeAnswer({
                valueDecimal: value,
              });
            }}
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
    }
    // Integer item type, used for numeric questions
    case QuestionnaireItemType.integer: {
      const { min: integerMin, max: integerMax } = getNumericBounds(item);
      const getIntegerErrorMessage = (value: number) => {
        if (
          integerMin !== undefined &&
          integerMax !== undefined &&
          (value < integerMin || value > integerMax)
        ) {
          return `Please enter a value between ${integerMin} and ${integerMax}.`;
        }
        if (integerMin !== undefined && value < integerMin) {
          return `Please enter a value greater than or equal to ${integerMin}.`;
        }
        if (integerMax !== undefined && value > integerMax) {
          return `Please enter a value less than or equal to ${integerMax}.`;
        }
        return null;
      };

      return (
        <QuestionnaireErrorWrapper
          isError={localError || !!rangeError}
          message={rangeError ?? undefined}
        >
          <Input
            placeholder="Tell us here..."
            type="number"
            step={1}
            id={name}
            inputMode="numeric" // mobile devices show numeric keypad
            pattern="[0-9]*" // reinforces that input should be numeric
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            min={integerMin}
            max={integerMax}
            onChange={(e) => {
              const value = e.currentTarget.valueAsNumber;
              if (Number.isNaN(value)) {
                setRangeError(null);
                setLocalError(false);
                if (item.linkId) {
                  onValidationChange?.(item.linkId, false);
                }
                onChangeAnswer({
                  valueInteger: value,
                });
                return;
              }

              const errorMessage = getIntegerErrorMessage(value);
              if (errorMessage) {
                setRangeError(errorMessage);
                setLocalError(true);
                if (item.linkId) {
                  onValidationChange?.(item.linkId, true);
                }
                return;
              }

              setRangeError(null);
              setLocalError(false);
              if (item.linkId) {
                onValidationChange?.(item.linkId, false);
              }
              onChangeAnswer({
                valueInteger: value,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === '.' || e.key === ',') {
                e.preventDefault();
              }
              if (onKeyDown) onKeyDown(e);
            }}
          />
        </QuestionnaireErrorWrapper>
      );
    }
    // Date item type, used for date questions
    case QuestionnaireItemType.date:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Input
            placeholder="Tell us here..."
            className="h-14 w-full"
            type="date"
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueDate: e.currentTarget.value })
            }
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
    // Date and time item type, used for date and time questions
    case QuestionnaireItemType.dateTime:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    // Time item type, used for time questions
    case QuestionnaireItemType.time:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Input
            placeholder="Tell us here..."
            type="time"
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueTime: e.currentTarget.value })
            }
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
    // String or url item type, used for text questions
    case QuestionnaireItemType.string:
    case QuestionnaireItemType.url:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Input
            placeholder="Tell us here..."
            id={name}
            name={name}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) => {
              const newValue = e.currentTarget.value;
              onChangeAnswer({ valueString: newValue });
            }}
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
    // Text item type, used for longer text questions (e.g. free text that needs textarea)
    case QuestionnaireItemType.text:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Textarea
            id={name}
            name={name}
            required={item.required}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            defaultValue={defaultValue?.value}
            onChange={(e) => {
              const newValue = e.currentTarget.value;
              onChangeAnswer({ valueString: newValue });
            }}
            rows={4}
            className="scroll-py-4"
          />
        </QuestionnaireErrorWrapper>
      );
    // Attachment item type, not supported
    case QuestionnaireItemType.attachment:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    // Reference item type, not supported
    case QuestionnaireItemType.reference:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    // Quantity item type, not supported
    case QuestionnaireItemType.quantity:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    // Choice item type, used for multiple choice questions, can be string-based or 1 to 5 scale
    case QuestionnaireItemType.choice:
      if (
        // check if it is string-based multiple choice
        item.answerOption &&
        item.answerOption.length > 0 &&
        item.answerOption[0].valueString &&
        isMultipleChoice(item)
      ) {
        return (
          <MultipleChoice
            item={item}
            response={response}
            isError={localError}
            onChange={onChange}
          />
        );
      } else if (
        // check if it is a 1 to 5 or 1 to 10 scale
        isRatingScale
      ) {
        return (
          <RatingScale
            item={item}
            name={name}
            response={response}
            initial={initial}
            isError={localError}
            onChangeAnswer={onChangeAnswer}
          />
        );
      } else if (
        // check if it is a normal radio button answer
        item.answerOption &&
        item.answerOption.length > 0
      ) {
        return (
          <RadioButtons
            item={item}
            name={name}
            response={response}
            isError={localError}
            onChangeAnswer={onChangeAnswer}
          />
        );
      } else if (isMultipleChoice(item) && !item.answerValueSet) {
        return (
          <QuestionnaireChoiceDropDownInput
            isError={localError}
            name={name}
            item={item}
            initial={initial}
            response={response}
            onChangeAnswer={(e) => onChangeAnswer(e)}
          />
        );
      } else {
        return (
          <QuestionnaireChoiceSetInput
            isError={localError}
            name={name}
            item={item}
            initial={initial}
            response={response}
            onChangeAnswer={(e) => onChangeAnswer(e)}
          />
        );
      }
    case QuestionnaireItemType.openChoice:
      if (isMultipleChoice(item) && !item.answerValueSet) {
        return (
          <QuestionnaireChoiceDropDownInput
            isError={localError}
            name={name}
            item={item}
            initial={initial}
            response={response}
            onChangeAnswer={(e) => onChangeAnswer(e)}
          />
        );
      } else {
        return (
          <QuestionnaireChoiceSetInput
            isError={localError}
            name={name}
            item={item}
            initial={initial}
            response={response}
            onChangeAnswer={(e) => onChangeAnswer(e)}
          />
        );
      }
    default:
      return null;
  }
};
