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

  // mock IntersectionObserver
  class IntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
  });

  // mock ResizeObserver
  class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
  });

  initializeDb();
});
afterEach(() => {
  server.resetHandlers();
  resetDb();
  queryClient.clear();
});
