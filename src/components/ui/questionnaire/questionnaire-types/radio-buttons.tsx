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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

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
    const options: [string, TypedValue][] = [];
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
        options.push([optionName, optionValue]);
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
      setSelectedAnswer(optionValue.value as string);
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
        {formattedOptions.map(([optionName, optionValue], index) => (
          <div
            className={cn(
              'flex items-center relative space-x-1 rounded-xl bg-white hover:bg-zinc-50 overflow-hidden transition-all outline-none ring-0 focus-visible:ring-2 focus-visible:ring-secondary py-4',
              selectedAnswer === optionValue.value && 'ring-2 ring-black',
            )}
            data-radio-group={item.linkId}
            key={index}
            role="radio"
            tabIndex={0}
            aria-checked={optionName === answerLinkId}
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
              className="invisible rounded-xl border-zinc-400 after:visible after:transition-all after:duration-300 after:ease-in-out after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:inset-0 data-[state=checked]:after:bg-black after:hover:bg-zinc-800"
            />
            <span className="pointer-events-none invisible py-1.5 pr-24">
              {optionValue.value}
            </span>
            <Label
              id={optionName}
              htmlFor={optionName}
              className="absolute inset-0 z-10 m-0 flex w-full cursor-pointer select-none items-center justify-start px-6 py-4 pr-24 text-left text-base font-normal text-white mix-blend-difference"
            >
              <span>{optionValue.value}</span>
            </Label>
          </div>
        ))}
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
  options: [string, TypedValue][],
  defaultAnswer: TypedValue,
): string | undefined {
  return options.find((option) =>
    deepEquals(option[1].value, defaultAnswer?.value),
  )?.[0];
}
