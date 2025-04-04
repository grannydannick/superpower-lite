import {
  capitalize,
  getTypedPropertyValue,
  TypedValue,
  deepEquals,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { QuestionnaireErrorWrapper } from '../questionnaire-error-wrapper';
import { useQuestionnaireStore } from '../stores/questionnaire-store';

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
  const { width } = useWindowDimensions();

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

  const nextStep = useQuestionnaireStore((s) => s.nextStep);

  const autoAdvance = useCallback(
    (timeout = 0) => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        nextStep();
        setSelectedAnswer(null);
      }, timeout);
    },
    [nextStep],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);

      if (
        !isNaN(num) &&
        num >= 1 &&
        num <= 9 &&
        num <= formattedOptions.length
      ) {
        const optionIndex = num - 1;
        const [, optionValue] = formattedOptions[optionIndex];

        const propertyName = 'value' + capitalize(optionValue.type);
        onChangeAnswer({ [propertyName]: optionValue.value });

        setSelectedAnswer(optionValue.value);

        autoAdvance(300);
      }
    };

    // Only add keydown event listener on non-mobile devices
    const isNonMobile = width > 768;

    if (formattedOptions.length < 10 && isNonMobile) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formattedOptions, onChangeAnswer, autoAdvance, width]);

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
            const propertyName = 'value' + capitalize(optionValue.type);
            onChangeAnswer({ [propertyName]: optionValue.value });

            setSelectedAnswer(optionValue.value);

            autoAdvance();
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
            tabIndex={0}
            key={index}
            role="radio"
            aria-checked={optionName === answerLinkId}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();

                const radioInput = document.getElementById(optionName);
                if (radioInput) {
                  radioInput.click();
                } else {
                  const option = formattedOptions.find(
                    (option) => option[0] === optionName,
                  );
                  if (option) {
                    const propertyName = 'value' + capitalize(option[1].type);
                    onChangeAnswer({ [propertyName]: option[1].value });
                    setSelectedAnswer(option[1].value);
                  }
                }
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
            {formattedOptions.length < 10 && (
              <span className="absolute right-8 top-1/2 hidden aspect-square size-6 -translate-y-1/2 items-center justify-center rounded-md bg-zinc-100 p-1 text-sm leading-none text-zinc-500 md:flex">
                {index + 1}
              </span>
            )}
          </div>
        ))}
      </RadioGroup>
      {formattedOptions.length < 10 && (
        <p className="mt-2 hidden text-xs italic text-zinc-500 md:block">
          Tip: You can also select options using number keys 1-
          {formattedOptions.length}
        </p>
      )}
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
