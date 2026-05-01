import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { SmileIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { SanitizedRichText } from '@/components/shared/sanitized-rich-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
// TODO: move User address components to a shared location so i don't have to do this hack.
// it's quite a lift so if someone could do this it would be greatly appreciated <3 ~A.S 11-03-2025
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useIdentityVerificationStatus } from '@/hooks/use-identity-verification';
import { cn } from '@/lib/utils';

import {
  HEIGHT_FEET_LINKID,
  HEIGHT_INCHES_LINKID,
  HEIGHT_WEIGHT_GROUP_LINKID,
  RX_CONSENT_PAYMENT_LINKID,
  RX_CONSENT_QUESTION_LINKID,
  RX_IDENTITY_VERIFICATION_LINKID,
  RX_SAFETY_ADDRESS_LINKID,
  RX_SAFETY_INTRO_LINKID,
  WEIGHT_LBS_LINKID,
} from './const/special-linkids';
import { SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL } from './const/system-urls';
import { IdentityVerificationButton } from './identity-verification-button';
import { QuestionnaireFormRepeatableItem } from './questionnaire-repeatable-item';
import { HeightWeightGroup } from './questionnaire-types/height-weight-input';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import {
  ensureNestedResponseItems,
  isResponseEmpty,
  QuestionnaireItemType,
  upsertNestedResponse,
  validateRequiredFields,
} from './utils';

interface QuestionnaireQuestionProps {
  item: QuestionnaireItem;
  response: QuestionnaireResponseItem;
  onChange: (response: QuestionnaireResponseItem[]) => void;
  onSave: (response: QuestionnaireResponseItem[]) => void;
  onSubmit: () => void;
}

/**
 * This component is used to render a questionnaire question.
 * It takes an item, a response, and onChange and onSave functions.
 */
