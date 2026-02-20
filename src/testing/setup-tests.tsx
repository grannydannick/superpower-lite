import '@testing-library/jest-dom/vitest';
import { queryClient } from '@/lib/react-query';
import { initializeDb, resetDb } from '@/testing/mocks/db';
import { server } from '@/testing/mocks/server';

import { mockAddressComponents } from '../../__mocks__/use-places-service';

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

vi.mock('@vis.gl/react-google-maps', async () => {
  const actual = await vi.importActual('@vis.gl/react-google-maps');
  return {
    ...actual,
    useMapsLibrary: () => ({
      AutocompleteService: class {
        getPlacePredictions(
          _request: any,
          callback: (predictions: any, status: any) => void,
        ) {
          callback(
            [
              {
                place_id: 'mock-1',
                description: '123 Mock St, Testville, TS',
                structured_formatting: {
                  main_text: '123 Mock St',
                  secondary_text: 'Testville, TS',
                },
              },
            ],
            'OK',
          );
        }
      },
      PlacesService: class {
        getDetails(_request: any, callback: (place: any, status: any) => void) {
          callback({ address_components: mockAddressComponents }, 'OK');
        }
      },
      PlacesServiceStatus: {
        OK: 'OK',
      },
    }),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  // required mocks to open Shadcn Select component

  window.scrollTo = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();

  // embla carousel mocks
  // mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  initializeDb();
});

afterEach(() => {
  server.resetHandlers();
  resetDb();
  queryClient.clear();
});
