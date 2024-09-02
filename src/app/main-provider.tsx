import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';
import { queryClient } from '@/lib/react-query';
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
            <StripeProvider>
              {import.meta.env.DEV && <ReactQueryDevtools />}
              <Toaster richColors />
              <AuthLoader>{children}</AuthLoader>
            </StripeProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
