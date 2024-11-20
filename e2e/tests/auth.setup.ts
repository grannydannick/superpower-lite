import { test as setup } from '@playwright/test';
import { createUser } from '../../src/testing/data-generators';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const user = createUser({ phone: '+13128383697' });

  await page.goto('/register');

  await page.getByLabel('Access Code').click();
  await page.getByLabel('Access Code').fill('SUPERPOWER');
  await page.getByRole('button', { name: 'Next' }).click();

  // registration:
  await page.getByLabel('First Name').click();
  await page.getByLabel('First Name').fill(user.firstName);
  await page.getByLabel('Last Name').click();
  await page.getByLabel('Last Name').fill(user.lastName);

  await page.getByTestId('months').focus();
  await page.keyboard.type('5');

  await page.getByTestId('days').focus();
  await page.keyboard.type('20');

  await page.getByTestId('years').focus();
  await page.keyboard.type('1990');

  await page.getByLabel(/phone/i).click();
  await page.getByLabel(/phone/i).fill(user.phone);

  await page.getByText(/Select biological sex/i).click();
  const maleOption = page.getByRole('option', { name: 'Male' }).nth(0);
  await maleOption.click();

  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForURL('/');

  // log out:
  await page.getByTestId('logout-btn-desktop').click();
  await page.waitForURL('/signin');
  //
  // log in:
  await page.getByPlaceholder('Email').click();
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/');
  //
  await page.context().storageState({ path: authFile });
});
