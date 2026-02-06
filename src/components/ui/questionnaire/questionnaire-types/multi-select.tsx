import {
  capitalize,
  formatCoding,
  getTypedPropertyValue,
  TypedValue,
} from '@medplum/core';
import {
  QuestionnaireItem,
  QuestionnaireItemInitial,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Body1 } from '@/components/ui/typography';

import { QuestionnaireErrorWrapper } from '../questionnaire-error-wrapper';
import { getNewMultiSelectValues } from '../utils';

import { RadioButtons } from './radio-buttons';

interface QuestionnaireChoiceInputProps {
  name: string;
  item: QuestionnaireItem;
  initial: QuestionnaireItemInitial | undefined;
  response: QuestionnaireResponseItem;
  isError: boolean;
  onChangeAnswer: (newResponseAnswer: any) => void;
}

export function QuestionnaireChoiceDropDownInput(
  props: QuestionnaireChoiceInputProps,
): JSX.Element {
  const { item, initial, response, isError } = props;
  const initialValue = getTypedPropertyValue(
    { type: 'QuestionnaireItemInitial', value: initial },
    'value',
  ) as TypedValue | undefined;

  const data: string[] = [];

  if (item.answerOption) {
    for (const option of item.answerOption) {
      const optionValue = getTypedPropertyValue(
        { type: 'QuestionnaireItemAnswerOption', value: option },
        'value',
      ) as TypedValue;
      data.push(typedValueToString(optionValue) as string);
    }
  }

  const defaultValue = getCurrentAnswer(response) ?? initialValue;

  if (!item.answerOption?.length) {
    return <></>;
  }

  if (item.repeats) {
    const { propertyName, data } = formatSelectData(props.item);
    const currentAnswer = getCurrentMultiSelectAnswer(response);

    return (
      <QuestionnaireErrorWrapper isError={isError}>
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
      </QuestionnaireErrorWrapper>
    );
  }

  return (
    <QuestionnaireErrorWrapper isError={isError}>
      <Select
        onValueChange={(value) => {
          const index = data.indexOf(value);

          if (index === -1) {
            return;
          }

          const option = (item.answerOption as any[])[index];
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
    </QuestionnaireErrorWrapper>
  );
}

export function QuestionnaireChoiceSetInput(
  props: QuestionnaireChoiceInputProps,
): JSX.Element {
  const { name, item, onChangeAnswer, response, isError } = props;

  if (!item.answerOption?.length && !item.answerValueSet) {
    return <></>;
  }

  if (item.answerValueSet) {
    return <Body1 className="text-pink-700 line-through">Not supported</Body1>;
  }

  return (
    <RadioButtons
      isError={isError}
      name={response?.id ?? name}
      item={item}
      response={response}
      onChangeAnswer={onChangeAnswer}
    />
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

interface MultiSelectOption {
  readonly value: any;
  readonly label: any;
}

interface FormattedData {
  readonly propertyName: string;
  readonly data: MultiSelectOption[];
}

function formatSelectData(item: QuestionnaireItem): FormattedData {
  if (item.answerOption?.length === 0) {
    return { propertyName: '', data: [] };
  }
  const option = (item.answerOption as any[])[0];
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
  option: any,
  propertyName: string,
): string | undefined {
  return formatCoding(option.valueCoding) || option[propertyName]?.toString();
}

function formatCodeableConcept(concept: any): string {
  if (!concept) {
    return '';
  }
  if (concept.text) {
    return concept.text;
  }
  if (concept.coding && concept.coding.length > 0) {
    return formatCoding(concept.coding[0]);
  }
  return JSON.stringify(concept);
}

function formatReferenceString(reference: any): string {
  if (!reference || !reference.value) {
    return '';
  }
  const value = reference.value;
  if (value.display) {
    return value.display;
  }
  if (value.reference) {
    return value.reference;
  }
  return JSON.stringify(value);
}
