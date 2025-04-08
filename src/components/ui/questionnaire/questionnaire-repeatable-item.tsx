import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { QuestionnaireFormItem } from './questionnaire-item';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import { QuestionnaireItemType } from './utils';

interface QuestionnaireFormRepeatableItemProps {
  item: QuestionnaireItem;
  response?: QuestionnaireResponseItem;
  onChange: (items: QuestionnaireResponseItem[]) => void;
  nested?: boolean;
  isError?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * This component is used to render a repeatable item in the questionnaire.
 * It takes an item, a response, and onChange and nested props.
 * It also takes an isError prop to display an error message if the item is in an error state.
 */
export const QuestionnaireFormRepeatableItem = ({
  item,
  response,
  onChange,
  nested,
  isError = false,
  onKeyDown,
}: QuestionnaireFormRepeatableItemProps) => {
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );

  // If https://superpower.com/fhir/StructureDefinition/questionnaire-description is available in the extension array, use it as the description
  const description = item.extension?.find(
    (e) =>
      e.url ===
      'https://superpower.com/fhir/StructureDefinition/questionnaire-description',
  )?.valueString;

  // If http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl is available in the extension, it is a multiple choice question
  const isMultipleChoice = item.extension?.find(
    (e) =>
      e.url ===
      'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  )?.valueCodeableConcept;

  if (!checkForQuestionEnabled(item)) {
    return null;
  }

  if (!response) {
    return null;
  }

  if (item.type === QuestionnaireItemType.display) {
    return <p key={item.linkId}>{item.text}</p>;
  }

  if (item.type === QuestionnaireItemType.boolean) {
    return (
      <QuestionnaireFormItem
        key={item.linkId}
        item={item}
        response={response}
        onChange={(r) => onChange([r])}
        index={0}
        isError={isError}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className={nested ? 'mb-2 mt-1.5' : 'mb-10'}>
        <Body1
          className={cn(
            nested
              ? 'text-base mb-2 mt-1.5'
              : description || isMultipleChoice
                ? 'text-2xl mb-3'
                : 'text-2xl mb-5',
          )}
          // This is needed to allow for a underline inside the question text
          // I don't see a case for XSS because the only way to edit this is in Medplum
          dangerouslySetInnerHTML={{ __html: item.text ?? '' }}
        />
        {(description || isMultipleChoice) && (
          <Body2 className="text-secondary">
            {description ?? (isMultipleChoice && 'Select all that apply.')}
          </Body2>
        )}
      </div>

      {/*Should be ...Array(number)*/}
      {[...Array(1)].map((_, index) => (
        <QuestionnaireFormItem
          key={`${item.linkId}-${index}`}
          item={item}
          response={response}
          onChange={(r) => {
            onChange([r]);
          }}
          index={index}
          isError={isError}
          onKeyDown={onKeyDown}
          nested={nested}
        />
      ))}
    </div>
  );
};

// function getNumberOfRepeats(
//   item: QuestionnaireItem,
//   response: QuestionnaireResponseItem,
// ): number {
//   if (
//     item.type === QuestionnaireItemType.choice ||
//     item.type === QuestionnaireItemType.openChoice
//   ) {
//     return 1;
//   }
//   const answers = response.answer;
//   return answers?.length ? answers.length : 1;
// }
