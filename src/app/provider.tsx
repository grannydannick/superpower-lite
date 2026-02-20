import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main';
import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { Toaster } from '@/components/ui/sonner';
import { useUser } from '@/lib/auth';
import { PHProvider } from '@/lib/posthog';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: React.ReactNode;
};

const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : null;

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
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <PHProvider>
            {ReactQueryDevtools ? (
              <React.Suspense fallback={null}>
                <ReactQueryDevtools buttonPosition="top-right" />
              </React.Suspense>
            ) : null}
            <Toaster />
            <AuthLoader>{children}</AuthLoader>
          </PHProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};
