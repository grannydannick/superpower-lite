import { waitFor } from '@testing-library/react';

import { createUser } from '@/testing/data-generators';
import { renderApp, screen, userEvent } from '@/testing/test-utils';

import { RegisterForm } from '../register';

test('should register new user and call onSuccess cb which should navigate the user to the app', async () => {
  const newUser = createUser({ phone: '+13128383697' });

  const onSuccess = vi.fn();

  await renderApp(<RegisterForm onSuccess={onSuccess} />, { user: null });

  // test
  await userEvent.type(screen.getByLabelText(/email/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/phone/i), newUser.phone);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);

  await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

  // test
  await userEvent.type(
    screen.getByPlaceholderText(/first name/i),
    newUser.firstName,
  );
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.click(screen.getByTestId(/months/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.type(screen.getByTestId(/months/i), '5');

  await userEvent.click(screen.getByTestId(/days/i));
  await userEvent.type(screen.getByTestId(/days/i), '20');

  await userEvent.click(screen.getByTestId(/years/i));
  await userEvent.type(screen.getByTestId(/years/i), '1990');

  await userEvent.click(screen.getByText(/Select biological sex/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.click(screen.getByTestId('gender-option-male'));

  await userEvent.type(await screen.findByPlaceholderText(/address/i), '123');

  await userEvent.click(screen.getByTestId('autocomplete-0'));

  await userEvent.click(screen.getByRole('button', { name: /Register/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1), {
    timeout: 3000,
  });
});
