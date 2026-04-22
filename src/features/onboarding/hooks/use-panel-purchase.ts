import { useEffect } from 'react';

import { toast } from '@/components/ui/sonner';
import { KIT_SERVICES } from '@/const/services';
import { useOnboardingCartStore } from '@/features/add-on-panels/stores/add-on-panels-cart-store';
import { useCreateCredit } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { HealthcareService } from '@/types/api';

import { useOnboardingAnalytics } from './use-onboarding-analytics';

type UsePanelPurchaseOptions = {
  serviceName: string;
  mode?: 'direct-purchase' | 'add-to-cart';
  onSuccess?: () => void;
  onError?: () => void;
  /** Called when service is unavailable after loading completes */
  onUnavailable?: () => void;
};

type Pricing = {
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  totalPrice: number;
};

type UsePanelPurchaseReturn = {
  purchase: () => Promise<void>;
  isPending: boolean;
  service: HealthcareService | undefined;
  isLoading: boolean;
  isAvailable: boolean;
  pricing: Pricing;
};

export const usePanelPurchase = ({
  serviceName,
  mode = 'direct-purchase',
  onSuccess,
  onError,
  onUnavailable,
}: UsePanelPurchaseOptions): UsePanelPurchaseReturn => {
  const group = KIT_SERVICES.has(serviceName) ? 'test-kit' : 'phlebotomy';
  const servicesQuery = useServices({ group });
  const isDirectPurchase = mode === 'direct-purchase';
  const { activePaymentMethod, isLoading: isPaymentMethodsLoading } =
    usePaymentMethodSelection();
  const createCreditMutation = useCreateCredit();
  const addService = useOnboardingCartStore((s) => s.addService);
  const { trackOnboardingCreditPurchase, trackOnboardingCreditAddedToCart } =
    useOnboardingAnalytics();

  const isLoading =
    servicesQuery.isLoading || (isDirectPurchase && isPaymentMethodsLoading);
  const services = servicesQuery.data?.services ?? [];
  const service = services.find((s) => s.name === serviceName);
  const isAvailable = !isLoading && !!service?.price;
  const priceInCents = service?.price ?? 0;

  // Auto-skip when service is unavailable after loading completes.
  // Used by 10+ upsell detail panels that pass onUnavailable: next.
  useEffect(() => {
    if (!isLoading && !service?.price && onUnavailable) {
      onUnavailable();
    }
  }, [isLoading, service?.price, onUnavailable]);

  const purchase = async () => {
    if (!service?.id) {
      toast.error('Service not available');
      onError?.();
      return;
    }

    if (mode === 'add-to-cart') {
      addService(service.id);
      trackOnboardingCreditAddedToCart({
        id: service.id,
        price: service.price ?? 0,
        flowContext: 'onboarding',
      });
      toast.success('Added to cart!');
      onSuccess?.();
      return;
    }

    const paymentMethodId = activePaymentMethod?.externalPaymentMethodId;
    if (!paymentMethodId) {
      toast.error('No payment method available');
      onError?.();
      return;
    }

    try {
      await createCreditMutation.mutateAsync({
        data: { serviceIds: [service.id], paymentMethodId },
      });
    } catch {
      toast.error('Purchase failed. Please try again later.');
      onError?.();
      return;
    }

    trackOnboardingCreditPurchase({
      credits: [
        { id: service.id, price: service.price ?? 0, name: service.name },
      ],
      totalValue: service.price ?? 0,
      paymentProvider: activePaymentMethod?.paymentProvider ?? 'unknown',
      flowContext: 'onboarding',
    });
    toast.success('Purchase successful!');
    onSuccess?.();
  };

  return {
    purchase,
    isPending: isDirectPurchase ? createCreditMutation.isPending : false,
    service,
    isLoading,
    isAvailable,
    pricing: {
      originalPrice: Math.round(priceInCents * 1.1),
      salePrice: priceInCents,
      discountPercent: 10,
      totalPrice: priceInCents,
    },
  };
};
