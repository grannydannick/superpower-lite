import * as React from 'react';

import { createUser, renderApp, screen, userEvent } from '@/testing/test-utils';

import { Navbar } from '../navbar';

test('Check if logout btn is present', async () => {
  const user = await createUser({
    admin: true,
  });

  await renderApp(<Navbar />, { user });

  expect(await screen.findByTestId('navbar-more-btn')).toBeInTheDocument();

  await userEvent.click(await screen.findByTestId('navbar-more-btn'));

  expect(await screen.findByText('Log out')).toBeInTheDocument();
});
