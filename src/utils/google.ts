import { FormAddressInput, GoogleAddressComponent } from '@/types/address';

export const addressFromGoogleComponents = (
  address_components: GoogleAddressComponent[],
): FormAddressInput => {
  const aptNumber = address_components.find((a) =>
    a.types.includes('subpremise'),
  )?.long_name;
  const streetNumber = address_components.find((a) =>
    a.types.includes('street_number'),
  )?.long_name;
  const route = address_components.find((a) =>
    a.types.includes('route'),
  )?.long_name;
  const city =
    address_components.find((a) => a.types.includes('locality'))?.long_name ??
    '';
  const state =
    address_components.find((a) =>
      a.types.includes('administrative_area_level_1'),
    )?.short_name ?? '';
  const postalCode =
    address_components.find((a) => a.types.includes('postal_code'))
      ?.long_name ?? '';

  const line1 = `${streetNumber || ''} ${route || ''}`;
  const line2 = aptNumber ? `${aptNumber}` : undefined;

  return {
    line1,
    line2,
    city,
    state,
    postalCode,
  };
};
