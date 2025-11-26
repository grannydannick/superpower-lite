import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { ArrowLeftIcon, SmileIcon } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

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

import { ConsentPaymentSummary } from './consent-payment-summary';
import {
  RX_CONSENT_PAYMENT_GROUP_LINKID,
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
  isFrontDoorExperiment,
  isResponseEmpty,
  isSemaglutideByName,
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
 * Recursively merges current store items with initial response items to preserve pre-filled answers.
 * Strategy: Start with initialResponse items, then override with currentResponse items where linkIds match.
 * For group items, recursively merge nested items to preserve pre-filled nested answers.
 * This ensures pre-filled answers (like billing-period inside consent-payment group) are not lost.
 *
 * IMPORTANT: For front-door experiments and semaglutide questionnaires, billing-period and payment questions
 * are skipped in the UI but their pre-filled values MUST be preserved in the response for backend validation.
 */
const mergeStoredWithInitial = (
  currentItems: QuestionnaireResponseItem[],
  initialItems: QuestionnaireResponseItem[],
  response: QuestionnaireResponse,
): QuestionnaireResponseItem[] => {
  if (!initialItems || initialItems.length === 0) {
    return currentItems || [];
  }

  if (!currentItems || currentItems.length === 0) {
    return initialItems;
  }

  const isFrontDoor = isFrontDoorExperiment(response);

  // Create a map of current items by linkId for fast lookup
  const currentItemsMap = new Map<string, QuestionnaireResponseItem>();
  currentItems.forEach((item) => {
    if (item.linkId) {
      currentItemsMap.set(item.linkId, item);
    }
  });

  // Start with all initial items and override with current items where they exist
  const merged = initialItems.map((initialItem) => {
    // Skip items without linkId to prevent duplicates
    if (!initialItem.linkId) {
      return initialItem;
    }

    const currentItem = currentItemsMap.get(initialItem.linkId);

    // If user has modified this item
    if (currentItem) {
      // If both items have nested items (group question), recursively merge them
      if (Array.isArray(currentItem.item) && Array.isArray(initialItem.item)) {
        return {
          ...currentItem,
          item: mergeStoredWithInitial(
            currentItem.item,
            initialItem.item,
            response,
          ),
        };
      }
      // Otherwise use the current version (user's answer takes priority)
      return currentItem;
    }

    // Frontdoor skips billing-period/payment questions but needs prefilled values in the response for validation
    if (isFrontDoor && initialItem.linkId === 'consent-payment') {
      const currentConsentPayment = currentItemsMap.get('consent-payment');
      if (currentConsentPayment && Array.isArray(initialItem.item)) {
        const currentNestedMap = new Map<string, QuestionnaireResponseItem>();

        // Only process items with valid linkIds to prevent duplicates
        if (Array.isArray(currentConsentPayment.item)) {
          currentConsentPayment.item.forEach((nested) => {
            if (nested.linkId) {
              currentNestedMap.set(nested.linkId, nested);
            }
          });
        }

        // Merge all nested items from initial, preserving skipped ones
        const mergedNested = initialItem.item.map((initialNested) => {
          if (!initialNested.linkId) {
            return initialNested;
          }
          const currentNested = currentNestedMap.get(initialNested.linkId);
          return currentNested || initialNested;
        });

        // Add any new nested items from current that weren't in initial
        // Track which linkIds we've already processed to avoid duplicates
        const processedLinkIds = new Set(
          mergedNested.filter((item) => item.linkId).map((item) => item.linkId),
        );

        if (Array.isArray(currentConsentPayment.item)) {
          currentConsentPayment.item.forEach((nested) => {
            if (nested.linkId && !processedLinkIds.has(nested.linkId)) {
              mergedNested.push(nested);
              processedLinkIds.add(nested.linkId);
            }
          });
        }

        return {
          ...currentConsentPayment,
          item: mergedNested,
        };
      }
    }

    // Otherwise keep the pre-filled initial value
    return initialItem;
  });

  // Add any current items that weren't in initial (edge case)
  // Track which linkIds we've already processed to avoid duplicates
  const processedLinkIds = new Set(
    merged.filter((item) => item.linkId).map((item) => item.linkId),
  );

  currentItems.forEach((item) => {
    if (item.linkId && !processedLinkIds.has(item.linkId)) {
      merged.push(item);
      processedLinkIds.add(item.linkId);
    }
  });

  return merged;
};

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
  const initialResponse = useQuestionnaireStore((s) => s.initialResponse);
  const questionnaire = useQuestionnaireStore((s) => s.questionnaire);

  const showBackButton = activeStep > 0;
  const lastQuestion = getLastQuestion();
  const isLastQuestion = lastQuestion?.linkId === item.linkId;
  const hasValidationErrors = validationErrors.size > 0;

  const isFrontDoor = isFrontDoorExperiment(currentResponse);
  const isSemaglutide = questionnaire
    ? isSemaglutideByName(questionnaire)
    : false;

  const hasMergedRef = useRef<string | null>(null);

  // Merge billing defaults from initialResponse into store before render (for validation)
  useLayoutEffect(() => {
    const shouldMerge =
      item.type === QuestionnaireItemType.group &&
      initialResponse?.item &&
      item.linkId &&
      hasMergedRef.current !== item.linkId;

    if (shouldMerge) {
      const initialGroupItem = initialResponse?.item?.find(
        (i) => i.linkId === item.linkId,
      );
      if (initialGroupItem?.item) {
        // Check if any pre-filled nested items are missing from current response
        const missingItems: QuestionnaireResponseItem[] = [];
        // Find the current group item in response
        const currentGroupItem = response.item?.find(
          (r) => r.linkId === item.linkId,
        );

        initialGroupItem.item.forEach((initialNestedItem) => {
          const existsInResponse = currentGroupItem?.item?.some(
            (r) => r.linkId === initialNestedItem.linkId,
          );
          if (!existsInResponse && initialNestedItem.linkId) {
            missingItems.push(initialNestedItem);
          }
        });

        // Add missing items to store if any
        if (missingItems.length > 0) {
          const currentGroupIndex =
            response.item?.findIndex((r) => r.linkId === item.linkId) ?? -1;

          if (currentGroupIndex >= 0 && response.item) {
            const updatedGroupItem = {
              ...response.item[currentGroupIndex],
              item: [
                ...(response.item[currentGroupIndex].item || []),
                ...missingItems,
              ],
            };
            const updatedItems = [...response.item];
            updatedItems[currentGroupIndex] = updatedGroupItem;
            onChange([{ ...response, item: updatedItems }]);
            hasMergedRef.current = item.linkId;
          }
        } else {
          // Even if no missing items, mark as merged to avoid re-checking
          hasMergedRef.current = item.linkId;
        }
      }
    }
  }, [item.linkId, item.type, initialResponse, response, onChange]); // Run when dependencies change

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
      // Merge current store items with initial response to preserve pre-filled answers
      const mergedItems = mergeStoredWithInitial(
        currentResponse.item,
        initialResponse?.item || [],
        currentResponse,
      );
      onSave(mergedItems);
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

    const isConsentPaymentGroup =
      item.linkId === RX_CONSENT_PAYMENT_GROUP_LINKID;

    const shouldShowConsentPaymentSummary =
      isConsentPaymentGroup && !isFrontDoor && !isSemaglutide;

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
        {shouldShowConsentPaymentSummary && <ConsentPaymentSummary />}
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

    // Hide all navigation buttons for consent-payment group (has custom buttons)
    // Also hide for consent-payment.consent which has custom "Agree & continue" / "Cancel" buttons
    // Also hide for consent-payment.payment which has its own custom submit button
    const hideAllButtons =
      item.linkId === 'consent-payment' ||
      item.linkId === 'consent-payment.consent' ||
      item.linkId === 'consent-payment.payment';

    // Don't render any buttons for consent-payment group or consent question
    if (hideAllButtons) {
      return null;
    }

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
        {hideNextButton ? null : isLastQuestion ? (
          <Button
            type="submit"
            className="ml-auto w-full md:w-[108px]"
            disabled={disableAdvance}
          >
            Submit
          </Button>
        ) : (
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
