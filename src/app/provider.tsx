import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

import { MainErrorFallback } from '@/components/errors/main';
import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useUser } from '@/lib/auth';
import { NewRelicProvider } from '@/lib/newrelic';
import { queryConfig } from '@/lib/react-query';
import { StripeProvider } from '@/lib/stripe';

type AppProviderProps = {
  children: React.ReactNode;
};

function AuthLoader({ children }: { children: React.ReactNode }) {
  const userQuery = useUser();

  const [isDelayed, setIsDelayed] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (userQuery.isFetched) {
      // artificial timeout to make UI look better
      timer = setTimeout(() => {
        setIsDelayed(true);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [userQuery.isFetched]);

  if (!userQuery.isFetched || !isDelayed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SuperpowerLoadingLogo />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return children;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <TextShimmer>Superpower</TextShimmer>
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <NewRelicProvider>
              <StripeProvider>
                {import.meta.env.DEV && (
                  <ReactQueryDevtools buttonPosition="top-right" />
                )}
                <Toaster richColors />
                <AuthLoader>{children}</AuthLoader>
              </StripeProvider>
            </NewRelicProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
