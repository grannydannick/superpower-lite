import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { env } from '@/config/env';
import { MutationConfig } from '@/lib/react-query';
import { FormAddressInput, GoogleAddressComponent } from '@/types/address';

// NOTE: this is not full response, you can have more
export type GeocodeResponse = {
  status: string;
  results: {
    address_components: GoogleAddressComponent[];
  }[];
};

export const geocode = ({ data }: { data: FormAddressInput }) => {
  const { line1, line2, city, postalCode } = data;
  const addressParam = `${line1}+${line2 ?? ''}+${city}+${postalCode}`;

  return axios
    .get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        key: env.GOOGLE_API_KEY,
        address: addressParam,
        components: 'country:US',
      },
    })
    .then((resp) => {
      const { status, results } = resp.data;
      return { status, results };
    });
};

type UseGeocodeOptions = {
  mutationConfig?: MutationConfig<typeof geocode>;
};

export const useGeocode = ({ mutationConfig }: UseGeocodeOptions = {}) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: geocode,
  });
};
