import { createRouter } from '@tanstack/react-router';

import { queryClient } from '@/lib/react-query';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface HistoryState {
    email?: string;
    origin?: 'login' | 'registration' | 'expired-link';
    from?: string;
  }
}
