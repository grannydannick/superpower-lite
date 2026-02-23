import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  StripeError,
  StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { useCreateConsent } from '@/features/announcements/api/create-consent';
import { useSendMagicLink } from '@/features/auth/api/send-magic-link';
import { useCheckoutContext } from '@/features/auth/stores';
import {
  useAddPaymentMethod,
  useCreateSetupIntent,
  useCreateSubscription,
} from '@/features/settings/api';
import { RegisterInput, useRegister, useUser } from '@/lib/auth';
import { getActiveLogin } from '@/lib/utils';
import { ConsentType, User } from '@/types/api';
import { getAccessCode, useAccessCode } from '@/utils/access-code';
import { useReferralId } from '@/utils/referral-id';
import { getState } from '@/utils/verify-state-from-postal';

export const useCheckout = ({
  postalCode,
  onSuccess,
  skipEmailRedirect = false,
}: {
  postalCode: string;
  onSuccess?: () => Promise<void>;
  skipEmailRedirect?: boolean;
}) => {
  'use no memo';

  const elements = useElements();
  const stripe = useStripe();
  const navigate = useNavigate();
  const [stripeError, setStripeError] = useState<StripeError | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const accessCodeFromSearch = useAccessCode();
  const referralId = useReferralId();

  // queries / mutations
  const addPaymentMethodMutation = useAddPaymentMethod();
  const createSubscriptionMutation = useCreateSubscription({
    mutationConfig: {
      onSuccess: async () => {
        /**
         * Optimistically mark the cached 'authenticated-user' as subscribed.
         *
         * @remarks
         * The `subscribed` flag is updated asynchronously by an
         * "after-subscription-created" backend subscriber that runs *after*
         * the create-subscription API call resolves. Once that call succeeds,
         * we know the user will be subscribed, so we update the cache immediately
         * for a snappy UI. A later refetch/invalidations will reconcile with
         * the server if needed.
         */
        queryClient.setQueryData<User | undefined>(
          ['authenticated-user'],
          (old) => {
            console.warn(old);
            if (old) return { ...old, subscribed: true };

            return old;
          },
        );

        await onSuccess?.();

        if (user?.email && !skipEmailRedirect) {
          // Send magic link
          await sendMagicLinkMutation.mutateAsync({
            data: {
              email: user.email,
              origin: 'registration',
            },
          });

          // Navigate to check email screen with email in React Router state
          void navigate({
            to: '/check-email',
            state: {
              email: user.email,
              origin: 'registration',
            },
          });
        } else {
          void navigate({ to: '/onboarding' });
        }

        // Reset processing state after navigation to prevent UI flash
        setProcessing(false);
      },
    },
  });
  const setupIntentMutation = useCreateSetupIntent();
  const registerMutation = useRegister();
  const sendMagicLinkMutation = useSendMagicLink();
  const createConsentMutation = useCreateConsent();

  // register/form context
  const { membership, setProcessing, processing } = useCheckoutContext();

  const createSubscription = async (
    paymentMethod: string,
    hsaFsaCheckoutSessionId?: string,
  ) => {
    setProcessing(true);

    const stateLookup = getState(postalCode);
    let stateValue = 'CA';
    if (stateLookup?.state != null) {
      stateValue = stateLookup.state;
    }

    const accessCode = getAccessCode() ?? accessCodeFromSearch;
    const accessCodeValue = accessCode == null ? undefined : accessCode;

    const referralIdValue = referralId == null ? undefined : referralId;

    try {
      await createSubscriptionMutation.mutateAsync({
        data: {
          state: stateValue,
          code: accessCodeValue,
          referralId: referralIdValue,
          campaignData: undefined,
          paymentMethod,
          hsaFsaCheckoutSessionId,
        },
      });
    } catch (e) {
      console.error(e);

      let errorMessage = 'An error occurred';
      if (typeof e === 'object') {
        if (e !== null) {
          if ('message' in e) {
            const messageValue = e.message;
            if (typeof messageValue === 'string') {
              if (messageValue.length > 0) {
                errorMessage = messageValue;
              }
            }
          }
        }
      } else if (typeof e === 'string') {
        if (e.length > 0) {
          errorMessage = e;
        }
      }

      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  /**
   * Ensure a user account exists before attaching a payment method or creating a subscription.
   *
   * @param data - Registration payload gathered earlier in the flow. If absent, nothing is done.
   *
   * @why
   * - Users can arrive here unauthenticated (direct entry, refresh, deep-link).
   * - We must have an authenticated account before adding a payment method or creating a subscription.
   * - If a previous attempt created the account but payment failed midway,
   *   a naive retry would call `register` again and the backend would return
   *   "user already exists". To avoid noisy errors and wasted network calls,
   *   we **skip registration when an access token is already present**.
   *
   * @behavior
   * - If there is **no** active session (no access token) and `data` is provided → register now.
   * - If there **is** an active session → skip registration.
   */
  const createUserIfRequired = async (data?: RegisterInput) => {
    if (!data) return;

    const isLoggedIn = getActiveLogin()?.accessToken;
    console.warn('Register data was passed, creating account first');

    if (!isLoggedIn) {
      await registerMutation.mutateAsync(data);
    } else {
      console.warn(
        'Access token already present for user, skipping registration...',
      );
    }
  };

  /**
   * Create PHI marketing consent based on user's checkbox selection.
   * This is a non-blocking operation - failures should not prevent checkout.
   *
   * @param phiMarketingConsent - Optional boolean from the form (undefined if not checked)
   */
  const createPhiMarketingConsent = async (phiMarketingConsent?: boolean) => {
    const acceptedValue = phiMarketingConsent === true;

    try {
      // Create consent record with accepted = true if checked, false otherwise
      await createConsentMutation.mutateAsync({
        data: {
          agreedAt: new Date().toISOString(),
          type: ConsentType.PHI_MARKETING,
          accepted: acceptedValue,
        },
      });
    } catch (error) {
      // Log error but don't block checkout
      console.error('Failed to create PHI marketing consent:', error);
    }
  };

  /**
   * Create membership agreement consent.
   * This is a non-blocking operation - failures should not prevent checkout.
   * Always accepted as true since it's a mandatory checkbox to proceed.
   */
  const createMembershipAgreementConsent = async () => {
    try {
      await createConsentMutation.mutateAsync({
        data: {
          agreedAt: new Date().toISOString(),
          type: ConsentType.MEMBERSHIP_AGREEMENT,
          accepted: true,
        },
      });
    } catch (error) {
      // Log error but don't block checkout
      console.error('Failed to create membership agreement consent:', error);
    }
  };

  const handleCardNumberPayment = async (data?: RegisterInput) => {
    // safety check
    if (processing) return;

    if (!stripe || !elements) {
      toast.error('Payment provider is not ready yet.');
      return;
    }

    if (!membership) {
      toast.error('No memberships available for your state. Contact support.');
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      return;
    }

    setProcessing(true);

    let phiMarketingConsent: boolean | undefined = undefined;
    if (data) {
      phiMarketingConsent = data.phiMarketingConsent;
    }

    try {
      // first trigger validation & ensure card number is valid
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        setStripeError(error);
        let errorMessage = 'An error occurred';
        if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      if (!paymentMethod) {
        toast.error('An error occurred');
        setProcessing(false);
        return;
      }

      const paymentMethodId = paymentMethod.id;

      // then do real test if card is valid, not stolen, etc
      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
            payment_method: paymentMethodId,
          },
          redirect: 'if_required',
        });

      if (confirmSetupError) {
        setStripeError(confirmSetupError);
        let errorMessage = 'An error occurred';
        if (confirmSetupError.message) {
          errorMessage = confirmSetupError.message;
        }
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      if (!setupIntent) {
        toast.error('Something went wrong. Please try again.');
        setProcessing(false);
        return;
      }

      const status = setupIntent.status;
      if (status !== 'succeeded') {
        if (status !== 'processing') {
          toast.error('Something went wrong. Please try again.');
          setProcessing(false);
          return;
        }
      }

      const intentPaymentMethod = setupIntent.payment_method;
      if (typeof intentPaymentMethod !== 'string') {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return;
      }

      if (intentPaymentMethod.length === 0) {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return;
      }

      // create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(phiMarketingConsent);

      // add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: intentPaymentMethod },
      });

      if (!success) {
        toast.error('Failed adding payment method');
        setProcessing(false);
        return;
      }

      // create subscription
      await createSubscription('card');
    } catch (e) {
      console.error(e);

      let errorMessage = 'An error occurred';
      if (e instanceof Error) {
        if (e.message) {
          errorMessage = e.message;
        }
      }
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const handleDigitalWalletPayment = async (
    event: StripeExpressCheckoutElementConfirmEvent,
    data?: RegisterInput,
  ) => {
    // safety check
    if (processing) return;

    if (!stripe || !elements) {
      toast.error('Payment provider is not ready yet.');
      return;
    }

    if (!membership) {
      toast.error('No memberships available for your state. Contact support.');
      return;
    }

    setProcessing(true);

    let phiMarketingConsent: boolean | undefined = undefined;
    if (data) {
      phiMarketingConsent = data.phiMarketingConsent;
    }

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setStripeError(submitError);
        let errorMessage = 'An error occurred';
        if (submitError.message) {
          errorMessage = submitError.message;
        }
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          elements,
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
          },
          redirect: 'if_required',
        });

      if (confirmSetupError) {
        setStripeError(confirmSetupError);
        let errorMessage = 'An error occurred';
        if (confirmSetupError.message) {
          errorMessage = confirmSetupError.message;
        }
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      if (!setupIntent) {
        toast.error('Something went wrong. Please try again.');
        setProcessing(false);
        return;
      }

      const status = setupIntent.status;
      if (status !== 'succeeded') {
        if (status !== 'processing') {
          toast.error('Something went wrong. Please try again.');
          setProcessing(false);
          return;
        }
      }

      const paymentMethod = setupIntent.payment_method;
      if (typeof paymentMethod !== 'string') {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return;
      }

      if (paymentMethod.length === 0) {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return;
      }

      // create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(phiMarketingConsent);

      // add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: paymentMethod },
      });

      if (!success) {
        toast.error('Failed adding payment method');
        setProcessing(false);
        return;
      }

      await createSubscription(event.expressPaymentType);
    } catch (e) {
      console.error(e);

      let errorMessage = 'An error occurred';
      if (e instanceof Error) {
        if (e.message) {
          errorMessage = e.message;
        }
      }
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const handleHSAFSAPayment = async (
    paymentData: any,
    data?: RegisterInput,
  ) => {
    if (processing) return;

    if (!membership) {
      toast.error('No memberships available for your state. Contact support.');
      return;
    }

    const checkoutSessionId =
      paymentData?.object?.checkout_session?.checkout_session_id;

    if (!checkoutSessionId) {
      toast.error('Something went wrong. Please try again.');
      return;
    }

    setProcessing(true);

    let phiMarketingConsent: boolean | undefined = undefined;
    if (data) {
      phiMarketingConsent = data.phiMarketingConsent;
    }

    try {
      // Create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(phiMarketingConsent);

      // Create subscription with HSA/FSA checkout session ID so backend can process accordingly
      await createSubscription('hsa_fsa', checkoutSessionId);
    } catch (e: any) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  /**
   * Adds a payment method without creating a subscription (for backup payment methods on the update-info screen)
   */
  const handleAddPaymentMethod = async () => {
    if (!stripe || !elements) {
      toast.error('Payment provider is not ready yet.');
      return false;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      return false;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        setStripeError(error);
        setProcessing(false);
        return false;
      }

      if (!paymentMethod) {
        toast.error('An error occurred');
        setProcessing(false);
        return false;
      }

      const paymentMethodId = paymentMethod.id;

      // Create setup intent to validate the card
      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
            payment_method: paymentMethodId,
          },
          redirect: 'if_required',
        });

      if (confirmSetupError) {
        setStripeError(confirmSetupError);
        let errorMessage = 'An error occurred';
        if (confirmSetupError.message) {
          errorMessage = confirmSetupError.message;
        }
        toast.error(errorMessage);
        setProcessing(false);
        return false;
      }

      if (!setupIntent) {
        toast.error('Something went wrong. Please try again.');
        setProcessing(false);
        return false;
      }

      const status = setupIntent.status;
      if (status !== 'succeeded') {
        if (status !== 'processing') {
          toast.error('Something went wrong. Please try again.');
          setProcessing(false);
          return false;
        }
      }

      const intentPaymentMethod = setupIntent.payment_method;
      if (typeof intentPaymentMethod !== 'string') {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return false;
      }

      if (intentPaymentMethod.length === 0) {
        toast.error('No payment method found in setup intent');
        setProcessing(false);
        return false;
      }

      // Add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: intentPaymentMethod },
      });

      if (!success) {
        toast.error('Failed to save payment method');
        setProcessing(false);
        return false;
      }

      return true;
    } catch (error) {
      setProcessing(false);
      console.error('Error adding payment method:', error);
      toast.error(
        'Something went wrong when adding your card. Please try again.',
      );
      return false;
    }
  };

  return {
    handleDigitalWalletPayment,
    handleCardNumberPayment,
    handleHSAFSAPayment,
    handleAddPaymentMethod,
    stripeError,
    setStripeError,
    isMutationPending:
      createSubscriptionMutation.isPending ||
      registerMutation.isPending ||
      setupIntentMutation.isPending ||
      addPaymentMethodMutation.isPending,
  };
};
