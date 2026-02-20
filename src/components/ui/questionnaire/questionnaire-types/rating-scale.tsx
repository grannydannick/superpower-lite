import {
  capitalize,
  getTypedPropertyValue,
  stringify,
  TypedValue,
  deepEquals,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireItemInitial,
} from '@medplum/fhirtypes';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { QuestionnaireErrorWrapper } from '../questionnaire-error-wrapper';

interface RatingScaleProps {
  item: QuestionnaireItem;
  name: string;
  response: QuestionnaireResponseItem;
  initial: QuestionnaireItemInitial | undefined;
  isError: boolean;
  onChangeAnswer: (newResponseAnswer: any) => void;
}

export function RatingScale({
  item,
  name,
  response,
  initial,
  isError,
  onChangeAnswer,
}: RatingScaleProps) {
  const initialValue = getTypedPropertyValue(
    { type: 'QuestionnaireItemInitial', value: initial },
    'value',
  ) as TypedValue | undefined;

  const options: [string, TypedValue][] = [];
  let defaultValue = undefined;
  if (item.answerOption) {
    for (let i = 0; i < item.answerOption.length; i++) {
      const option = item.answerOption[i];
      const optionName = `${name}-option-${i}`;
      const optionValue = getTypedPropertyValue(
        { type: 'QuestionnaireItemAnswerOption', value: option },
        'value',
      ) as TypedValue;

      if (optionValue?.value === undefined || optionValue?.value === null) {
        continue;
      }

      if (initialValue && stringify(optionValue) === stringify(initialValue)) {
        defaultValue = optionName;
      }
      options.push([optionName, optionValue]);
    }
  }

  const { startLabel, endLabel } = getStartEndLabels(item);

  const currentAnswer = getCurrentAnswer(response);
  const answerLinkId = getCurrentRadioAnswer(options, currentAnswer);

  return (
    <QuestionnaireErrorWrapper isError={isError}>
      <RadioGroup
        className={cn(
          'flex w-full gap-2',
          options.length > 5 ? 'flex-col md:flex-row' : 'flex-row',
        )}
        defaultValue={answerLinkId ?? defaultValue}
        onValueChange={(newValue) => {
          const option = options.find((option) => option[0] === newValue);
          if (option) {
            const optionValue = option[1];
            const propertyName = 'value' + capitalize(optionValue.type);
            onChangeAnswer({ [propertyName]: optionValue.value });

            // autoAdvance();
          }
        }}
        name={item.linkId}
      >
        {options.map(([optionName, optionValue], index) => (
          <div
            className={cn(
              'relative flex flex-1 items-center space-x-1 overflow-hidden rounded-xl bg-white outline-none ring-0 transition-all hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-secondary md:h-16',
              options.length > 5 ? 'py-5' : 'aspect-square md:aspect-auto',
            )}
            data-scale-id={item.linkId}
            tabIndex={0}
            key={index}
            role="radio"
            aria-checked={optionName === (answerLinkId ?? defaultValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();

                const radioInput = document.getElementById(optionName);
                if (radioInput) {
                  radioInput.click();
                } else {
                  const option = options.find(
                    (option) => option[0] === optionName,
                  );
                  if (option) {
                    const propertyName = 'value' + capitalize(option[1].type);
                    onChangeAnswer({ [propertyName]: option[1].value });
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
            <Label
              htmlFor={optionName}
              className={cn(
                'absolute inset-0 top-1/2 z-10 m-0 flex h-16 -translate-y-1/2 cursor-pointer items-center justify-center text-center text-base font-normal text-white mix-blend-difference',
              )}
            >
              {optionValue.value}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div
        style={{
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        }}
        className="mt-4 hidden w-full justify-between gap-2 md:grid"
      >
        <Body3 className="text-center text-zinc-400">{startLabel}</Body3>
        {Array.from({ length: options.length - 2 }).map((_, index) => (
          <div key={index} />
        ))}
        <Body3 className="text-center text-zinc-400">{endLabel}</Body3>
      </div>
      {options.length > 5 && (
        <div className="flex w-full justify-between gap-2 pt-4 md:hidden">
          <Body3 className="text-center text-zinc-400">
            Rate from {startLabel.toLowerCase()} (1) to {endLabel.toLowerCase()}{' '}
            (10)
          </Body3>
        </div>
      )}
    </QuestionnaireErrorWrapper>
  );
}

// Helper functions
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

interface StartEndLabels {
  startLabel: string;
  endLabel: string;
}

function getStartEndLabels(item: QuestionnaireItem): StartEndLabels {
  const startLabel = item.extension?.find(
    (e) =>
      e.url ===
      'https://superpower.com/fhir/StructureDefinition/questionnaire-rangeStartLabel',
  )?.valueString;

  const endLabel = item.extension?.find(
    (e) =>
      e.url ===
      'https://superpower.com/fhir/StructureDefinition/questionnaire-rangeEndLabel',
  )?.valueString;

  return {
    startLabel: startLabel ?? 'Very poor',
    endLabel: endLabel ?? 'Excellent',
  };
}
