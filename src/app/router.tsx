import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ConciergeRoute } from '@/app/routes/app/concierge';
import { DataRoute } from '@/app/routes/app/data';
import { HomeRoute } from '@/app/routes/app/home';
import { MarketplaceRoute } from '@/app/routes/app/marketplace';
import { ServicesRoute } from '@/app/routes/app/services';
import { SettingsRoute } from '@/app/routes/app/settings';
import { MainErrorFallback } from '@/components/errors/main';
import { ConciergeLayout } from '@/features/messages/layouts/concierge-layout';
import { ProtectedRoute } from '@/lib/auth';

import { AppRoot } from './routes/app/root';
import { NotFoundRoute } from './routes/not-found';

export const createRouter = () =>
  createBrowserRouter([
    {
      path: '/register',
      lazy: async () => {
        const { RegisterRoute } = await import('./routes/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: '/signin',
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
      path: '/resetpassword',
      lazy: async () => {
        const { ResetPasswordRoute } = await import(
          './routes/auth/reset-password'
        );
        return { Component: ResetPasswordRoute };
      },
    },
    {
      path: '/setpassword/:id/:secret',
      lazy: async () => {
        const { SetPasswordRoute } = await import('./routes/auth/set-password');
        return { Component: SetPasswordRoute };
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
          element: <HomeRoute />,
        },
        {
          path: 'services',
          element: <ServicesRoute />,
          errorElement: <MainErrorFallback />,
        },
        {
          path: 'invite',
          lazy: async () => {
            const { AffiliateRoute } = await import('./routes/app/affiliate');
            return { Component: AffiliateRoute };
          },
        },
        {
          path: 'questionnaire/:type',
          lazy: async () => {
            const { QuestionnaireRoute } = await import(
              './routes/app/questionnaire'
            );
            return { Component: QuestionnaireRoute };
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
          path: 'plans/:id',
          lazy: async () => {
            const { PlanRoute } = await import('./routes/app/plan');
            return { Component: PlanRoute };
          },
        },
        {
          path: 'settings',
          element: <SettingsRoute />,
        },
        {
          path: 'marketplace',
          element: <MarketplaceRoute />,
        },
        {
          path: 'onboarding',
          lazy: async () => {
            const { OnboardingRoute } = await import('./routes/app/onboarding');
            return { Component: OnboardingRoute };
          },
          loader: async () => {
            const { onboardingLoader } = await import(
              './routes/app/onboarding'
            );
            return onboardingLoader()();
          },
          errorElement: <MainErrorFallback />,
        },
        {
          path: 'concierge',
          element: <ConciergeLayout />,
          children: [
            { index: true, element: <ConciergeRoute /> }, // new chat
            { path: ':id', element: <ConciergeRoute /> }, // existing chat
          ],
        },
        {
          path: 'data',
          element: <DataRoute />,
          errorElement: <MainErrorFallback />,
        },
        {
          path: 'users',
          lazy: async () => {
            const { UsersRoute } = await import('./routes/app/users');
            return { Component: UsersRoute };
          },
          errorElement: <MainErrorFallback />,
        },
      ],
    },
    {
      path: '*',
      element: (
        <ProtectedRoute>
          <NotFoundRoute />
        </ProtectedRoute>
      ),
    },
  ]);

export const AppRouter = () => {
  // const queryClient = useQueryClient();

  // we can later pass queryClient as createRouter(queryClient)
  // if we need direct access to it inside loader
  const router = useMemo(() => createRouter(), []);

  return <RouterProvider router={router} />;
};
