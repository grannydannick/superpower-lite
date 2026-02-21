import { useQuery } from '@tanstack/react-query';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { AnimatePresence, m } from 'framer-motion';
import { forwardRef, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3 } from '@/components/ui/typography';
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

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

interface HighlightedIndexState {
  predictionsKey: string;
  index: number;
}

/**
 * Note: this intentionally copies input values of
 * ControllerRenderProps<FieldValues, string>
 *
 * Idea is that its library-agnostic and we can also use it outside of the
 * use-hook-form context
 */
export interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onFormSubmit: (address: FormAddressInput) => void;
  value: string | undefined;
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  variant?: 'default' | 'error' | 'glass';
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
    {
      placeholder,
      onFormSubmit,
      value,
      disabled,
      onChange,
      onBlur,
      variant = 'default',
      ...rest
    },
    ref,
  ) => {
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndexState, setHighlightedIndexState] =
      useState<HighlightedIndexState>({
        predictionsKey: '',
        index: -1,
      });
    const isSelectingRef = useRef(false);
    const listboxId = React.useId();
    const places = useMapsLibrary('places');

    const autocompleteService = useMemo(() => {
      if (!places) return null;
      return new places.AutocompleteService();
    }, [places]);

    const placesService = useMemo(() => {
      if (!places) return null;
      // PlacesService needs a DOM element to work, we'll create a hidden div
      const div = document.createElement('div');
      return new places.PlacesService(div);
    }, [places]);

    const showPredictions = useMemo((): boolean => {
      return isFocused && !!value && value.trim().length > 3;
    }, [isFocused, value]);

    const {
      data: placePredictions = [],
      isFetching: isPlacePredictionsLoading,
    } = useQuery<PlacePrediction[]>({
      queryKey: ['place-predictions', value],
      queryFn: async () => {
        if (!autocompleteService || !value || value.trim().length === 0) {
          return [];
        }

        return new Promise<PlacePrediction[]>((resolve) => {
          autocompleteService.getPlacePredictions(
            {
              input: value,
              types: ['address'],
              componentRestrictions: {
                country: 'us',
              },
            },
            (predictions: any, status: any) => {
              if (status === places!.PlacesServiceStatus.OK && predictions) {
                resolve(predictions);
              } else {
                resolve([]);
              }
            },
          );
        });
      },
      enabled: !!places && showPredictions,
      staleTime: 5000, // Cache predictions for 5 seconds
      placeholderData: (previousData) => previousData, // Keep previous data while fetching
    });

    // Derive highlighted index from a key of prediction place_id values
    // This effectively resets the index to -1 when that list changes
    let predictionsKey = '';
    for (const prediction of placePredictions) {
      if (predictionsKey.length > 0) {
        predictionsKey += ',';
      }
      predictionsKey += prediction.place_id;
    }
    const highlightedIndex =
      highlightedIndexState.predictionsKey === predictionsKey
        ? highlightedIndexState.index
        : -1;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Don't handle keyboard navigation when dropdown is hidden or loading
      // selectedPlaceId check prevents duplicate selections after dropdown closes
      if (
        !isFocused ||
        selectedPlaceId ||
        placePredictions.length === 0 ||
        isPlacePredictionsLoading
      )
        return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndexState((prev) => {
            const prevIndex =
              prev.predictionsKey === predictionsKey ? prev.index : -1;
            return {
              predictionsKey,
              index:
                prevIndex < placePredictions.length - 1 ? prevIndex + 1 : 0,
            };
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndexState((prev) => {
            const prevIndex =
              prev.predictionsKey === predictionsKey ? prev.index : -1;
            return {
              predictionsKey,
              index:
                prevIndex > 0 ? prevIndex - 1 : placePredictions.length - 1,
            };
          });
          break;
        case 'Enter':
          // Only prevent default if we have a highlighted item to select
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < placePredictions.length
          ) {
            e.preventDefault();
            handleSelect(placePredictions[highlightedIndex].place_id);
          }
          // Otherwise let Enter submit the form naturally
          break;
        case 'Tab':
          // If user navigated to a highlighted item, select it before tabbing away
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < placePredictions.length
          ) {
            handleSelect(placePredictions[highlightedIndex].place_id);
          }
          // Don't preventDefault - let Tab move focus naturally
          break;
        case 'Escape':
          e.preventDefault();
          setIsFocused(false);
          break;
      }
    };

    const handleSelect = (placeId: string) => {
      if (!placesService) {
        return;
      }
      isSelectingRef.current = true;
      placesService.getDetails(
        {
          placeId,
          fields: ['address_components'],
        },
        (place: any, status: any) => {
          if (
            status === places!.PlacesServiceStatus.OK &&
            place?.address_components
          ) {
            const address = addressFromGoogleComponents(
              place.address_components as GoogleAddressComponent[],
            );

            setSelectedPlaceId(placeId);

            onFormSubmit(address);
          }
          isSelectingRef.current = false;
        },
      );
    };

    return (
      <div>
        <Input
          placeholder={placeholder ?? 'Address'}
          disabled={disabled}
          ref={ref}
          variant={variant}
          value={value}
          onChange={(e) => {
            onChange(e);
            // Re-open dropdown when typing (e.g., after pressing Escape)
            if (!isFocused) {
              setIsFocused(true);
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            setSelectedPlaceId(null);
          }}
          onClick={() => {
            // Fallback for when field already has focus (e.g., autofocus, browser autofill)
            // This ensures the popover appears even if onFocus didn't fire
            setIsFocused(true);
            setSelectedPlaceId(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsFocused(false);
            // Skip validation if an async selection is in progress (e.g., Tab key)
            // The form will be validated when the selection completes via onFormSubmit
            if (!isSelectingRef.current) {
              onBlur();
            }
          }}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={showPredictions}
          aria-autocomplete="list"
          {...rest}
        />
        <AnimatePresence>
          {showPredictions && !selectedPlaceId ? (
            <m.div
              className="relative"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="absolute top-1 z-40 w-full rounded-2xl bg-white outline-none animate-in fade-in-0 zoom-in-95">
                <div
                  className={cn(
                    'max-h-[200px] overflow-scroll rounded-2xl border border-zinc-200',
                  )}
                >
                  {isPlacePredictionsLoading &&
                  placePredictions.length === 0 ? (
                    <>
                      {[
                        'skeleton-1',
                        'skeleton-2',
                        'skeleton-3',
                        'skeleton-4',
                        'skeleton-5',
                        'skeleton-6',
                      ].map((key) => (
                        <div
                          className="flex w-full flex-col items-start rounded-[10px] px-[28px] py-4"
                          key={key}
                        >
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </>
                  ) : null}
                  {placePredictions.length > 0 ? (
                    <div role="listbox" id={listboxId}>
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
                          const isHighlighted = highlightedIndex === index;
                          const isSelected =
                            selectedPlaceId === option.place_id;
                          return (
                            <button
                              data-testid={`autocomplete-${index}`}
                              type="button"
                              role="option"
                              aria-selected={isHighlighted || isSelected}
                              key={option.place_id}
                              onPointerDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSelect(option.place_id);
                              }}
                              onMouseEnter={() => {
                                setHighlightedIndexState({
                                  predictionsKey,
                                  index,
                                });
                              }}
                              className={cn(
                                'flex w-full cursor-pointer flex-col items-start rounded-[10px] px-[28px] py-4 data-[disabled]:pointer-events-auto data-[disabled]:opacity-100 hover:rounded-[10px] hover:bg-zinc-50',
                                isHighlighted || isSelected
                                  ? 'bg-zinc-50'
                                  : null,
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
                  {!isPlacePredictionsLoading && !placePredictions.length ? (
                    <div className="select-none rounded-sm px-[28px] py-4 text-center text-base font-normal text-zinc-500">
                      No results.
                    </div>
                  ) : null}
                </div>
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

AddressAutocomplete.displayName = 'AddressAutocomplete';
