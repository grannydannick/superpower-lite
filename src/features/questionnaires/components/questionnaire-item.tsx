import {
  capitalize,
  deepEquals,
  formatCodeableConcept,
  formatCoding,
  getTypedPropertyValue,
  stringify,
  TypedValue,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemInitial,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes';
import { ReactNode } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Body1 } from '@/components/ui/typography';
import { useQuestionnaireStore } from '@/features/questionnaires/stores/questionnaire-store';
import { cn } from '@/lib/utils';

import {
  formatReferenceString,
  getNewMultiSelectValues,
  QuestionnaireItemType,
} from '../utils/questionnaire';

export interface QuestionnaireFormItemProps {
  item: QuestionnaireItem;
  index: number;
  response: QuestionnaireResponseItem;
  onChange: (newResponseItem: QuestionnaireResponseItem) => void;
}

export const QuestionnaireFormItem = ({
  item,
  index,
  response,
  onChange,
}: QuestionnaireFormItemProps) => {
  const errors = useQuestionnaireStore((s) => s.errors);
  const updateError = useQuestionnaireStore((s) => s.setErrors);

  function onChangeAnswer(
    newResponseAnswer:
      | QuestionnaireResponseItemAnswer
      | QuestionnaireResponseItemAnswer[],
  ): void {
    let updatedAnswers: QuestionnaireResponseItemAnswer[];
    if (Array.isArray(newResponseAnswer)) {
      // It's a multi-select case, so use the array directly.
      updatedAnswers = newResponseAnswer;
    } else if (index >= (response?.answer?.length ?? 0)) {
      // if adding a new answer
      updatedAnswers = (response?.answer ?? []).concat([newResponseAnswer]);
    } else {
      // if updating an existing answer
      const newAnswers = (response?.answer ?? []).map((a, idx) =>
        idx === index ? newResponseAnswer : a,
      ) as QuestionnaireResponseItemAnswer[];
      updatedAnswers = newAnswers ?? [];
    }

    const newErrors = errors.filter((e) => e !== response.linkId);
    updateError(newErrors);

    onChange({
      id: response?.id,
      linkId: response?.linkId,
      text: item.text,
      answer: updatedAnswers,
    });
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

  const isError = errors.includes(name);

  const defaultValue =
    getCurrentAnswer(response, index) ??
    getTypedPropertyValue(
      { type: 'QuestionnaireItemInitial', value: initial },
      'value',
    );

  switch (type) {
    case QuestionnaireItemType.display:
      return <p key={item.linkId}>{item.text}</p>;
    case QuestionnaireItemType.boolean:
      return (
        <ErrorWrapper isError={isError}>
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
                isError ? 'text-destructive' : null,
              )}
            >
              {item.text}
            </label>
          </div>
        </ErrorWrapper>
      );
    case QuestionnaireItemType.decimal:
      return (
        <ErrorWrapper isError={isError}>
          <Input
            placeholder="Input number..."
            type="number"
            step="any"
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueDecimal: e.currentTarget.valueAsNumber })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.integer:
      return (
        <ErrorWrapper isError={isError}>
          <Input
            placeholder="Input number..."
            type="number"
            step={1}
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueInteger: e.currentTarget.valueAsNumber })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.date:
      return (
        <ErrorWrapper isError={isError}>
          <Input
            placeholder="Input date..."
            type="date"
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueDate: e.currentTarget.value })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.dateTime:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    case QuestionnaireItemType.time:
      return (
        <ErrorWrapper isError={isError}>
          <Input
            placeholder="Input time..."
            type="time"
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueTime: e.currentTarget.value })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.string:
    case QuestionnaireItemType.url:
      return (
        <ErrorWrapper isError={isError}>
          <Input
            placeholder="Input text..."
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueString: e.currentTarget.value })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.text:
      return (
        <ErrorWrapper isError={isError}>
          <Textarea
            id={name}
            name={name}
            required={item.required}
            defaultValue={defaultValue?.value}
            onChange={(e) =>
              onChangeAnswer({ valueString: e.currentTarget.value })
            }
          />
        </ErrorWrapper>
      );
    case QuestionnaireItemType.attachment:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    case QuestionnaireItemType.reference:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    case QuestionnaireItemType.quantity:
      return (
        <Body1 className="text-pink-700 line-through">Not supported</Body1>
      );
    case QuestionnaireItemType.choice:
    case QuestionnaireItemType.openChoice:
      if (isDropDownChoice(item) && !item.answerValueSet) {
        return (
          <QuestionnaireChoiceDropDownInput
            isError={isError}
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
            isError={isError}
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

interface QuestionnaireChoiceInputProps {
  name: string;
  item: QuestionnaireItem;
  initial: QuestionnaireItemInitial | undefined;
  response: QuestionnaireResponseItem;
  isError: boolean;
  onChangeAnswer: (
    newResponseAnswer:
      | QuestionnaireResponseItemAnswer
      | QuestionnaireResponseItemAnswer[],
  ) => void;
}

function QuestionnaireChoiceDropDownInput(
  props: QuestionnaireChoiceInputProps,
): JSX.Element {
  const { item, initial, response, isError } = props;

  if (!item.answerOption?.length) {
    return <NoAnswerDisplay />;
  }

  const initialValue = getTypedPropertyValue(
    { type: 'QuestionnaireItemInitial', value: initial },
    'value',
  ) as TypedValue | undefined;

  const data: string[] = [];

  for (const option of item.answerOption) {
    const optionValue = getTypedPropertyValue(
      { type: 'QuestionnaireItemAnswerOption', value: option },
      'value',
    ) as TypedValue;
    data.push(typedValueToString(optionValue) as string);
  }

  const defaultValue = getCurrentAnswer(response) ?? initialValue;

  if (item.repeats) {
    const { propertyName, data } = formatSelectData(props.item);
    const currentAnswer = getCurrentMultiSelectAnswer(response);

    return (
      <ErrorWrapper isError={isError}>
        <MultiSelect
          options={data}
          variant="inverted"
          className="bg-white"
          defaultValue={currentAnswer || [typedValueToString(initialValue)]}
          onValueChange={(selected) => {
            const values = getNewMultiSelectValues(
              selected,
              propertyName,
              item,
            );
            props.onChangeAnswer(values);
          }}
        />
      </ErrorWrapper>
    );
  }

  return (
    <ErrorWrapper isError={isError}>
      <Select
        onValueChange={(value) => {
          const index = data.indexOf(value);

          if (index === -1) {
            return;
          }

          const option = (item.answerOption as QuestionnaireItemAnswerOption[])[
            index
          ];
          const optionValue = getTypedPropertyValue(
            { type: 'QuestionnaireItemAnswerOption', value: option },
            'value',
          ) as TypedValue;
          const propertyName = 'value' + capitalize(optionValue.type);
          props.onChangeAnswer({ [propertyName]: optionValue.value });
        }}
        defaultValue={formatCoding(defaultValue?.value) || defaultValue?.value}
      >
        <SelectTrigger>
          <SelectValue placeholder="Please select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select one</SelectLabel>
            {data.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ErrorWrapper>
  );
}

function QuestionnaireChoiceSetInput(
  props: QuestionnaireChoiceInputProps,
): JSX.Element {
  const { name, item, initial, onChangeAnswer, response, isError } = props;

  if (!item.answerOption?.length && !item.answerValueSet) {
    return <NoAnswerDisplay />;
  }

  if (item.answerValueSet) {
    return <Body1 className="text-pink-700 line-through">Not supported</Body1>;
    // return (
    //   <CodingInput
    //     name={name}
    //     binding={item.answerValueSet}
    //     onChange={(code) => onChangeAnswer({ valueCoding: code })}
    //     creatable={item.type === QuestionnaireItemType.openChoice}
    //   />
    // );
  }
  return (
    <QuestionnaireChoiceRadioInput
      isError={isError}
      name={response?.id ?? name}
      item={item}
      initial={initial}
      response={response}
      onChangeAnswer={onChangeAnswer}
    />
  );
}

function QuestionnaireChoiceRadioInput(
  props: QuestionnaireChoiceInputProps,
): JSX.Element {
  const { name, item, initial, onChangeAnswer, response, isError } = props;
  // const valueElementDefinition = getElementDefinition(
  //   'QuestionnaireItemAnswerOption',
  //   'value[x]',
  // );
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

      if (!optionValue?.value) {
        continue;
      }

      if (initialValue && stringify(optionValue) === stringify(initialValue)) {
        defaultValue = optionName;
      }
      options.push([optionName, optionValue]);
    }
  }

  const defaultAnswer = getCurrentAnswer(response);
  const answerLinkId = getCurrentRadioAnswer(options, defaultAnswer);

  return (
    <ErrorWrapper isError={isError}>
      <RadioGroup
        defaultValue={answerLinkId ?? defaultValue}
        onValueChange={(newValue) => {
          const option = options.find((option) => option[0] === newValue);
          if (option) {
            const optionValue = option[1];
            const propertyName = 'value' + capitalize(optionValue.type);
            onChangeAnswer({ [propertyName]: optionValue.value });
          }
        }}
      >
        {options.map(([optionName, optionValue], index) => (
          <div className="flex items-center space-x-1" key={index}>
            <RadioGroupItem
              key={optionName}
              id={optionName}
              value={optionName}
              className="border-zinc-400"
            />
            <Label
              htmlFor={optionName}
              className={cn(isError ? 'text-destructive' : null)}
            >
              {optionValue.value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </ErrorWrapper>
  );
}

function ErrorWrapper({
  children,
  isError,
}: {
  children: ReactNode;
  isError: boolean;
}) {
  return (
    <div className="space-y-2">
      {children}
      {isError ? (
        <p className="text-sm font-medium text-destructive">
          This field is required.
        </p>
      ) : null}
    </div>
  );
}

function NoAnswerDisplay(): JSX.Element {
  return <Input disabled placeholder="No Answers Defined" />;
}

function getItemValue(answer: QuestionnaireResponseItemAnswer): TypedValue {
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

function getCurrentMultiSelectAnswer(
  response: QuestionnaireResponseItem,
): string[] {
  const results = response.answer;
  if (!results) {
    return [];
  }
  const typedValues = results.map((a) => getItemValue(a));
  return typedValues.map((type) => formatCoding(type?.value) || type?.value);
}

function getCurrentRadioAnswer(
  options: [string, TypedValue][],
  defaultAnswer: TypedValue,
): string | undefined {
  return options.find((option) =>
    deepEquals(option[1].value, defaultAnswer?.value),
  )?.[0];
}

function typedValueToString(
  typedValue: TypedValue | undefined,
): string | undefined {
  if (!typedValue) {
    return undefined;
  }
  if (typedValue.type === 'CodeableConcept') {
    return formatCodeableConcept(typedValue.value);
  }
  if (typedValue.type === 'Coding') {
    return formatCoding(typedValue.value);
  }
  if (typedValue.type === 'Reference') {
    return formatReferenceString(typedValue);
  }
  return typedValue.value.toString();
}

function isDropDownChoice(item: QuestionnaireItem): boolean {
  return !!item.extension?.some(
    (e) =>
      e.url ===
        'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      e.valueCodeableConcept?.coding?.[0]?.code === 'drop-down',
  );
}

interface MultiSelect {
  readonly value: any;
  readonly label: any;
}

interface FormattedData {
  readonly propertyName: string;
  readonly data: MultiSelect[];
}

function formatSelectData(item: QuestionnaireItem): FormattedData {
  if (item.answerOption?.length === 0) {
    return { propertyName: '', data: [] };
  }
  const option = (item.answerOption as QuestionnaireItemAnswerOption[])[0];
  const optionValue = getTypedPropertyValue(
    { type: 'QuestionnaireItemAnswerOption', value: option },
    'value',
  ) as TypedValue;
  const propertyName = 'value' + capitalize(optionValue.type);

  const data = (item.answerOption ?? []).map((a) => ({
    value: getValueAndLabel(a, propertyName),
    label: getValueAndLabel(a, propertyName),
  }));
  return { propertyName, data };
}

function getValueAndLabel(
  option: QuestionnaireItemAnswerOption,
  propertyName: string,
): string | undefined {
  return (
    formatCoding(option.valueCoding) ||
    option[propertyName as keyof QuestionnaireItemAnswerOption]?.toString()
  );
}
