import { Suspense } from 'react';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';

import { AppLayout } from '@/components/layouts/app-layout';
import { Spinner } from '@/components/ui/spinner';

export const AppRoot = () => {
  const location = useLocation();
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
          <Outlet />
        </ErrorBoundary>
      </Suspense>
    </AppLayout>
  );
};
