import { renderApp, screen, userEvent, waitFor } from '@/testing/test-utils';

import { CouponCodeAccessForm } from '../coupon-code-access-form';

const validCode = 'SUPERPOWER';
const invalidCode = 'INVALID';

test('should validate code and call onSuccess cb which should navigate the user to the app', async () => {
  const validateCode = vi.fn();

  await renderApp(<CouponCodeAccessForm codeValidated={validateCode} />, {
    user: null,
  });

  await userEvent.type(screen.getByPlaceholderText(/Access Code/i), validCode);

  await userEvent.click(screen.getByRole('button', { name: /Next/i }));

  await waitFor(() => expect(validateCode).toHaveBeenCalledTimes(1));
});

test('should not validate code and not call onSuccess since code is invalid', async () => {
  const validateCode = vi.fn();

  await renderApp(<CouponCodeAccessForm codeValidated={validateCode} />, {
    user: null,
  });

  await userEvent.type(
    screen.getByPlaceholderText(/Access Code/i),
    invalidCode,
  );

  await userEvent.click(screen.getByRole('button', { name: /Next/i }));

  await waitFor(() => expect(validateCode).toHaveBeenCalledTimes(0));
});
