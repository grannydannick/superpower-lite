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
import { useState } from 'react';
import { useNavigate } from 'react-router';

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
import { getAccessCode } from '@/utils/access-code';
import { getReferralId } from '@/utils/referral-id';
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
  const elements = useElements();
  const stripe = useStripe();
  const navigate = useNavigate();
  const [stripeError, setStripeError] = useState<StripeError | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();
  const { data: user } = useUser();

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
          navigate('/check-email', {
            state: {
              email: user.email,
              origin: 'registration',
            },
          });
        } else {
          navigate('/onboarding');
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
    try {
      await createSubscriptionMutation.mutateAsync({
        data: {
          state: getState(postalCode)?.state ?? 'CA',
          code: getAccessCode() ?? undefined,
          referralId: getReferralId() ?? undefined,
          campaignData: undefined,
          paymentMethod,
          hsaFsaCheckoutSessionId,
        },
      });
    } catch (e) {
      console.error(e);
      toast.error((e as StripeError)?.message ?? 'An error occurred');
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
    try {
      // Create consent record with accepted = true if checked, false otherwise
      await createConsentMutation.mutateAsync({
        data: {
          agreedAt: new Date().toISOString(),
          type: ConsentType.PHI_MARKETING,
          accepted: phiMarketingConsent ?? false,
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

    try {
      // first trigger validation & ensure card number is valid
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        setStripeError(error);
        throw new Error(`Failed adding payment method: ${error.message}`);
      }

      // then do real test if card is valid, not stolen, etc
      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
            payment_method: paymentMethod?.id,
          },
          redirect: 'if_required',
        });

      const isValidSetupIntent =
        setupIntent?.status === 'succeeded' ||
        setupIntent?.status === 'processing';

      if (confirmSetupError || !isValidSetupIntent) {
        throw confirmSetupError;
      }

      const intentPm = setupIntent?.payment_method as string;

      if (!intentPm) {
        throw new Error('No payment method found in setup intent');
      }

      // create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(data?.phiMarketingConsent);

      // add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: intentPm },
      });

      if (!success) {
        throw new Error('Failed adding payment method');
      }

      // create subscription
      await createSubscription('card');
    } catch (e: any) {
      // this is stripe error
      if ('type' in e) {
        console.error(e);
        toast.error((e as StripeError)?.message ?? 'An error occurred');
      }
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

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        throw submitError;
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

      const isValidSetupIntent =
        setupIntent?.status === 'succeeded' ||
        setupIntent?.status === 'processing';

      if (confirmSetupError || !isValidSetupIntent) {
        throw confirmSetupError;
      }

      const paymentMethod = setupIntent?.payment_method as string;

      if (!paymentMethod) {
        throw new Error('No payment method found in setup intent');
      }

      // create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(data?.phiMarketingConsent);

      // add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: paymentMethod },
      });

      if (!success) {
        throw new Error('Failed adding payment method');
      }

      await createSubscription(event.expressPaymentType);
    } catch (e: any) {
      // this is stripe error
      if ('type' in e) {
        console.error(e);
        toast.error((e as StripeError)?.message ?? 'An error occurred');
      }
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

    try {
      // Create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      void createPhiMarketingConsent(data?.phiMarketingConsent);

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
        return;
      }

      // Create setup intent to validate the card
      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
            payment_method: paymentMethod?.id,
          },
          redirect: 'if_required',
        });

      const isValidSetupIntent =
        setupIntent?.status === 'succeeded' ||
        setupIntent?.status === 'processing';

      if (confirmSetupError || !isValidSetupIntent) {
        throw confirmSetupError;
      }

      const intentPm = setupIntent?.payment_method as string;

      if (!intentPm) {
        throw new Error('No payment method found in setup intent');
      }

      // Add payment method to user
      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: intentPm },
      });

      if (!success) {
        throw new Error('Failed to save payment method');
      }

      return true;
    } catch (error: any) {
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
