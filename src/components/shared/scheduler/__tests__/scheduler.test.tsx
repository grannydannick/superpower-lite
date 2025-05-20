import * as React from 'react';

import { renderApp, screen } from '@/testing/test-utils';

import { Scheduler } from '../scheduler';

test('One slot', async () => {
  await renderApp(
    <Scheduler
      serviceId="1"
      collectionMethod="AT_HOME"
      address={{
        id: '1',
        city: 'test',
        state: 'test',
        postalCode: '12345',
        line: ['test'],
        use: 'home',
      }}
    />,
  );

  expect(await screen.findByText('1 slots')).toBeInTheDocument();
  expect(await screen.findAllByText('No slots')).toHaveLength(4);
});
