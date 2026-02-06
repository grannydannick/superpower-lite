import { useCallback, useEffect, useMemo } from 'react';

import { toast } from '@/components/ui/sonner';
import { KIT_SERVICES } from '@/const/services';
import { useCreateCredit } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { HealthcareService } from '@/types/api';

type UsePanelPurchaseOptions = {
  serviceName: string;
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
  onSuccess,
  onError,
  onUnavailable,
}: UsePanelPurchaseOptions): UsePanelPurchaseReturn => {
  const group = KIT_SERVICES.has(serviceName) ? 'test-kit' : 'phlebotomy';
  const servicesQuery = useServices({ group });
  const paymentMethodsQuery = usePaymentMethods();
  const createCreditMutation = useCreateCredit();

  const isLoading = servicesQuery.isLoading || paymentMethodsQuery.isLoading;

  const service = useMemo(() => {
    const services = servicesQuery.data?.services ?? [];
    return services.find((s) => s.name === serviceName);
  }, [servicesQuery.data?.services, serviceName]);

  const isAvailable = !isLoading && !!service?.price;

  const pricing = useMemo(() => {
    const priceInCents = service?.price ?? 0;
    return {
      originalPrice: Math.round(priceInCents * 1.1),
      salePrice: priceInCents,
      discountPercent: 10,
      totalPrice: priceInCents,
    };
  }, [service?.price]);

  const paymentMethodId = useMemo(() => {
    const methods = paymentMethodsQuery.data?.paymentMethods ?? [];
    return methods[0]?.externalPaymentMethodId;
  }, [paymentMethodsQuery.data?.paymentMethods]);

  // Auto-skip when service is unavailable after loading completes
  useEffect(() => {
    if (!isLoading && !service?.price && onUnavailable) {
      onUnavailable();
    }
  }, [isLoading, service?.price, onUnavailable]);

  const purchase = useCallback(async () => {
    if (!service?.id) {
      toast.error('Service not available');
      onError?.();
      return;
    }

    if (!paymentMethodId) {
      toast.error('No payment method available');
      onError?.();
      return;
    }

    try {
      await createCreditMutation.mutateAsync({
        data: {
          serviceIds: [service.id],
          paymentMethodId,
        },
      });
      toast.success('Purchase successful!');
      onSuccess?.();
    } catch (error) {
      toast.error('Purchase failed. Please try again later.');
      onError?.();
    }
  }, [service?.id, paymentMethodId, createCreditMutation, onSuccess, onError]);

  return {
    purchase,
    isPending: createCreditMutation.isPending,
    service,
    isLoading,
    isAvailable,
    pricing,
  };
};
