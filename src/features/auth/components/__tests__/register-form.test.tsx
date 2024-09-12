import { waitFor } from '@testing-library/react';

import { createUser } from '@/testing/data-generators';
import { renderApp, screen, userEvent } from '@/testing/test-utils';

import { RegisterForm } from '../register-form';

test('should register new user and call onSuccess cb which should navigate the user to the app', async () => {
  const newUser = createUser({});

  const onSuccess = vi.fn();

  await renderApp(<RegisterForm onSuccess={onSuccess} />, { user: null });

  await userEvent.type(
    screen.getByPlaceholderText(/first name/i),
    newUser.firstName,
  );
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.type(
    screen.getByPlaceholderText(/enter phone number/i),
    newUser.phone,
  );
  //
  await userEvent.click(screen.getByTestId(/date/i));
  await userEvent.click(screen.getByTestId(/date-year-picker/i));
  await userEvent.click(screen.getByText(/1990/i));

  await userEvent.click(screen.getByText(/Select biological sex/i), {
    pointerEventsCheck: 0,
  });

  await userEvent.click(screen.getByRole('option', { name: 'Male' }));

  await userEvent.type(screen.getByLabelText(/email/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);

  await userEvent.click(screen.getByRole('button', { name: /Register/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
