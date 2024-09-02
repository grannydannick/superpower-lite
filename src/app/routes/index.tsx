import { QueryClient } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '@/lib/auth';

import { AppRoot } from './app/root';
import { usersLoader } from './app/users';

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      lazy: async () => {
        const { LandingRoute } = await import('./landing');
        return { Component: LandingRoute };
      },
    },
    {
      path: '/auth/register',
      lazy: async () => {
        const { RegisterRoute } = await import('./auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: '/auth/login',
      lazy: async () => {
        const { LoginRoute } = await import('./auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: '/auth/logout',
      lazy: async () => {
        const { LogoutRoute } = await import('./auth/logout');
        return { Component: LogoutRoute };
      },
    },
    {
      path: '/app',
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'timeline',
          lazy: async () => {
            const { TimelineRoute } = await import('./app/timeline');
            return { Component: TimelineRoute };
          },
        },
        {
          path: 'services',
          lazy: async () => {
            const { ServicesRoute } = await import('./app/services');
            return { Component: ServicesRoute };
          },
          // loader: async () => {
          //   const { servicesLoader } = await import('./app/services');
          //   return servicesLoader(queryClient)();
          // },
        },
        {
          path: 'onboarding',
          lazy: async () => {
            const { OnboardingRoute } = await import('./app/onboarding');
            return { Component: OnboardingRoute };
          },
        },
        {
          path: 'concierge',
          lazy: async () => {
            const { ConciergeRoute } = await import('./app/concierge');
            return { Component: ConciergeRoute };
          },
        },
        {
          path: 'data',
          lazy: async () => {
            const { DataRoute } = await import('./app/data');
            return { Component: DataRoute };
          },
        },
        {
          path: 'report',
          lazy: async () => {
            const { ReportRoute } = await import('./app/report');
            return { Component: ReportRoute };
          },
        },
        {
          path: 'users',
          lazy: async () => {
            const { UsersRoute } = await import('./app/users');
            return { Component: UsersRoute };
          },
          loader: usersLoader(queryClient),
        },
        {
          path: 'profile',
          lazy: async () => {
            const { ProfileRoute } = await import('./app/profile');
            return { Component: ProfileRoute };
          },
        },
      ],
    },
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('./not-found');
        return { Component: NotFoundRoute };
      },
    },
  ]);
