import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/components/ui/sonner';
import { useOnboardingAnalytics } from '@/features/onboarding/hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useUpgradeCredit } from '@/features/orders/api';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { useUser } from '@/lib/auth';
import type { PaymentMethod, User } from '@/types/api';

import BundledDiscountStep from '../bundled-discount-step';

vi.mock('@/lib/auth', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/features/settings/hooks', () => ({
  usePaymentMethodSelection: vi.fn(),
}));

vi.mock('@/features/orders/api', () => ({
  useUpgradeCredit: vi.fn(),
}));

vi.mock('@/features/onboarding/hooks/use-onboarding-analytics', () => ({
  useOnboardingAnalytics: vi.fn(),
}));

vi.mock('@/features/onboarding/hooks/use-onboarding-navigation', () => ({
  useOnboardingNavigation: vi.fn(),
}));

vi.mock('@/features/users/components/payment', () => ({
  CurrentPaymentMethodCard: () => <div>Current payment method</div>,
}));

vi.mock('@/components/ui/sonner', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/ui/sonner')>();

  return {
    ...actual,
    toast: {
      ...actual.toast,
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{`$${value}`}</span>,
}));

const baseUser = {
  id: 'user-1',
  username: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'test@example.com',
  phone: '5555555555',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  subscribed: true,
  admin: false,
  authMethod: 'password',
  address: [],
  role: ['MEMBER'],
} satisfies User;

const basePaymentMethod = {
  stripePaymentMethodId: 'pm_stripe_123',
  stripeCustomerId: 'cus_123',
  billing_details: null,
  type: 'card',
  card: {
    brand: 'visa',
    country: 'US',
    exp_month: 1,
    exp_year: 2030,
    last4: '4242',
  },
  created: 1,
  default: true,
  paymentProvider: 'stripe',
  externalPaymentMethodId: 'pm_123',
} satisfies PaymentMethod;

const mutateAsyncMock = vi.fn();
const nextMock = vi.fn();
const trackOnboardingCreditPurchaseMock = vi.fn();

function makeUser(state?: string) {
  if (state == null) {
    return baseUser;
  }

  return {
    ...baseUser,
    primaryAddress: {
      id: 'address-1',
      line: ['100 Main St'],
      city: 'New York',
      state,
      postalCode: '10001',
      use: 'home',
    },
  } satisfies User;
}

describe('BundledDiscountStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useOnboardingNavigation).mockReturnValue({
      next: nextMock,
      prev: vi.fn(),
      goTo: vi.fn(),
      currentStep: 'bundled-discount',
      validSteps: ['bundled-discount', 'schedule-blood-draw'],
      isLastStep: false,
      isFirstStep: true,
    });

    vi.mocked(useOnboardingAnalytics).mockReturnValue({
      trackOnboardingCreditPurchase: trackOnboardingCreditPurchaseMock,
      trackOnboardingCreditAddedToCart: vi.fn(),
    });

    vi.mocked(usePaymentMethodSelection).mockReturnValue({
      paymentMethods: [basePaymentMethod],
      defaultPaymentMethod: basePaymentMethod,
      flexPaymentMethod: undefined,
      activePaymentMethod: basePaymentMethod,
      activePaymentMethodId: basePaymentMethod.externalPaymentMethodId,
      setActivePaymentMethod: vi.fn(),
      setSelectedPaymentMethodId: vi.fn(),
      startSelectingPaymentMethod: vi.fn(),
      stopSelectingPaymentMethod: vi.fn(),
      isFlexSelected: false,
      hasFlexPaymentMethod: false,
      isSelectingPaymentMethod: false,
      isLoading: false,
    });

    vi.mocked(useUpgradeCredit).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useUpgradeCredit>);
  });

  it('hides paid pricing and disables purchase while user pricing is unresolved', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
      isFetched: false,
    } as unknown as ReturnType<typeof useUser>);

    render(<BundledDiscountStep />);

    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.queryByText('+$169/yr')).not.toBeInTheDocument();
    expect(screen.queryByText('+$449/yr')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /buy additional testing now/i }),
    ).toBeDisabled();
  });

  it('uses resolved NY pricing for the purchase and analytics payload', async () => {
    mutateAsyncMock.mockResolvedValue({ credits: [] });

    vi.mocked(useUser).mockReturnValue({
      data: makeUser('NY'),
      isFetched: true,
    } as unknown as ReturnType<typeof useUser>);

    render(<BundledDiscountStep />);

    expect(screen.getByText('+$349/yr')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /buy additional testing now/i }),
    );

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        data: {
          upgradeType: 'baseline-bundle',
          paymentMethodId: 'pm_123',
          quantity: 1,
        },
      }),
    );

    expect(trackOnboardingCreditPurchaseMock).toHaveBeenCalledWith({
      credits: [{ id: 'baseline-bundle-1', price: 34900 }],
      totalValue: 34900,
      paymentProvider: 'stripe',
      flowContext: 'onboarding',
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Purchase of 1 additional test successful!',
    );
    expect(nextMock).toHaveBeenCalled();
  });
});
