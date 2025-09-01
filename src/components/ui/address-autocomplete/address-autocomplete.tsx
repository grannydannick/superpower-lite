import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { GoogleAddressComponent } from '@/types/address';
import { addressFromGoogleComponents } from '@/utils/google';

type FormAddressInput = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

/**
 * Note: this intentionally copies input values of
 * ControllerRenderProps<FieldValues, string>
 *
 * Idea is that its library-agnostic and we can also use it outside of the
 * use-hook-form context
 */
export interface AddressAutocompleteProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onFormSubmit: (address: FormAddressInput) => void;
  value: string;
  onChange: (...event: any[]) => void;
  onBlur: () => void;
}

const container = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: {
        duration: 0.4,
      },
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

export const AddressAutocomplete = forwardRef<
  HTMLInputElement,
  AddressAutocompleteProps
>(
  (
    { placeholder, onFormSubmit, value, disabled, onChange, onBlur, ...rest },
    ref,
  ) => {
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const initialValue = useRef(value);
    const {
      placesService,
      placePredictions,
      getPlacePredictions,
      isPlacePredictionsLoading,
    } = usePlacesService({
      apiKey: env.GOOGLE_API_KEY,
      options: {
        types: ['address'],
        componentRestrictions: {
          country: 'us',
        },
      },
    });

    useEffect(() => {
      if (value && value.length > 0) {
        getPlacePredictions({ input: value });
      }
    }, [value]);

    const handleSelect = (placeId: string) => {
      placesService?.getDetails(
        {
          placeId,
        },
        ({
          address_components,
        }: {
          address_components: GoogleAddressComponent[];
        }) => {
          const address = addressFromGoogleComponents(address_components);

          setSelectedPlaceId(placeId);

          onFormSubmit(address);
        },
      );
    };

    return (
      <div>
        <Input
          placeholder={placeholder ?? 'Address'}
          disabled={disabled}
          ref={ref}
          value={value}
          onChange={(e) => {
            getPlacePredictions({ input: e.target.value });
            onChange(e);
          }}
          onFocus={() => {
            setIsFocused(true);
            setSelectedPlaceId(null);
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          {...rest}
        />
        <AnimatePresence>
          {isFocused &&
          !selectedPlaceId &&
          // only search when input differs from initial value
          value !== initialValue.current &&
          placePredictions.length > 0 ? (
            <motion.div
              className="relative"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="absolute top-1 z-40 w-full rounded-2xl bg-white outline-none animate-in fade-in-0 zoom-in-95">
                <div
                  className={cn(
                    'max-h-[200px] rounded-2xl overflow-scroll border border-zinc-200',
                  )}
                >
                  {isPlacePredictionsLoading
                    ? Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            className="flex w-full flex-col items-start rounded-[10px] px-[28px] py-4"
                            key={i}
                          >
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))
                    : null}
                  {placePredictions.length > 0 && !isPlacePredictionsLoading ? (
                    <div>
                      {placePredictions.map(
                        (
                          option: {
                            place_id: string;
                            description: string;
                            structured_formatting: {
                              main_text: string;
                              secondary_text: string;
                            };
                          },
                          index,
                        ) => {
                          const isSelected =
                            selectedPlaceId === option.place_id;
                          return (
                            <button
                              data-testid={`autocomplete-${index}`}
                              type="button"
                              key={option.place_id}
                              onPointerDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSelect(option.place_id);
                              }}
                              className={cn(
                                'flex w-full py-4 rounded-[10px] px-[28px] flex-col items-start cursor-pointer data-[disabled]:opacity-100 hover:bg-zinc-50 hover:rounded-[10px] data-[disabled]:pointer-events-auto',
                                isSelected ? 'bg-zinc-50' : null,
                              )}
                            >
                              <Body1>
                                {option.structured_formatting.main_text}
                              </Body1>
                              <Body3 className="text-zinc-400">
                                {option.structured_formatting.secondary_text}
                              </Body3>
                            </button>
                          );
                        },
                      )}
                    </div>
                  ) : null}
                  {!isPlacePredictionsLoading &&
                  !placePredictions.length &&
                  value.length > 0 ? (
                    <div className="select-none rounded-sm px-[28px] py-4 text-center text-base font-normal text-zinc-500">
                      No results.
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

AddressAutocomplete.displayName = 'AddressAutocomplete';
