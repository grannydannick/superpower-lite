import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { ArrowLeftIcon, SmileIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
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
  RX_CONSENT_PAYMENT_LINKID,
  RX_CONSENT_QUESTION_LINKID,
  RX_IDENTITY_VERIFICATION_LINKID,
  RX_SAFETY_ADDRESS_LINKID,
  RX_SAFETY_INTRO_LINKID,
} from './const/special-linkids';
import { SUPERPOWER_QUESTIONNAIRE_DESCRIPTION_EXTENSION_URL } from './const/system-urls';
import { IdentityVerificationButton } from './identity-verification-button';
import { QuestionnaireFormRepeatableItem } from './questionnaire-repeatable-item';
import { useQuestionnaireStore } from './stores/questionnaire-store';
import {
  ensureNestedResponseItems,
  isResponseEmpty,
  QuestionnaireItemType,
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
  const prevStep = useQuestionnaireStore((s) => s.prevStep);
  const activeStep = useQuestionnaireStore((s) => s.activeStep);
  const lastQuestion = useQuestionnaireStore((s) => s.getLastQuestion());
  const currentResponse = useQuestionnaireStore((s) => s.response);

  const showBackButton = activeStep > 0;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <QuestionnaireDisabledQuestion
        item={item}
        showBackButton={showBackButton}
        onBack={prevStep}
        onNext={handleNextStep}
      />
    );
  }

  let questionContent: JSX.Element;
  if (item.type === QuestionnaireItemType.group) {
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
      className="relative flex h-full flex-1 flex-col space-y-4 pt-12 md:pt-0"
    >
      {showBackButton && (
        <button
          tabIndex={-1}
          type="button"
          className="text-zinc-400 transition-all hover:text-zinc-500 md:hidden"
          onClick={prevStep}
        >
          <ArrowLeftIcon />
        </button>
      )}
      <SuperpowerLogo className="size-32 h-12 md:hidden" />
      <div
        className={cn(
          'flex h-full flex-1 flex-col justify-between gap-6 md:translate-y-0 md:justify-start',
        )}
      >
        {questionContent}
        <QuestionnaireNavigationButtons
          item={item}
          response={response}
          showBackButton={showBackButton}
          onBack={prevStep}
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
  showBackButton: boolean;
  onBack: () => void;
  onNext: () => void;
}

function QuestionnaireDisabledQuestion({
  item,
  showBackButton,
  onBack,
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
        {showBackButton && (
          <Button
            type="button"
            className="w-full bg-white"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
        )}
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
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
                if (!response.item) {
                  response.item = [];
                }

                const existingItemIndex = response.item.findIndex(
                  (i) => i.linkId === nestedItem.linkId,
                );

                if (existingItemIndex >= 0) {
                  response.item[existingItemIndex] = newItems[0];
                } else {
                  response.item.push(newItems[0]);
                }

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
  showBackButton: boolean;
  onBack: () => void;
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
  showBackButton,
  onBack,
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
      {showBackButton && (
        <button
          tabIndex={-1}
          type="button"
          className="absolute -left-12 top-1 hidden text-zinc-400 transition-all hover:text-zinc-500 md:block"
          onClick={onBack}
        >
          <ArrowLeftIcon />
        </button>
      )}
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
