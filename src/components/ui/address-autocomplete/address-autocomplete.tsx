import { Command as CommandPrimitive } from 'cmdk';
import { useState, useCallback, useEffect } from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';

import { Spinner } from '@/components/ui/spinner';
import { Body1, Body3 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

import { CommandGroup, CommandItem, CommandList } from '../command';

import { AddressCommandInput } from './address-command-input';

type Color = 'white' | 'zinc';

type FormAddressInput = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

type AutoCompleteProps = {
  placeholder?: string;
  color?: Color;
  onSubmit: (address: FormAddressInput) => void;
};

export const AddressAutocomplete = ({
  placeholder,
  onSubmit,
  color = 'white',
}: AutoCompleteProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState('');
  const [serachPlaceholder, setSerachPlaceholder] = useState(
    placeholder ?? 'Enter address',
  );

  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => {
    setIsOpen(true);
    setSerachPlaceholder('Start searching…');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSerachPlaceholder(placeholder ?? 'Enter address');
  }, [placeholder]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: env.GOOGLE_API_KEY,
  });

  useEffect(() => {
    getPlacePredictions({ input: debouncedSearchInput });
  }, [debouncedSearchInput]);

  useEffect(() => {
    if (selected) {
      placesService?.getDetails(
        {
          placeId: selected,
        },
        ({
          address_components,
        }: {
          address_components: {
            long_name: string;
            short_name: string;
            types: string[];
          }[];
        }) => {
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
            address_components.find((a) => a.types.includes('locality'))
              ?.long_name ?? '';
          const state =
            address_components.find((a) =>
              a.types.includes('administrative_area_level_1'),
            )?.short_name ?? '';
          const postalCode =
            address_components.find((a) => a.types.includes('postal_code'))
              ?.long_name ?? '';

          const line1 = `${streetNumber || ''} ${route || ''}`;
          const line2 = aptNumber ? `${aptNumber}` : undefined;

          const address: FormAddressInput = {
            line1,
            line2,
            city,
            state,
            postalCode,
          };
          onSubmit(address);
        },
      );
    }
  }, [selected]);

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <AddressCommandInput
          value={searchInput}
          onValueChange={setSearchInput}
          onBlur={close}
          onFocus={open}
          color={color}
          placeholder={serachPlaceholder}
        />
      </div>
      <div className="relative mt-1">
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-2xl bg-white outline-none',
            isOpen ? 'block' : 'hidden',
            color === 'zinc' && 'border border-zinc-200',
          )}
        >
          <CommandList className="max-h-[200px] rounded-2xl">
            {isPlacePredictionsLoading ? (
              <CommandPrimitive.Loading>
                <div className="flex w-full items-center justify-center px-[28px] py-4">
                  <Spinner variant="primary" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {placePredictions.length > 0 && !isPlacePredictionsLoading ? (
              <CommandGroup>
                {placePredictions.map(
                  (option: {
                    place_id: string;
                    description: string;
                    structured_formatting: {
                      main_text: string;
                      secondary_text: string;
                    };
                  }) => {
                    const isSelected = selected === option.place_id;
                    return (
                      <CommandItem
                        key={option.place_id}
                        value={option.description}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={() => {
                          setSelected(option.place_id);
                        }}
                        className={cn(
                          'flex w-full py-4 px-[28px] flex-col items-start cursor-pointer data-[disabled]:opacity-100 hover:bg-zinc-50 hover:rounded-[10px] data-[disabled]:pointer-events-auto',
                          isSelected ? 'bg-zinc-50 rounded-[10px]' : null,
                        )}
                      >
                        <Body1>{option.structured_formatting.main_text}</Body1>
                        <Body3 className="text-zinc-400">
                          {option.structured_formatting.secondary_text}
                        </Body3>
                      </CommandItem>
                    );
                  },
                )}
              </CommandGroup>
            ) : null}
            {!isPlacePredictionsLoading &&
            !placePredictions.length &&
            debouncedSearchInput.length ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-[28px] py-4 text-center text-base font-normal text-zinc-500">
                No results.
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};
