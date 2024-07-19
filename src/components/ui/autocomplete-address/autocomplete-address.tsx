import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import { z } from 'zod';

import { Button } from '../button';
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../command';
import { Form, Input } from '../form';

export type AutocompleteAddressProps = {
  googleApiKey: string;
  onSubmit: (address: Address) => void;
};

export function AutocompleteAddress(props: AutocompleteAddressProps) {
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    // isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: props.googleApiKey,
  });

  const schema = z.object({
    line1: z.string().min(1, 'Required'),
  });

  useEffect(() => {
    // fetch place details for the first element in placePredictions array
    if (placePredictions.length) {
      placesService?.getDetails(
        {
          placeId: placePredictions[0].place_id,
        },
        () => {},
      );
    }
  }, [placePredictions, placesService]);

  const onSelect = () => {
    placesService?.getDetails(
      {
        placeId: placePredictions[0].place_id,
      },
      ({ address_components }: any) => {
        const streetNumber = address_components.find((a: any) =>
          a.types.includes('street_number'),
        ).long_name;
        const route = address_components.find((a: any) =>
          a.types.includes('route'),
        ).long_name;

        const line1 = `${streetNumber || ''} ${route || ''}`;
        const line2 = '';
        const city = address_components.find((a: any) =>
          a.types.includes('locality'),
        )?.long_name;
        const state = address_components.find((a: any) =>
          a.types.includes('administrative_area_level_1'),
        )?.short_name;
        const postalCode = address_components.find((a: any) =>
          a.types.includes('postal_code'),
        )?.long_name;

        const address = {
          line1,
          line2,
          city,
          state,
          postalCode,
        };
        props.onSubmit(address);
      },
    );
  };

  return (
    <Form
      onSubmit={(values) => {
        console.log(values);
      }}
      schema={schema}
      className="mx-auto max-w-md text-left"
    >
      {({ register }) => (
        <div className="relative">
          <Input
            type="address"
            placeholder="Address"
            autoComplete="off"
            registration={register('line1')}
            className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
            icon={<MapPin className="size-4" />}
            onChange={(evt) => {
              getPlacePredictions({ input: evt.target.value });
            }}
          />
          {placePredictions.length > 0 && (
            <div className="absolute top-20">
              <CommandDialog open={true} onOpenChange={() => {}}>
                <CommandList>
                  {/* <CommandEmpty>No results found.</CommandEmpty> */}
                  <CommandGroup heading="Suggestions">
                    {placePredictions.map((item) => {
                      return (
                        <CommandItem
                          key={item.id}
                          onClick={() => {
                            onSelect();
                          }}
                        >
                          {item.description}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </div>
          )}
        </div>
      )}
    </Form>
  );
}

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type FullAddressFormProps = {
  address?: Address;
  onSubmit?: (address: Address) => void;
};

export function FullAddressForm({ address, onSubmit }: FullAddressFormProps) {
  const schema = z.object({
    line1: z
      .string()
      .min(1, 'Required')
      .default(address?.line1 || ''),
    line2: z.string().default(address?.line2 || ''),
    city: z
      .string()
      .min(1, 'Required')
      .default(address?.city || ''),
    state: z
      .string()
      .min(1, 'Required')
      .default(address?.state || ''),
    postalCode: z
      .string()
      .min(1, 'Required')
      .default(address?.postalCode || ''),
  });

  return (
    <Form
      onSubmit={(values) => {
        if (onSubmit) onSubmit(values);
      }}
      schema={schema}
      className="mx-auto max-w-md text-left"
    >
      {({ register }) => (
        <div className="relative">
          <Input
            id="line1"
            type="text"
            placeholder="Address"
            autoComplete="off"
            registration={register('line1')}
            defaultValue={address?.line1 || ''}
            className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
          />
          <Input
            id="line2"
            type="text"
            placeholder="Apt, Unit, etc."
            autoComplete="off"
            registration={register('line2')}
            defaultValue={address?.line2 || ''}
            className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
          />
          <div className="grid  grid-cols-1 gap-x-4 md:grid-cols-3">
            <Input
              id="city"
              type="text"
              placeholder="City"
              autoComplete="off"
              registration={register('city')}
              defaultValue={address?.city || ''}
              className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
            />
            <Input
              id="state"
              type="text"
              placeholder="State"
              autoComplete="off"
              registration={register('state')}
              defaultValue={address?.state || ''}
              className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
            />
            <Input
              id="postalCode"
              type="text"
              placeholder="ZIP Code"
              autoComplete="off"
              registration={register('postalCode')}
              defaultValue={address?.postalCode || ''}
              className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full text-base md:text-lg"
            variant="white"
            size="lg"
          >
            Next
          </Button>
        </div>
      )}
    </Form>
  );
}

export type AddressFormProps = {
  googleApiKey?: string;
  onSubmit: (address: Address) => void;
};

export function AddressForm(props: AddressFormProps) {
  const [address, setAddress] = useState<Address | undefined>();

  const autocompleteOnSubmit = (address: Address) => {
    setAddress(address);
  };

  if (props.googleApiKey === undefined || address !== undefined) {
    return <FullAddressForm address={address} onSubmit={props.onSubmit} />;
  }

  return (
    <AutocompleteAddress
      googleApiKey={props.googleApiKey}
      onSubmit={autocompleteOnSubmit}
    />
  );
}
