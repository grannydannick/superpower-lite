import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { AppProvider } from '@/app/provider';
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

export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByTestId(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ],
    { timeout: 4000 },
  );

const initializeUser = async (user: any) => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  } else if (user) {
    return loginAsUser(user);
  } else {
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
            <RouterProvider router={router} />
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
