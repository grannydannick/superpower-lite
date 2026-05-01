import {
  capitalize,
  deepEquals,
  getTypedPropertyValue,
  TypedValue,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { useCallback, useMemo, useState } from 'react';

import { Label } from '@/components/ui/label';
import { LazyIcon } from '@/components/ui/lazy-icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

import { OPTION_ICON_EXTENSION_URL } from '../const/system-urls';
import { QuestionnaireErrorWrapper } from '../questionnaire-error-wrapper';

interface RadioButtonsProps {
  item: QuestionnaireItem;
  name: string;
  response: QuestionnaireResponseItem;
  isError: boolean;
  onChangeAnswer: (newResponseAnswer: any) => void;
}

export function RadioButtons({
  item,
  name,
  response,
  isError,
  onChangeAnswer,
}: RadioButtonsProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const formattedOptions = useMemo(() => {
    const options: [string, TypedValue, number][] = [];
    if (item.answerOption) {
      for (let i = 0; i < item.answerOption.length; i++) {
        const option = item.answerOption[i];
        const optionName = `${name}-option-${i}`;
        const optionValue = getTypedPropertyValue(
          { type: 'QuestionnaireItemAnswerOption', value: option },
          'value',
        ) as TypedValue;

        if (!optionValue?.value) {
          continue;
        }
        options.push([optionName, optionValue, i]);
      }
    }
    return options;
  }, [item.answerOption, name]);

  const currentAnswer = getCurrentAnswer(response);
  const answerLinkId = getCurrentRadioAnswer(formattedOptions, currentAnswer);

  const handleSelect = useCallback(
    (optionName: string, optionValue: TypedValue) => {
      if (!optionValue?.type) return;
      const propertyName = 'value' + capitalize(optionValue.type);
      onChangeAnswer({ [propertyName]: optionValue.value });
      setSelectedAnswer(optionName);
    },
    [onChangeAnswer],
  );

  return (
    <QuestionnaireErrorWrapper isError={isError}>
      <RadioGroup
        className="flex w-full flex-col gap-2"
        defaultValue={answerLinkId}
        onValueChange={(newValue) => {
          const option = formattedOptions.find(
            (option) => option[0] === newValue,
          );
          if (option) {
            const optionValue = option[1];
            handleSelect(newValue, optionValue);
          }
        }}
        name={item.linkId}
      >
        {formattedOptions.map(([optionName, optionValue, originalIdx]) => {
          const isSelected =
            selectedAnswer !== null
              ? optionName === selectedAnswer
              : optionName === answerLinkId;
          const answerOption = item.answerOption?.[originalIdx];
          const iconName = answerOption?.extension?.find(
            (e) => e.url === OPTION_ICON_EXTENSION_URL,
          )?.valueString;

          return (
            <div
              className={cn(
                'group/radio-button relative flex items-center space-x-4 py-4 outline-none ring-0',
              )}
              data-radio-group={item.linkId}
              key={optionName}
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSelect(optionName, optionValue);
                }
              }}
            >
              <RadioGroupItem
                key={optionName}
                id={optionName}
                value={optionName}
                className="invisible absolute"
              />

              <div
                className={cn(
                  'pointer-events-none absolute inset-0 !ml-0 cursor-pointer rounded-xl ring-2 ring-vermillion-300 transition-[opacity,transform] ease-out',
                  isSelected
                    ? 'duration-50 scale-100 opacity-100'
                    : 'scale-95 opacity-0 duration-1000',
                )}
              />

              <Label
                id={optionName}
                htmlFor={optionName}
                className={cn(
                  'absolute inset-0 !ml-0 cursor-pointer rounded-xl border bg-white duration-200 hover:bg-zinc-50 hover:duration-0',
                  isSelected ? 'border-vermillion-900' : 'border-zinc-200',
                )}
              ></Label>
              <div
                className={cn(
                  'pointer-events-none relative aspect-square size-5 rounded-xl border border-zinc-200 bg-white p-1 duration-200 ease-in-out group-hover/radio-button:duration-0 hover:duration-0',
                  isSelected
                    ? 'border-vermillion-700 group-hover/radio-button:border-vermillion-900'
                    : 'border-zinc-200 group-hover/radio-button:border-zinc-300',
                )}
              >
                <div className="absolute inset-0 cursor-pointer rounded-full bg-white hover:bg-zinc-50" />
                <div
                  className={cn(
                    'duration-50 size-full rounded-full bg-vermillion-900 transition-transform ease-out',
                    isSelected ? 'scale-100' : 'scale-0',
                  )}
                />
              </div>
              {iconName != null && (
                <span className="pointer-events-none relative !ml-3">
                  <LazyIcon name={iconName} />
                </span>
              )}
              <span className="pointer-events-none relative m-0 flex w-full cursor-pointer select-none items-center justify-start py-4 pr-6 text-left text-base font-normal">
                {optionValue.value}
              </span>
            </div>
          );
        })}
      </RadioGroup>
    </QuestionnaireErrorWrapper>
  );
}

function getItemValue(answer: any): TypedValue {
  return getTypedPropertyValue(
    { type: 'QuestionnaireItemAnswer', value: answer },
    'value',
  ) as TypedValue;
}

function getCurrentAnswer(
  response: QuestionnaireResponseItem,
  index: number = 0,
): TypedValue {
  const results = response.answer;
  return getItemValue(results?.[index] ?? {});
}

function getCurrentRadioAnswer(
  options: [string, TypedValue, number][],
  defaultAnswer: TypedValue,
): string | undefined {
  return options.find((option) =>
    deepEquals(option[1].value, defaultAnswer?.value),
  )?.[0];
}