export const QuestionnaireQuestion = ({
  item,
  response,
  onChange,
  onSave,
  onSubmit,
}: QuestionnaireQuestionProps) => {
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    () => new Set(),
  );
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );
  const nextStep = useQuestionnaireStore((s) => s.nextStep);
  const lastQuestion = useQuestionnaireStore((s) => s.getLastQuestion());
  const currentResponse = useQuestionnaireStore((s) => s.response);

  const isLastQuestion = lastQuestion?.linkId === item.linkId;
  const hasValidationErrors = validationErrors.size > 0;

  const handleValidationChange = useCallback(
    (linkId: string, hasError: boolean) => {
      if (!linkId) {
        return;
      }
      setValidationErrors((prev) => {
        const alreadyErrored = prev.has(linkId);
        if (hasError && alreadyErrored) {
          return prev;
        }
        if (!hasError && !alreadyErrored) {
          return prev;
        }
        const next = new Set(prev);
        if (hasError) {
          next.add(linkId);
        } else {
          next.delete(linkId);
        }
        return next;
      });
    },
    [],
  );

  // If https://superpower.com/fhir/StructureDefinition/questionnaire-description is available in the extension array, use it as the description
  const description = item.extension?.find(
    (e) => e.url === SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL,
  )?.valueString;
  const isRxSafetyIntroQuestion = item.linkId === RX_SAFETY_INTRO_LINKID;
  const isRxSafetyAddressQuestion = item.linkId === RX_SAFETY_ADDRESS_LINKID;
  const isRxIdentityVerificationQuestion =
    item.linkId === RX_IDENTITY_VERIFICATION_LINKID;

  const { needsVerification } = useIdentityVerificationStatus();
  const isIdentityVerificationBlocking =
    isRxIdentityVerificationQuestion && needsVerification;

  const handleNextStep = () => {
    if (hasValidationErrors) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    ensureNestedResponseItems(item, response, onChange);

    if (currentResponse.item) {
      onSave(currentResponse.item);
    }

    if (isLastQuestion) {
      return;
    }

    if (!item.required) {
      if (localErrors.length > 0) {
        setLocalErrors([]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      nextStep();
      return;
    }

    const missingFields = validateRequiredFields(
      item,
      response,
      checkForQuestionEnabled,
    );

    if (missingFields) {
      setLocalErrors(missingFields);
      return;
    }

    setLocalErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    nextStep();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key !== 'Enter') {
      return;
    }

    const isEmpty = Boolean(
      isResponseEmpty(item, response, checkForQuestionEnabled),
    );

    if (!isLastQuestion) {
      if (isEmpty) {
        return;
      }

      e.preventDefault();
      handleNextStep();
      return;
    }

    if (item.required && isEmpty) {
      return;
    }

    e.preventDefault();
    onSubmit();
  };

  if (!checkForQuestionEnabled(item)) {
    return (
      <QuestionnaireDisabledQuestion item={item} onNext={handleNextStep} />
    );
  }

  const isHeightWeightGroup =
    item.linkId === HEIGHT_WEIGHT_GROUP_LINKID &&
    (item.item ?? []).some((i) => i.linkId === HEIGHT_FEET_LINKID) &&
    (item.item ?? []).some((i) => i.linkId === HEIGHT_INCHES_LINKID) &&
    (item.item ?? []).some((i) => i.linkId === WEIGHT_LBS_LINKID);

  let questionContent: React.ReactElement;
  if (isHeightWeightGroup) {
    questionContent = (
      <HeightWeightQuestion
        item={item}
        description={description}
        response={response}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onValidationChange={handleValidationChange}
        checkForQuestionEnabled={checkForQuestionEnabled}
      />
    );
  } else if (item.type === QuestionnaireItemType.group) {
    questionContent = (
      <QuestionnaireGroupQuestion
        item={item}
        description={description}
        response={response}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onValidationChange={handleValidationChange}
        checkForQuestionEnabled={checkForQuestionEnabled}
      />
    );
  } else if (item.type === QuestionnaireItemType.display) {
    questionContent = (
      <QuestionnaireDisplayQuestion
        item={item}
        description={description}
        isRxSafetyIntroQuestion={isRxSafetyIntroQuestion}
        isRxIdentityVerificationQuestion={isRxIdentityVerificationQuestion}
        isRxSafetyAddressQuestion={isRxSafetyAddressQuestion}
      />
    );
  } else {
    questionContent = (
      <QuestionnaireFormRepeatableItem
        key={item.linkId}
        item={item}
        response={response}
        onChange={onChange}
        onAutoSubmit={onSubmit}
        isError={localErrors.includes(item.linkId)}
        onKeyDown={handleKeyDown}
        onValidationChange={handleValidationChange}
      />
    );
  }

  return (
    <div
      key={item.linkId}
      className="relative flex h-full flex-1 flex-col space-y-4"
    >
      <div
        className={cn(
          'flex h-full flex-1 flex-col justify-between gap-6 md:translate-y-0 md:justify-start',
        )}
      >
        {questionContent}
        <QuestionnaireNavigationButtons
          item={item}
          response={response}
          onNext={handleNextStep}
          onSubmit={onSubmit}
          isLastQuestion={isLastQuestion}
          hasValidationErrors={hasValidationErrors}
          isIdentityVerificationBlocking={isIdentityVerificationBlocking}
          isRxSafetyIntroQuestion={isRxSafetyIntroQuestion}
          checkForQuestionEnabled={checkForQuestionEnabled}
        />
      </div>
    </div>
  );
};

interface QuestionnaireDisabledQuestionProps {
  item: QuestionnaireItem;
  onNext: () => void;
}

