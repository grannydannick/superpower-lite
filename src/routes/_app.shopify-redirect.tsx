import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect } from 'react';
import * as z from 'zod';

import { Spinner } from '@/components/ui/spinner/spinner';
import { SUPPLEMENTS_MARKETPLACE_URL } from '@/const/marketplaces';
import { useGetMultipassUrl } from '@/features/supplements/api';

const shopifyRedirectSearchSchema = z.object({
  returnTo: z
    .string()
    .refine(
      (value) => value.startsWith('/') && !value.startsWith('//'),
      'returnTo must be a relative path',
    )
    .optional(),
});

export const Route = createFileRoute('/_app/shopify-redirect')({
  validateSearch: zodValidator(shopifyRedirectSearchSchema),
  component: ShopifyRedirectComponent,
});

function ShopifyRedirectComponent() {
  const returnTo = Route.useSearch({ select: (s) => s.returnTo });

  const {
    data: multipassData,
    isError,
    isFetching,
  } = useGetMultipassUrl({
    returnTo: returnTo,
    queryConfig: { retry: false },
  });

  useEffect(() => {
    if (multipassData?.url) {
      window.location.href = multipassData.url;
    }
  }, [multipassData]);

  useEffect(() => {
    if (isError && !isFetching) {
      window.location.href = SUPPLEMENTS_MARKETPLACE_URL;
    }
  }, [isError, isFetching]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
