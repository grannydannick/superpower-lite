import { GoogleAddressComponent } from '../src/types/address';

export const mockAddressComponents: GoogleAddressComponent[] = [
  { long_name: '1600', short_name: '1600', types: ['street_number'] },
  {
    long_name: 'Amphitheatre Parkway',
    short_name: 'Amphitheatre Pkwy',
    types: ['route'],
  },
  {
    long_name: 'Mountain View',
    short_name: 'MTV',
    types: ['locality'],
  },
  {
    long_name: 'Santa Clara County',
    short_name: 'Santa Clara',
    types: ['administrative_area_level_2'],
  },
  {
    long_name: 'California',
    short_name: 'CA',
    types: ['administrative_area_level_1'],
  },
  { long_name: 'United States', short_name: 'US', types: ['country'] },
  { long_name: '94043', short_name: '94043', types: ['postal_code'] },
];

export const mockPlacePredictions = [
  {
    place_id: 'foo123',
    description: 'Foo Plaza, Springfield, USA',
    structured_formatting: {
      main_text: 'Foo Plaza',
      secondary_text: 'Springfield, USA',
      main_text_matched_substrings: [{ length: 0, offset: 0 }],
    },
    terms: [
      { offset: 0, value: 'Foo Plaza' },
      { offset: 10, value: 'Springfield' },
    ],
    matched_substrings: [{ length: 0, offset: 0 }],
  },
];

export const usePlacesServiceMock = {
  default: () => ({
    placesService: {
      getDetails: (_opts: any, callback: any) => {
        callback({ address_components: mockAddressComponents });
      },
    },
    placePredictions: [
      {
        place_id: 'mock-1',
        description: '123 Mock St, Testville, TS',
        structured_formatting: {
          main_text: '123 Mock St',
          secondary_text: 'Testville, TS',
        },
      },
    ],
    getPlacePredictions: vi.fn(),
    isPlacePredictionsLoading: false,
  }),
};