function QuestionnaireDisabledQuestion({
  item,
  onNext,
}: QuestionnaireDisabledQuestionProps) {
  return (
    <div className="space-y-6">
      <H2 className="italic">{item.text}</H2>
      <Alert>
        <SmileIcon className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You do not have to fill this section, move forward
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <Button type="button" className="w-full" onClick={onNext}>
          {item.linkId === 'intro' ? 'I Understand' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

interface QuestionnaireGroupQuestionProps {
  item: QuestionnaireItem;
  description: string | undefined;
  response: QuestionnaireResponseItem;
  onChange: (response: QuestionnaireResponseItem[]) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onValidationChange: (linkId: string, hasError: boolean) => void;
  checkForQuestionEnabled: (item: QuestionnaireItem) => boolean;
}

function QuestionnaireGroupQuestion({
  item,
  description,
  response,
  onChange,
  onKeyDown,
  onValidationChange,
  checkForQuestionEnabled,
}: QuestionnaireGroupQuestionProps) {
  const groupItems = (item.item ?? []).filter((nestedItem) =>
    checkForQuestionEnabled(nestedItem),
  );
  const shouldUseTwoColumns =
    groupItems.length > 1 &&
    groupItems.every((i) => {
      const type = i.type;
      return (
        type === QuestionnaireItemType.integer ||
        type === QuestionnaireItemType.string ||
        type === QuestionnaireItemType.decimal
      );
    });
  const shouldSpanLastItem = shouldUseTwoColumns && groupItems.length % 2 === 1;

  return (
    <div className="space-y-6">
      <div className="mb-10">
        <SanitizedRichText
          content={item.text}
          textClassName={cn('text-2xl', description ? 'mb-3' : 'mb-5')}
        />
        {description && (
          <SanitizedRichText
            content={description}
            textClassName="text-secondary"
          />
        )}
      </div>
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          shouldUseTwoColumns ? 'md:grid-cols-2' : '',
        )}
      >
        {groupItems.map((nestedItem, index) => (
          <div
            key={nestedItem.linkId}
            className={cn(
              shouldSpanLastItem && index === groupItems.length - 1
                ? 'md:col-span-2'
                : '',
            )}
          >
            <QuestionnaireFormRepeatableItem
              nested
              item={nestedItem}
              response={
                response.item?.find((i) => i.linkId === nestedItem.linkId) || {
                  linkId: nestedItem.linkId,
                }
              }
              onChange={(newItems) => {
                upsertNestedResponse(response, newItems[0]);
                onChange([response]);
              }}
              onKeyDown={onKeyDown}
              onValidationChange={onValidationChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeightWeightQuestionProps {
  item: QuestionnaireItem;
  description: string | undefined;
  response: QuestionnaireResponseItem;
  onChange: (response: QuestionnaireResponseItem[]) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onValidationChange: (linkId: string, hasError: boolean) => void;
  checkForQuestionEnabled: (item: QuestionnaireItem) => boolean;
}

function HeightWeightQuestion({
  item,
  description,
  response,
  onChange,
  onKeyDown,
  onValidationChange,
  checkForQuestionEnabled,
}: HeightWeightQuestionProps) {
  const groupItems = item.item ?? [];
  const itemsByLinkId = new Map(groupItems.map((i) => [i.linkId, i]));
  const feetItem = itemsByLinkId.get(HEIGHT_FEET_LINKID);
  const inchesItem = itemsByLinkId.get(HEIGHT_INCHES_LINKID);
  const weightItem = itemsByLinkId.get(WEIGHT_LBS_LINKID);
  if (!feetItem || !inchesItem || !weightItem) return null;

  const responsesByLinkId = new Map(
    (response.item ?? []).map((r) => [r.linkId, r]),
  );
  const getNum = (r: QuestionnaireResponseItem | undefined) =>
    r?.answer?.[0]?.valueDecimal ?? r?.answer?.[0]?.valueInteger;
  const feet = getNum(responsesByLinkId.get(feetItem.linkId));
  const inches = getNum(responsesByLinkId.get(inchesItem.linkId));
  const weightLbs = getNum(responsesByLinkId.get(weightItem.linkId));

  const upsertField = (fieldItem: QuestionnaireItem, value: number) => {
    const answer =
      fieldItem.type === QuestionnaireItemType.integer
        ? [{ valueInteger: value }]
        : [{ valueDecimal: value }];
    upsertNestedResponse(response, {
      linkId: fieldItem.linkId,
      text: fieldItem.text,
      answer,
    });
  };

  const heightWeightLinkIds = new Set([
    feetItem.linkId,
    inchesItem.linkId,
    weightItem.linkId,
  ]);
  const extraItems = groupItems.filter(
    (i) => !heightWeightLinkIds.has(i.linkId) && checkForQuestionEnabled(i),
  );

  return (
    <div className="space-y-6">
      <div className="mb-10">
        <SanitizedRichText
          content={item.text}
          textClassName={cn('text-2xl', description ? 'mb-3' : 'mb-5')}
        />
        {description && (
          <SanitizedRichText
            content={description}
            textClassName="text-secondary"
          />
        )}
      </div>
      <HeightWeightGroup
        feet={feet}
        inches={inches}
        weightLbs={weightLbs}
        onFeetChange={(f) => {
          upsertField(feetItem, f);
          onChange([response]);
        }}
        onInchesChange={(i) => {
          upsertField(inchesItem, i);
          onChange([response]);
        }}
        onWeightChange={(lbs) => {
          upsertField(weightItem, lbs);
          onChange([response]);
        }}
        onHeightChange={(f, i) => {
          upsertField(feetItem, f);
          upsertField(inchesItem, i);
          onChange([response]);
        }}
      />
      {extraItems.map((nestedItem) => (
        <QuestionnaireFormRepeatableItem
          key={nestedItem.linkId}
          nested
          item={nestedItem}
          response={
            response.item?.find((i) => i.linkId === nestedItem.linkId) || {
              linkId: nestedItem.linkId,
            }
          }
          onChange={(newItems) => {
            upsertNestedResponse(response, newItems[0]);
            onChange([response]);
          }}
          onKeyDown={onKeyDown}
          onValidationChange={onValidationChange}
        />
      ))}
    </div>
  );
}

interface QuestionnaireDisplayQuestionProps {
  item: QuestionnaireItem;
  description: string | undefined;
  isRxSafetyIntroQuestion: boolean;
  isRxIdentityVerificationQuestion: boolean;
  isRxSafetyAddressQuestion: boolean;
}

function QuestionnaireDisplayQuestion({
  item,
  description,
  isRxSafetyIntroQuestion,
  isRxIdentityVerificationQuestion,
  isRxSafetyAddressQuestion,
}: QuestionnaireDisplayQuestionProps) {
  return (
    <div className="space-y-6">
      <Body1
        className={cn('text-2xl', isRxSafetyIntroQuestion && 'lg:text-3xl')}
      >
        {item.prefix}
      </Body1>
      <SanitizedRichText
        content={item.text}
        textClassName={cn(
          'mb-8 text-zinc-500',
          isRxSafetyIntroQuestion && 'text-base text-primary',
          // We need to force orange link color for consistency. inline-links come with blue style attributes so important is needed.
          '[&>a]:!text-vermillion-900',
        )}
      />
      {isRxSafetyIntroQuestion && (
        <img
          src="/onboarding/questionnaire/rx.webp"
          alt="Superpower experience preview"
        />
      )}
      {isRxIdentityVerificationQuestion && (
        <>
          <img
            src="/rx/identity.webp"
            alt="Identity verification"
            className="w-full rounded-3xl"
          />
          <IdentityVerificationButton buttonCopy="Verify" />
        </>
      )}
      {/* NOTE: we don't want members editing address mid-Rx questionnaire */}
      {isRxSafetyAddressQuestion && <CurrentAddressCard disableEdit={true} />}
      {description && (
        <SanitizedRichText
          content={description}
          textClassName="mb-10 text-secondary"
        />
      )}
    </div>
  );
}

interface QuestionnaireNavigationButtonsProps {
  item: QuestionnaireItem;
  response: QuestionnaireResponseItem;
  onNext: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
  hasValidationErrors: boolean;
  isIdentityVerificationBlocking: boolean;
  isRxSafetyIntroQuestion: boolean;
  checkForQuestionEnabled: (item: QuestionnaireItem) => boolean;
}

function QuestionnaireNavigationButtons({
  item,
  response,
  onNext,
  onSubmit,
  isLastQuestion,
  hasValidationErrors,
  isIdentityVerificationBlocking,
  isRxSafetyIntroQuestion,
  checkForQuestionEnabled,
}: QuestionnaireNavigationButtonsProps) {
  const isEmpty = Boolean(
    isResponseEmpty(item, response, checkForQuestionEnabled),
  );
  const disableAdvance =
    (item.required && isEmpty) ||
    hasValidationErrors ||
    isIdentityVerificationBlocking;

  // Hide Next button on identity verification step until verified
  const hideNextButton = isIdentityVerificationBlocking;

  return (
    <div className={cn('mt-12 flex flex-col gap-2 md:mt-0')}>
      {isLastQuestion ? (
        item.linkId === RX_CONSENT_PAYMENT_LINKID ||
        item.linkId === RX_CONSENT_QUESTION_LINKID ? null : (
          <Button
            type="button"
            className="ml-auto w-full"
            disabled={disableAdvance}
            onClick={onSubmit}
          >
            Submit
          </Button>
        )
      ) : hideNextButton ? null : (
        <div
          className={cn(
            'ml-auto flex w-full flex-col-reverse gap-4 md:w-auto md:flex-row',
            item.type === QuestionnaireItemType.display && 'md:w-full',
          )}
        >
          <Button
            type="button"
            className="w-full"
            onClick={onNext}
            disabled={disableAdvance}
          >
            {isRxSafetyIntroQuestion
              ? 'Start'
              : item.linkId === 'intro'
                ? 'I Understand'
                : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}
