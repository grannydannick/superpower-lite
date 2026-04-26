import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { useProductByLegacyServiceId } from '../api/marketplace-products';

export function LegacyServiceBridge({ serviceId }: { serviceId: string }) {
  const navigate = useNavigate();
  const {
    data: product,
    isSuccess,
    isError,
    error,
  } = useProductByLegacyServiceId(serviceId);

  if (isError) {
    throw error;
  }

  if (isSuccess && !product) {
    throw new Error(`No product found for service ID: ${serviceId}`);
  }

  useEffect(() => {
    if (product?.slug) {
      void navigate({
        to: '/marketplace/products/$slug',
        params: { slug: product.slug },
        replace: true,
      });
    }
  }, [product, navigate]);

  return (
    <div className="flex h-48 w-full items-center justify-center">
      <Spinner variant="primary" size="lg" />
    </div>
  );
}
