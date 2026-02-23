import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main';
import { Toaster } from '@/components/ui/sonner';
import { PHProvider } from '@/lib/posthog';
import { queryConfig } from '@/lib/react-query';
import { router } from '@/router';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => {
    return new QueryClient({
      defaultOptions: queryConfig,
    });
  });

  const shouldRenderDevtools = import.meta.env.MODE === 'development';

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <PHProvider>
            <Toaster />
            {children}
            {shouldRenderDevtools ? (
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
            ) : null}
          </PHProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};
