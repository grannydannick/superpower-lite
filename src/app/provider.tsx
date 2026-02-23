import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main';
import { Toaster } from '@/components/ui/sonner';
import { PHProvider } from '@/lib/posthog';
import { queryClient } from '@/lib/react-query';
import { router } from '@/router';

const LazyDevtools =
  import.meta.env.MODE === 'development'
    ? lazy(async () => {
        const [
          TanStackDevtools,
          ReactQueryDevtoolsPanel,
          TanStackRouterDevtoolsPanel,
        ] = await Promise.all([
          import('@tanstack/react-devtools').then(
            ({ TanStackDevtools }) => TanStackDevtools,
          ),
          import('@tanstack/react-query-devtools').then(
            ({ ReactQueryDevtoolsPanel }) => ReactQueryDevtoolsPanel,
          ),
          import('@tanstack/react-router-devtools').then(
            ({ TanStackRouterDevtoolsPanel }) => TanStackRouterDevtoolsPanel,
          ),
        ]);

        return {
          default: () => (
            <TanStackDevtools
              config={{ position: 'top-right' }}
              plugins={[
                {
                  name: 'TanStack Query',
                  render: <ReactQueryDevtoolsPanel />,
                  defaultOpen: true,
                },
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel router={router} />,
                  defaultOpen: false,
                },
              ]}
            />
          ),
        };
      })
    : null;

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <PHProvider>
            <Toaster />
            {children}
            {LazyDevtools !== null ? (
              <Suspense>
                <LazyDevtools />
              </Suspense>
            ) : null}
          </PHProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};
