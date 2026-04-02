import { useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/sonner';
import { useCreateConsent } from '@/features/announcements/api/create-consent';
import { useSendMagicLink } from '@/features/auth/api/send-magic-link';
import { useCheckoutContext } from '@/features/auth/stores';
import { useCreateBenefitClaim } from '@/features/b2b/api';
import { RegisterInput, useRegister } from '@/lib/auth';
import { getActiveLogin } from '@/lib/utils';
import { ConsentType, User } from '@/types/api';
import { getState } from '@/utils/verify-state-from-postal';

type UseB2BCheckoutOptions = {
  organizationId: string;
  onSuccess?: (
    loginEmail: string | undefined,
    options?: {
      shouldSendMagicLink?: boolean;
      hasExistingAccount?: boolean;
    },
  ) => Promise<void> | void;
};

type ProcessB2BCheckoutOptions = {
  claimGrantToken: string;
  benefitEmail: string;
  loginEmail: string;
  hasExistingAccount: boolean;
};

export const useB2BCheckout = ({
  organizationId,
  onSuccess,
}: UseB2BCheckoutOptions) => {
  const queryClient = useQueryClient();

  // mutations
  const claimBenefitsMutation = useCreateBenefitClaim();
  const registerMutation = useRegister();
  const sendMagicLinkMutation = useSendMagicLink();
  const createConsentMutation = useCreateConsent();

  // register/form context
  const { setProcessing, processing } = useCheckoutContext();

  /**
   * Ensure a user account exists before claiming benefits.
   *
   * @param data - Registration payload gathered earlier in the flow.
   */
  const createUserIfRequired = async (data?: RegisterInput) => {
    if (!data) return;

    const isLoggedIn = getActiveLogin()?.accessToken;
    if (!isLoggedIn) {
      await registerMutation.mutateAsync({
        ...data,
        state: getState(data.postalCode)?.state ?? 'CA',
      });
    } else {
      console.warn(
        'Access token already present for user, skipping registration...',
      );
    }
  };

  /**
   * Create PHI marketing consent based on user's checkbox selection.
   * This is a non-blocking operation - failures should not prevent checkout.
   */
  const createPhiMarketingConsent = async (phiMarketingConsent?: boolean) => {
    const accepted = phiMarketingConsent ?? false;

    try {
      await createConsentMutation.mutateAsync({
        data: {
          agreedAt: new Date().toISOString(),
          type: ConsentType.PHI_MARKETING,
          accepted,
        },
      });
    } catch (error) {
      console.error('Failed to create PHI marketing consent:', error);
    }
  };

  /**
   * Create membership agreement consent.
   * This is a non-blocking operation - failures should not prevent checkout.
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
      console.error('Failed to create membership agreement consent:', error);
    }
  };

  /**
   * Handle claiming B2B benefits.
   * Creates user (if needed), consents, claims benefits, sends magic link and navigates.
   */
  const submitBenefitClaim = async (
    data: RegisterInput | undefined,
    options: ProcessB2BCheckoutOptions,
  ) => {
    if (processing) return;

    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    const claimGrantToken = options.claimGrantToken.trim();
    if (!claimGrantToken) {
      toast.error(
        'Missing claim authorization. Please verify your benefit email again.',
      );
      return;
    }

    setProcessing(true);

    let phiMarketingConsent: boolean | undefined = undefined;
    if (data != null) {
      phiMarketingConsent = data.phiMarketingConsent;
    }

    try {
      // create user if data was passed
      await createUserIfRequired(data);

      // create consents (fire-and-forget, non-blocking)
      void createMembershipAgreementConsent();
      if (!options.hasExistingAccount) {
        void createPhiMarketingConsent(phiMarketingConsent);
      }

      // claim benefits
      await claimBenefitsMutation.mutateAsync({
        organizationId,
        claimGrantToken,
      });
      const benefitEmail = options.benefitEmail.trim().toLowerCase();
      const loginEmail = options.loginEmail.trim();
      const normalizedLoginEmail = loginEmail.toLowerCase();
      const shouldSendMagicLink =
        normalizedLoginEmail !== benefitEmail && !options.hasExistingAccount;

      /**
       * Optimistically mark the cached 'authenticated-user' as subscribed.
       * B2B users with claimed benefits are considered subscribed.
       */
      queryClient.setQueryData<User | undefined>(
        ['authenticated-user'],
        (old) => {
          if (old) return { ...old, subscribed: true };
          return old;
        },
      );

      if (shouldSendMagicLink) {
        // Send magic link
        await sendMagicLinkMutation.mutateAsync({
          data: {
            email: loginEmail,
            origin: 'registration',
          },
        });
      }

      if (onSuccess) {
        await onSuccess(shouldSendMagicLink ? loginEmail : undefined, {
          shouldSendMagicLink,
          hasExistingAccount: options.hasExistingAccount,
        });
      }

      /**
       * Invalidate the authenticated-user query so access flags (e.g. access.rx)
       * are refetched from the server after the benefit claim.
       */
      void queryClient.invalidateQueries({
        queryKey: ['authenticated-user'],
      });

      setProcessing(false);
    } catch (e) {
      console.error('Failed to claim benefits:', e);
      let errorMessage = 'Something went wrong. Please try again.';
      if (e instanceof Error && e.message) {
        errorMessage = e.message;
      }
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return {
    submitBenefitClaim,
  };
};
