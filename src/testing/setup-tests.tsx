import '@testing-library/jest-dom/vitest';

import { queryClient } from '@/lib/react-query';
import { initializeDb, resetDb } from '@/testing/mocks/db';
import { server } from '@/testing/mocks/server';

import { usePlacesServiceMock } from '../../__mocks__/use-places-service';

vi.mock('zustand');

vi.mock('@rive-app/react-canvas-lite', () => {
  return {
    // useRiveFile will "load" instantly
    useRiveFile: () => ({ riveFile: {} as any }),

    // useRive returns a fake component that does nothing
    useRive: () => ({
      RiveComponent: (props: any) => <div data-testid="rive-mock" {...props} />,
    }),
  };
});

vi.mock(
  'react-google-autocomplete/lib/usePlacesAutocompleteService',
  () => usePlacesServiceMock,
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // required mocks to open Shadcn Select component

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

  initializeDb();
});
afterEach(() => {
  server.resetHandlers();
  resetDb();
  queryClient.clear();
});
