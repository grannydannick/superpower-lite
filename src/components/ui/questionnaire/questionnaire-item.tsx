import { getTypedPropertyValue } from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { QuestionnaireErrorWrapper } from './questionnaire-error-wrapper';
import { getCurrentAnswer } from './questionnaire-types/common';
import {
  QuestionnaireChoiceDropDownInput,
  QuestionnaireChoiceSetInput,
} from './questionnaire-types/multi-select';
import { MultipleChoice } from './questionnaire-types/multiple-choice';
import { RadioButtons } from './questionnaire-types/radio-buttons';
import { RatingScale } from './questionnaire-types/rating-scale';
import { isMultipleChoice, QuestionnaireItemType } from './utils';

export interface QuestionnaireFormItemProps {
  item: QuestionnaireItem;
  index: number;
  response: QuestionnaireResponseItem;
  onChange: (newResponseItem: QuestionnaireResponseItem) => void;
  isError?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  nested?: boolean;
}

export const QuestionnaireFormItem = ({
  item,
  index,
  response,
  onChange,
  isError = false,
  onKeyDown,
  nested,
}: QuestionnaireFormItemProps) => {
  const [localError, setLocalError] = useState(isError);

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

    const updatedResponse = {
      id: response?.id,
      linkId: response?.linkId,
      text: item.text,
      answer: updatedAnswers,
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
    case QuestionnaireItemType.decimal:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Input
            placeholder="Tell us here..."
            type="number"
            step="any"
            id={name}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) => {
              // NOTE: we do that because if you remove text it becomes NaN
              if (isNaN(e.currentTarget.valueAsNumber)) {
                return;
              }
              onChangeAnswer({
                valueDecimal: e.currentTarget.valueAsNumber,
              });
            }}
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
    // Integer item type, used for numeric questions
    case QuestionnaireItemType.integer:
      return (
        <QuestionnaireErrorWrapper isError={localError}>
          <Input
            placeholder="Tell us here..."
            type="number"
            step={1}
            id={name}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!nested}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) => {
              // NOTE: we do that because if you remove text it becomes NaN
              if (isNaN(e.currentTarget.valueAsNumber)) {
                return;
              }
              onChangeAnswer({
                valueInteger: e.currentTarget.valueAsNumber,
              });
            }}
            onKeyDown={onKeyDown}
          />
        </QuestionnaireErrorWrapper>
      );
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
              // NOTE: we do that because medplum doesnt accept empty strings on backend
              const newValue = e.currentTarget.value;
              if (newValue.trim() === '') {
                return;
              }

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
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueString: e.currentTarget.value })
            }
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
