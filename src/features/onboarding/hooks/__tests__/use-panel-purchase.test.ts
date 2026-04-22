import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/components/ui/sonner';
import { useOnboardingCartStore } from '@/features/add-on-panels/stores/add-on-panels-cart-store';
import { useCreateCredit } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { HealthcareService } from '@/types/api';

import { useOnboardingAnalytics } from '../use-onboarding-analytics';
import { usePanelPurchase } from '../use-panel-purchase';

vi.mock('@/components/ui/sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/features/services/api', () => ({
  useServices: vi.fn(),
}));

vi.mock('@/features/settings/api', () => ({
  usePaymentMethods: vi.fn(),
}));

vi.mock('@/features/orders/api/credits', () => ({
  useCreateCredit: vi.fn(),
}));

vi.mock('../use-onboarding-analytics', () => ({
  useOnboardingAnalytics: vi.fn(),
}));

const useServicesMock = vi.mocked(useServices, { partial: true });
const usePaymentMethodsMock = vi.mocked(usePaymentMethods, { partial: true });
const useCreateCreditMock = vi.mocked(useCreateCredit, { partial: true });
const useOnboardingAnalyticsMock = vi.mocked(useOnboardingAnalytics, {
  partial: true,
});

const mutateAsyncMock = vi.fn();
const trackOnboardingCreditPurchaseMock = vi.fn();
const trackOnboardingCreditAddedToCartMock = vi.fn();

const TEST_SERVICE: HealthcareService = {
  id: 'service-1',
  name: 'Synthetic Service',
  description: 'Synthetic description',
  price: 12500,
  active: true,
  additionalClassification: [],
  supportsLabOrder: false,
  bloodTubeCount: 2,
  group: 'phlebotomy',
};

interface PaymentMethodForHook {
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  billing_details: {
    postal_code: string | null;
  } | null;
  type: 'card' | 'klarna' | 'link';
  card?: {
    brand: string;
    country: string | null;
    exp_month: number;
    exp_year: number;
    last4: string;
  };
  klarna?: Record<string, never>;
  link?: Record<string, never>;
  created: number;
  default: boolean;
  paymentProvider: 'stripe' | 'flex';
  externalPaymentMethodId: string;
}

const TEST_PAYMENT_METHOD: PaymentMethodForHook = {
  stripePaymentMethodId: 'pm_1',
  stripeCustomerId: 'cus_1',
  billing_details: {
    postal_code: '94107',
  },
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
  externalPaymentMethodId: 'pm_1',
};

describe('usePanelPurchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useOnboardingCartStore.getState().clear();

    mutateAsyncMock.mockResolvedValue({});

    useServicesMock.mockReturnValue({
      data: {
        services: [TEST_SERVICE],
      },
      isLoading: false,
    });

    usePaymentMethodsMock.mockReturnValue({
      data: {
        defaultPaymentMethod: TEST_PAYMENT_METHOD.externalPaymentMethodId,
        paymentMethods: [TEST_PAYMENT_METHOD],
      },
      isLoading: false,
    });

    useCreateCreditMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });

    useOnboardingAnalyticsMock.mockReturnValue({
      trackOnboardingCreditPurchase: trackOnboardingCreditPurchaseMock,
      trackOnboardingCreditAddedToCart: trackOnboardingCreditAddedToCartMock,
    });
  });

  it('runs the existing direct-purchase flow by default', async () => {
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      usePanelPurchase({
        serviceName: TEST_SERVICE.name,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.purchase();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      data: {
        serviceIds: [TEST_SERVICE.id],
        paymentMethodId: 'pm_1',
      },
    });
    expect(trackOnboardingCreditPurchaseMock).toHaveBeenCalledWith({
      credits: [
        {
          id: TEST_SERVICE.id,
          price: TEST_SERVICE.price,
          name: TEST_SERVICE.name,
        },
      ],
      totalValue: TEST_SERVICE.price,
      paymentProvider: 'stripe',
      flowContext: 'onboarding',
    });
    expect(trackOnboardingCreditAddedToCartMock).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Purchase successful!');
    expect(useOnboardingCartStore.getState().selectedServiceIds.size).toBe(0);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('adds service to cart and skips checkout in add-to-cart mode', async () => {
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      usePanelPurchase({
        serviceName: TEST_SERVICE.name,
        mode: 'add-to-cart',
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.purchase();
    });

    const selectedServiceIds =
      useOnboardingCartStore.getState().selectedServiceIds;
    expect(selectedServiceIds.has(TEST_SERVICE.id)).toBe(true);
    expect(selectedServiceIds.size).toBe(1);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(trackOnboardingCreditPurchaseMock).not.toHaveBeenCalled();
    expect(trackOnboardingCreditAddedToCartMock).toHaveBeenCalledWith({
      id: TEST_SERVICE.id,
      price: TEST_SERVICE.price,
      flowContext: 'onboarding',
    });
    expect(toast.success).toHaveBeenCalledWith('Added to cart!');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not wait for payment methods to mark add-to-cart as unavailable', async () => {
    useServicesMock.mockReturnValue({
      data: {
        services: [],
      },
      isLoading: false,
    });

    usePaymentMethodsMock.mockReturnValue({
      isLoading: true,
    });

    const onUnavailable = vi.fn();

    renderHook(() =>
      usePanelPurchase({
        serviceName: TEST_SERVICE.name,
        mode: 'add-to-cart',
        onUnavailable,
      }),
    );

    await waitFor(() => {
      expect(onUnavailable).toHaveBeenCalledTimes(1);
    });
  });
});
