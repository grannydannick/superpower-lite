import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import type { Decorator } from '@storybook/react';

import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

const withRouter: Decorator = (Story) => {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const storyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <Story />,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([storyRoute]),
    history: createMemoryHistory({
      initialEntries: ['/'],
      initialIndex: 0,
    }),
  });

  void router.load({ sync: true });

  return <RouterProvider router={router} />;
};

export const decorators = [withRouter];
