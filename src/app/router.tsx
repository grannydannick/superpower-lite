import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ProtectedRoute } from '@/lib/auth';

import { AppRoot } from './routes/app/root';
import { usersLoader } from './routes/app/users';

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/register',
      lazy: async () => {
        const { RegisterRoute } = await import('./routes/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: '/login',
      lazy: async () => {
        const { LoginRoute } = await import('./routes/auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: '/logout',
      lazy: async () => {
        const { LogoutRoute } = await import('./routes/auth/logout');
        return { Component: LogoutRoute };
      },
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '',
          lazy: async () => {
            const { HomeRoute } = await import('./routes/app/home');
            return { Component: HomeRoute };
          },
        },
        {
          path: 'timeline',
          lazy: async () => {
            const { TimelineRoute } = await import('./routes/app/timeline');
            return { Component: TimelineRoute };
          },
        },
        {
          path: 'services',
          lazy: async () => {
            const { ServicesRoute } = await import('./routes/app/services');
            return { Component: ServicesRoute };
          },
          loader: async () => {
            const { servicesLoader } = await import('./routes/app/services');
            return servicesLoader(queryClient)();
          },
        },
        {
          path: 'invite',
          lazy: async () => {
            const { AffiliateRoute } = await import('./routes/app/affiliate');
            return { Component: AffiliateRoute };
          },
        },
        {
          path: 'vault',
          lazy: async () => {
            const { FilesRoute } = await import('./routes/app/files');
            return { Component: FilesRoute };
          },
        },
        {
          path: 'vault/:fileId',
          lazy: async () => {
            const { MobileFileRoute } = await import('./routes/app/file');
            return { Component: MobileFileRoute };
          },
        },
        {
          path: 'plans/:orderId',
          lazy: async () => {
            const { PlanRoute } = await import('./routes/app/plan');
            return { Component: PlanRoute };
          },
        },
        {
          path: 'settings',
          lazy: async () => {
            const { SettingsRoute } = await import('./routes/app/settings');
            return { Component: SettingsRoute };
          },
        },
        {
          path: 'onboarding',
          lazy: async () => {
            const { OnboardingRoute } = await import('./routes/app/onboarding');
            return { Component: OnboardingRoute };
          },
        },
        {
          path: 'concierge',
          lazy: async () => {
            const { ConciergeRoute } = await import('./routes/app/concierge');
            return { Component: ConciergeRoute };
          },
        },
        {
          path: 'data',
          lazy: async () => {
            const { DataRoute } = await import('./routes/app/data');
            return { Component: DataRoute };
          },
          loader: async () => {
            const { dataLoader } = await import('./routes/app/data');
            return dataLoader(queryClient)();
          },
        },
        {
          path: 'report',
          lazy: async () => {
            const { ReportRoute } = await import('./routes/app/report');
            return { Component: ReportRoute };
          },
        },
        {
          path: 'rdns',
          lazy: async () => {
            const { RdnsRoute } = await import('./routes/app/rdns');
            return { Component: RdnsRoute };
          },
        },
        {
          path: 'users',
          lazy: async () => {
            const { UsersRoute } = await import('./routes/app/users');
            return { Component: UsersRoute };
          },
          loader: usersLoader(queryClient),
        },
        {
          path: 'profile',
          lazy: async () => {
            const { ProfileRoute } = await import('./routes/app/profile');
            return { Component: ProfileRoute };
          },
        },
      ],
    },
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('./routes/not-found');
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};
