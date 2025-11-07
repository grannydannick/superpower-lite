import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { ArrowLeftIcon, SmileIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2 } from '@/components/ui/typography';
// TODO: move User address components to a shared location so i don't have to do this hack.
// it's quite a lift so if someone could do this it would be greatly appreciated <3 ~A.S 11-03-2025
// eslint-disable-next-line import/no-restricted-paths
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useIdentityVerification } from '@/hooks/use-identity-verification';
import { cn } from '@/lib/utils';

import {
  RX_CONSENT_PAYMENT_LINKID,
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
}: QuestionnaireQuestionProps) => {
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    () => new Set(),
  );
  const checkForQuestionEnabled = useQuestionnaireStore(
    (s) => s.checkForQuestionEnabled,
  );
  const { nextStep, prevStep, activeStep, getLastQuestion } =
    useQuestionnaireStore((s) => s);
  const currentResponse = useQuestionnaireStore((s) => s.response);

  const showBackButton = activeStep > 0;
  const lastQuestion = getLastQuestion();
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

  const { needsVerification } = useIdentityVerification();
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
    if (
      !isLastQuestion &&
      e.key === 'Enter' &&
      !isResponseEmpty(item, response, checkForQuestionEnabled)
    ) {
      e.preventDefault();
      handleNextStep();
    }
  };

  const renderDisabledQuestion = () => (
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
            onClick={prevStep}
          >
            Back
          </Button>
        )}
        <Button type="button" className="w-full" onClick={handleNextStep}>
          {item.linkId === 'intro' ? 'I Understand' : 'Next'}
        </Button>
      </div>
    </div>
  );

  const renderGroupQuestion = () => {
    const shouldUseTwoColumns =
      item.item &&
      item.item.length &&
      item.item.length > 1 &&
      item.item.every((i) => {
        const type = i.type;
        return (
          type === QuestionnaireItemType.integer ||
          type === QuestionnaireItemType.string ||
          type === QuestionnaireItemType.decimal
        );
      });

    return (
      <div className="space-y-6">
        <div className="mb-10">
          <Body1
            className={cn('text-2xl', description ? 'mb-3' : 'mb-5')}
            // We need this to render hyperlinks
            // I don't see a case for XSS because the only way to edit this is in Medplum
            dangerouslySetInnerHTML={{ __html: item.text ?? '' }}
          />
          {description && (
            <Body2
              className="text-secondary"
              // We need this to render hyperlinks
              // I don't see a case for XSS because the only way to edit this is in Medplum
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            shouldUseTwoColumns ? 'md:grid-cols-2' : '',
          )}
        >
          {item.item?.map((nestedItem) => (
            <QuestionnaireFormRepeatableItem
              nested
              key={nestedItem.linkId}
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
              onKeyDown={handleKeyDown}
              onValidationChange={handleValidationChange}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderDisplayQuestion = () => (
    <div className="space-y-6">
      <Body1
        className={cn('text-2xl', isRxSafetyIntroQuestion && 'lg:text-3xl')}
      >
        {item.prefix}
      </Body1>
      <Body1
        className={cn(
          'mb-8 text-sm text-zinc-500',
          isRxSafetyIntroQuestion && 'text-base text-primary',
        )}
        // We need this to render hyperlinks
        // I don't see a case for XSS because the only way to edit this is in Medplum
        dangerouslySetInnerHTML={{ __html: item.text ?? '' }}
      />
      {isRxSafetyIntroQuestion && (
        <img src="/onboarding/rx.webp" alt="Superpower experience preview" />
      )}
      {isRxIdentityVerificationQuestion && (
        <>
          <img
            src="/rx/identity.png"
            alt="Identity verification"
            className="w-full rounded-3xl"
          />
          <IdentityVerificationButton buttonCopy="Verify" />
        </>
      )}
      {/* NOTE: we don't want members editing address mid-Rx questionnaire */}
      {isRxSafetyAddressQuestion && <CurrentAddressCard disableEdit={true} />}
      {description && (
        <Body2
          className="mb-10 text-secondary"
          // We need this to render hyperlinks
          // I don't see a case for XSS because the only way to edit this is in Medplum
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );

  const renderNavigationButtons = () => {
    const disableAdvance =
      Boolean(isResponseEmpty(item, response, checkForQuestionEnabled)) ||
      hasValidationErrors ||
      isIdentityVerificationBlocking;

    // Hide Next button on identity verification step until verified
    const hideNextButton =
      isRxIdentityVerificationQuestion && isIdentityVerificationBlocking;

    return (
      <div
        className={cn(
          'flex flex-col gap-2',
          isRxSafetyIntroQuestion ? 'mt-auto' : 'mt-12 md:mt-0',
        )}
      >
        {showBackButton && (
          <button
            tabIndex={-1}
            type="button"
            className="absolute -left-12 top-1 hidden text-zinc-400 transition-all hover:text-zinc-500 md:block"
            onClick={prevStep}
          >
            <ArrowLeftIcon />
          </button>
        )}
        {isLastQuestion ? (
          item.linkId === RX_CONSENT_PAYMENT_LINKID ? null : (
            <Button
              type="submit"
              className="ml-auto w-full md:w-[108px]"
              disabled={disableAdvance}
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
            {!item.required &&
              item.type !== QuestionnaireItemType.group &&
              item.type !== QuestionnaireItemType.display && (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto w-full bg-white hover:bg-white/75 md:w-[108px]"
                  onClick={handleNextStep}
                >
                  Skip
                </Button>
              )}
            <Button
              type="button"
              className={cn(
                'ml-auto w-full md:w-[108px]',
                item.type === QuestionnaireItemType.display && 'md:w-full',
              )}
              onClick={handleNextStep}
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
  };

  if (!checkForQuestionEnabled(item)) {
    return renderDisabledQuestion();
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
          'flex h-full flex-1 flex-col justify-between gap-6 md:translate-y-0',
          isRxSafetyIntroQuestion ? 'md:justify-between' : 'md:justify-start',
        )}
      >
        {item.type === QuestionnaireItemType.group ? (
          renderGroupQuestion()
        ) : item.type === QuestionnaireItemType.display ? (
          renderDisplayQuestion()
        ) : (
          <QuestionnaireFormRepeatableItem
            key={item.linkId}
            item={item}
            response={response}
            onChange={onChange}
            isError={localErrors.includes(item.linkId)}
            onKeyDown={handleKeyDown}
            onValidationChange={handleValidationChange}
          />
        )}
        {renderNavigationButtons()}
      </div>
    </div>
  );
};
