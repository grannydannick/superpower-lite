import {
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router';

import { AppLayout } from '@/components/layouts/app-layout';
import { Spinner } from '@/components/ui/spinner';

export const AppRoot = () => {
  const location = useLocation();
  const stripeRoutePrefixes = [
    '/schedule',
    '/orders',
    '/onboarding',
    '/questionnaire',
    '/settings',
    '/protocol/reveal',
  ];

  let needsStripe = false;
  for (const prefix of stripeRoutePrefixes) {
    if (location.pathname.startsWith(prefix)) {
      needsStripe = true;
      break;
    }
  }

  const [StripeProviderComponent, setStripeProviderComponent] =
    useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    if (!needsStripe) {
      return;
    }
    if (StripeProviderComponent) {
      return;
    }

    let active = true;

    import('@/lib/stripe')
      .then((mod) => {
        if (!active) return;
        setStripeProviderComponent(() => mod.StripeProvider);
      })
      .catch(() => {
        // ignore – stripe is only required for some flows
      });

    return () => {
      active = false;
    };
  }, [needsStripe, StripeProviderComponent]);

  let content: ReactNode = <Outlet />;

  if (needsStripe) {
    if (!StripeProviderComponent) {
      content = (
        <div className="flex size-full items-center justify-center">
          <Spinner size="xl" variant="primary" />
        </div>
      );
    } else {
      content = (
        <StripeProviderComponent>
          <Outlet />
        </StripeProviderComponent>
      );
    }
  }

  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex size-full items-center justify-center">
            <Spinner size="xl" variant="primary" />
          </div>
        }
      >
        <ErrorBoundary
          key={location.pathname}
          fallback={<div>Something went wrong!</div>}
        >
          {content}
        </ErrorBoundary>
      </Suspense>
    </AppLayout>
  );
};
