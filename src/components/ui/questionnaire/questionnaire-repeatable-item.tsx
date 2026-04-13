import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { SanitizedRichText } from '@/components/shared/sanitized-rich-text';
import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { ConsentPaymentSummary } from './consent-payment-summary';
import { RX_CONSENT_PAYMENT_LINKID } from './const/special-linkids';
import {
  QUESTIONNAIRE_ITEM_CONTROL_EXTENSION_URL,
  SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL,
} from './const/system-urls';
import { QuestionnaireFormItem } from './questionnaire-item';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import { QuestionnaireItemType } from './utils';

interface QuestionnaireFormRepeatableItemProps {
  item: QuestionnaireItem;
  response?: QuestionnaireResponseItem;
  onChange: (items: QuestionnaireResponseItem[]) => void;
  onAutoSubmit?: () => void;
  nested?: boolean;
  isError?: boolean;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onValidationChange?: (linkId: string, hasError: boolean) => void;
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
  onAutoSubmit,
  nested,
  isError = false,
  onKeyDown,
  onValidationChange,
}: QuestionnaireFormRepeatableItemProps) => {
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );

  // If https://superpower.com/fhir/StructureDefinition/questionnaire-description is available in the extension array, use it as the description
  const description = item.extension?.find(
    (e) => e.url === SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL,
  )?.valueString;

  // If http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl is available in the extension, it is a multiple choice question
  const isMultipleChoice = item.extension?.find(
    (e) => e.url === QUESTIONNAIRE_ITEM_CONTROL_EXTENSION_URL,
  )?.valueCodeableConcept;

  const isRxConsentPaymentQuestion = item.linkId === RX_CONSENT_PAYMENT_LINKID;

  let autoSubmit: (() => void) | undefined;
  if (isRxConsentPaymentQuestion) {
    autoSubmit = onAutoSubmit;
  }

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
        onAutoSubmit={autoSubmit}
        isError={isError}
        onKeyDown={onKeyDown}
        onValidationChange={onValidationChange}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className={nested ? 'mb-2 mt-1.5' : 'mb-10'}>
        <SanitizedRichText
          content={item.text}
          textClassName={cn(
            nested
              ? 'mb-2 mt-1.5 text-base'
              : description || isMultipleChoice
                ? 'mb-3 text-2xl'
                : 'mb-5 text-2xl',
          )}
        />
        {description != null && description.length > 0 && (
          <SanitizedRichText
            content={description}
            variant="body2"
            textClassName="text-secondary"
          />
        )}
        {(description == null || description.length === 0) &&
          isMultipleChoice != null && (
            <Body1 className="text-secondary">Select all that apply.</Body1>
          )}
      </div>

      {isRxConsentPaymentQuestion && <ConsentPaymentSummary />}

      <QuestionnaireFormItem
        item={item}
        response={response}
        onChange={(r) => {
          onChange([r]);
        }}
        index={0}
        onAutoSubmit={autoSubmit}
        isError={isError}
        onKeyDown={onKeyDown}
        nested={nested}
        onValidationChange={onValidationChange}
      />
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
