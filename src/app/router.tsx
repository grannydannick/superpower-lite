import { useMemo } from 'react';
import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from 'react-router-dom';

import { MainErrorFallback } from '@/components/errors/main';
import { ConciergeLayout } from '@/features/messages/layouts/concierge-layout';
import { ProtectedRoute } from '@/lib/auth';

import { ConciergeRoute } from './routes/app/concierge';
import { protocolRoutes } from './routes/app/protocol/protocol-router';
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
      path: '/claim-benefit',
      lazy: async () => {
        const { ClaimBenefitRoute } = await import(
          './routes/auth/claim-benefit'
        );
        return { Component: ClaimBenefitRoute };
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
      path: '/check-email',
      lazy: async () => {
        const { CheckEmailRoute } = await import('./routes/auth/check-email');
        return { Component: CheckEmailRoute };
      },
    },
    {
      path: '/verify-email',
      lazy: async () => {
        const { VerifyEmailRoute } = await import('./routes/auth/verify-email');
        return { Component: VerifyEmailRoute };
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
          path: 'services',
          element: <Navigate to="/marketplace" replace />,
        },
        {
          path: 'services/:id',
          lazy: async () => {
            const { ServiceRoute } = await import('./routes/app/service');
            return { Component: ServiceRoute };
          },
        },
        {
          path: 'orders',
          lazy: async () => {
            const { OrdersRoute } = await import('./routes/app/orders');
            return { Component: OrdersRoute };
          },
        },
        {
          path: 'orders/:id',
          lazy: async () => {
            const { OrderRoute } = await import('./routes/app/order');
            return { Component: OrderRoute };
          },
        },
        {
          path: 'schedule',
          lazy: async () => {
            const { ScheduleRoute } = await import('./routes/app/schedule');
            return { Component: ScheduleRoute };
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
          path: 'questionnaire/:type',
          lazy: async () => {
            const { QuestionnaireRoute } = await import(
              './routes/app/questionnaire'
            );
            return { Component: QuestionnaireRoute };
          },
          loader: async () => {
            const { questionnaireLoader } = await import(
              './routes/app/questionnaire'
            );
            return questionnaireLoader()();
          },
        },
        // Vault is the old name for records and will redirect legacy users to the new route
        {
          path: 'vault',
          loader: async () => {
            return redirect('/data/records');
          },
        },
        {
          path: 'data/records',
          lazy: async () => {
            const { FilesRoute } = await import('./routes/app/files');
            return { Component: FilesRoute };
          },
        },
        {
          path: 'plans/:id',
          loader: async ({ params }) => {
            return redirect(`/protocol/plans/${params.id}`);
          },
        },
        // Protocol routes (see protocol-router.tsx for details)
        protocolRoutes,
        // Family risk routes
        {
          path: 'family-risk',
          children: [
            {
              path: 'plan',
              lazy: async () => {
                const { FamilyRiskPlanRoute } = await import(
                  './routes/app/family-risk/family-risk-plan'
                );
                return { Component: FamilyRiskPlanRoute };
              },
            },
          ],
        },
        {
          path: 'settings',
          lazy: async () => {
            const { SettingsRoute } = await import('./routes/app/settings');
            return { Component: SettingsRoute };
          },
        },
        {
          path: 'marketplace',
          lazy: async () => {
            const { MarketplaceRoute } = await import(
              './routes/app/marketplace'
            );
            return { Component: MarketplaceRoute };
          },
        },
        {
          path: 'prescriptions/:id',
          lazy: async () => {
            const { PrescriptionRoute } = await import(
              './routes/app/prescription'
            );
            return { Component: PrescriptionRoute };
          },
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
          lazy: async () => {
            const { DataRoute } = await import('./routes/app/data');
            return { Component: DataRoute };
          },
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
