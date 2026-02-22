import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { AppProvider } from '@/app/provider';
import { useUser } from '@/lib/auth';
import { stringify } from '@/lib/utils';

import { createUser as generateUser } from './data-generators';
import { db } from './mocks/db';
import { authenticate, getAuthTokens, hash } from './mocks/utils';

export const createUser = (userProperties?: any) => {
  const user = generateUser(userProperties) as any;
  db.user.create({ ...user, password: hash(user.password) });
  return user;
};

export const loginAsUser = async (incomingUser: any) => {
  const { login, user } = await authenticate(incomingUser);
  const { accessToken, refreshToken } = await getAuthTokens({ ...login });

  localStorage.setItem(
    'activeLogin',
    stringify({
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: user.id,
    }),
  );
  return user;
};

export const waitForLoadingToFinish = async () => {
  const loadingElements = [
    ...screen.queryAllByTestId(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ];

  if (loadingElements.length === 0) {
    return;
  }

  await waitForElementToBeRemoved(loadingElements, { timeout: 4000 });
};

const TestAuthGate = ({ children }: { children: ReactNode }) => {
  const hasActiveLogin = localStorage.getItem('activeLogin') !== null;

  const userQuery = useUser({
    enabled: hasActiveLogin,
  });

  if (!hasActiveLogin) {
    return children;
  }

  if (!userQuery.isFetched) {
    return <div data-testid="loading">Loading</div>;
  }

  return children;
};

const initializeUser = async (user: any) => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  } else if (user) {
    return loginAsUser(user);
  } else {
    localStorage.removeItem('activeLogin');
    return null;
  }
};

export const renderApp = async (
  ui: any,
  { user, url = '/', path = '/', ...renderOptions }: Record<string, any> = {},
) => {
  // if you want to render the app unauthenticated then pass "null" as the user
  const initializedUser = await initializeUser(user);

  const router = createMemoryRouter(
    [
      {
        path: path,
        element: ui,
      },
    ],
    {
      initialEntries: url ? ['/', url] : ['/'],
      initialIndex: url ? 1 : 0,
    },
  );

  const returnValue = {
    ...rtlRender(ui, {
      wrapper: () => {
        return (
          <AppProvider>
            <TestAuthGate>
              <RouterProvider router={router} />
            </TestAuthGate>
          </AppProvider>
        );
      },
      ...renderOptions,
    }),
    user: initializedUser,
  };

  await waitForLoadingToFinish();

  return returnValue;
};

export * from '@testing-library/react';
export { userEvent, rtlRender };
