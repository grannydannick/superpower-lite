import { test as setup } from '@playwright/test';
import {
  mockAddressComponents,
  mockPlacePredictions,
} from '../../__mocks__/use-places-service';
import { createUser } from '../../src/testing/data-generators';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const user = createUser({ phone: '+13128383697' });

  // intercept any call to the geocode endpoint
  await page.route(
    'https://maps.googleapis.com/maps/api/geocode/json?*',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'OK',
          results: [
            {
              address_components: mockAddressComponents,
            },
          ],
        }),
      }),
  );

  await page.goto('/register');

  await page.getByLabel(/email/i).click();
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/phone/i).click();
  await page.getByLabel(/phone/i).fill(user.phone);
  await page.getByLabel(/password/i).click();
  await page.getByLabel(/password/i).fill(user.password);

  await page.getByRole('button', { name: /continue/i }).click();

  await page.getByPlaceholder('First name').click();
  await page.getByPlaceholder('First name').fill(user.firstName);
  await page.getByLabel(/last name/i).click();
  await page.getByLabel(/last name/i).fill(user.lastName);
  await page.getByText(/Select biological sex/i).click();
  await page.getByTestId('gender-option-male').click();

  await page.getByTestId('months').focus();
  await page.getByTestId('months').fill('5');
  await page.getByTestId('days').focus();
  await page.getByTestId('days').fill('20');
  await page.getByTestId('years').focus();
  await page.getByTestId('years').fill('1990');

  // this needs to be there to mock google api that lives in window once address-autocomplete mounts
  await page.evaluate(
    ({ comps, preds }) => {
      const places = (window as any).google.maps.places;
      const { OK } = places.PlacesServiceStatus || { OK: 'OK' };

      places.AutocompleteService.prototype.getPlacePredictions = function (
        request: any,
        callback: any,
      ) {
        if (typeof callback === 'function') {
          callback(preds, OK);
        }
        return Promise.resolve(preds);
      };

      places.PlacesService.prototype.getDetails = function (
        request: any,
        callback: any,
      ) {
        const fakeDetails = {
          address_components: comps,
        };
        if (typeof callback === 'function') {
          callback(fakeDetails, OK);
        }
        return undefined;
      };
    },
    { comps: mockAddressComponents, preds: mockPlacePredictions },
  );

  await page.getByPlaceholder('Address').click();
  await page.getByPlaceholder('Address').fill('123');
  await page.getByTestId('autocomplete-0').click();
  await page.getByRole('button', { name: /register/i }).click();
  await page.waitForURL('/');

  // the modal for avatar upload opens up, close it.
  // await page.getByTestId('keep-default-avatar-btn').click();

  // log out:
  // disable tanstack query for test
  await page.addStyleTag({
    content: `
    .tsqd-parent-container {
      pointer-events: none !important;
    }
  `,
  });

  await page.getByTestId('navbar-more-btn').click();
  await page.getByText('Log out').click();
  await page.waitForURL('/signin');

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
