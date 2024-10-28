import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';
import { NewRelicProvider } from '@/lib/newrelic';
import { queryConfig } from '@/lib/react-query';
import { StripeProvider } from '@/lib/stripe';

type AppProviderProps = {
  children: React.ReactNode;
};

function AuthLoader({ children }: { children: React.ReactNode }) {
  const { isFetched } = useUser();

  if (!isFetched) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" variant="primary" />
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
          <Spinner size="xl" variant="primary" />
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
