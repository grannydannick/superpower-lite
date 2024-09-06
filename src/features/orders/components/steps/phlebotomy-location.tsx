import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { Body1 } from '@/components/ui/typography';
import { CUSTOM_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { US_STATE_CODES } from '@/const/us-state-codes';
import { COLLECTION_METHODS } from '@/features/orders/const/collection-methods';
import { useOrder } from '@/features/orders/stores/order-store';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { usePhlebotomyLocations } from '@/shared/api/get-phlebotomy-locations';
import { useGetServiceability } from '@/shared/api/get-serviceability';
import { Address, PhlebotomyLocation } from '@/types/api';
import { getLine, isAddressComplete, setLine } from '@/utils/address';
import { formatAddress } from '@/utils/format';
import { formatMoney } from '@/utils/format-money';

export const PhlebotomyLocationSelect = () => {
  const { collectionMethod, location, updateCollectionMethod, service } =
    useOrder((s) => s);
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);

  useEffect(() => {
    updateCollectionMethod(getDefaultCollectionMethod(service));
  }, []);

  return (
    <div>
      <div className="space-y-16">
        <div className="space-y-4">
          <h3 className="text-3xl">Select a service type</h3>
          <CreateOrderPhlebotomyLocationSelector />
        </div>
        {collectionMethod === 'IN_LAB' ? (
          <CreateOrderPhlebotomyInLab />
        ) : (
          <CreateOrderPhlebotomyAtHome />
        )}
      </div>
      <div className="flex items-center justify-between pt-12">
        <Body1 className="text-zinc-400">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep} disabled={!location}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

function CreateOrderPhlebotomyInLab(): JSX.Element {
  const { data: user } = useUser();
  const updateLocation = useOrder((s) => s.updateLocation);

  const [zipCode, setZipCode] = useState<string>(
    user?.primaryAddress?.address.postalCode ?? '',
  );
  const debouncedZipCode = useDebounce(zipCode, 500);
  const phlebotomyLocationsMutation = usePhlebotomyLocations({
    postalCode: debouncedZipCode,
    queryConfig: { enabled: debouncedZipCode.length === 5 },
  });

  useEffect(() => {
    if (zipCode.length !== 5) {
      updateLocation(null);
    }
  }, [zipCode]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-3xl">Nearby Labs</h3>
        <p className="text-zinc-500">
          Please enter your zip code and we will find a partner laboratory
          closest to you.
        </p>
      </div>
      <form className="space-y-2">
        <Label className="flex flex-row items-center gap-1 text-zinc-500">
          <span>My zip code</span>
          {phlebotomyLocationsMutation.isLoading && (
            <span>
              <Spinner size="xs" variant="primary" />
            </span>
          )}
        </Label>
        <Input
          maxLength={5}
          value={zipCode}
          placeholder="5-digit zip code"
          onChange={(e) => setZipCode(e.target.value)}
        />
      </form>
      <LocationList
        locations={phlebotomyLocationsMutation.data?.locations || []}
      />
    </div>
  );
}

function CreateOrderPhlebotomyAtHome(): JSX.Element {
  const {
    updateLocation,
    location,

    collectionMethod,
  } = useOrder((s) => s);
  const [isServicable, setIsServicable] = useState(true);
  const { data: user } = useUser();
  const [error, setError] = useState<string | null>(null);

  /*
   * Either use address we already have in context OR use profile address
   * */
  const [address, setAddress] = useState<Address>({
    line: location?.address?.line
      ? location?.address?.line
      : user?.primaryAddress?.address.line ?? [],
    city: location?.address?.city
      ? location?.address?.city
      : user?.primaryAddress?.address.city ?? '',
    state: location?.address?.state
      ? location?.address?.state
      : user?.primaryAddress?.address.state ?? '',
    postalCode: location?.address?.postalCode
      ? location?.address?.postalCode
      : user?.primaryAddress?.address.postalCode ?? '',
  });

  const debouncedZipCode = useDebounce(address.postalCode, 500);

  const getPhlebotomyServiceableMutation = useGetServiceability();

  useEffect(() => {
    const checkServiceable = async (): Promise<void> => {
      if (debouncedZipCode.length === 5) {
        const response = await getPhlebotomyServiceableMutation.mutateAsync({
          data: {
            zipCode: debouncedZipCode,
            collectionMethod: collectionMethod || 'AT_HOME',
          },
        });

        if (!response.serviceable) {
          setError('ZIP Code is not servicable');
        } else {
          updateLocation({ address });
          setIsServicable(true);
        }
      } else {
        updateLocation(null);
      }
    };

    // refresh error if zip code changes
    setError(null);
    // set is not servicable to refresh previous result
    setIsServicable(false);

    checkServiceable();
  }, [debouncedZipCode]);

  /*
   * Refresh states if user removed previous zipcode
   * */
  useEffect(() => {
    if (address.postalCode.length !== 5) {
      setIsServicable(false);
      updateLocation(null);
    }
  }, [address.postalCode.length]);

  /*
   * Before allowing user to proceed make sure address is complete,
   * there is no error and address is servicable
   *
   * isServicable is local use state to keep track of API response and fast update it
   * */
  useEffect(() => {
    if (isAddressComplete(address) && !error && isServicable) {
      updateLocation({ address });
    }
  }, [address, isServicable]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-3xl">Place of service</h3>
        <p className="text-zinc-500">
          Please select or enter your the address a phlebotomist will visit to
          complete your service.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          className="mr-4 flex-1"
          name="line1"
          placeholder="Line 1"
          defaultValue={getLine(address, 0)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              line: setLine(prev, 0, e.target.value),
            }))
          }
        />
        <Input
          className="flex-1"
          name="line2"
          placeholder="Line 2"
          defaultValue={getLine(address, 1)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              line: setLine(prev, 1, e.target.value),
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            name="postalCode"
            placeholder="Postal Code"
            maxLength={5}
            defaultValue={address.postalCode}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, postalCode: e.target.value }))
            }
          />
          <Input
            name="city"
            placeholder="City"
            defaultValue={address.city}
            disabled={false}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, city: e.target.value }))
            }
          />
          <div>
            <Select
              value={address.state}
              onValueChange={(val) =>
                setAddress((prev) => ({ ...prev, state: val }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent style={{ zIndex: 51 }}>
                {US_STATE_CODES.map((state) => (
                  <SelectItem value={state} key={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <Body1 className="text-pink-700">{error}</Body1>}
      </div>
    </div>
  );
}

function CreateOrderPhlebotomyLocationSelector(): JSX.Element {
  // Set default provider to not complete step

  const { collectionMethod, service, updateCollectionMethod, updateLocation } =
    useOrder((s) => s);

  const code = localStorage.getItem('superpower-code');

  console.log(collectionMethod);

  return (
    <RadioGroup
      defaultValue={collectionMethod ?? 'AT_HOME'}
      className="flex flex-col sm:flex-row"
    >
      {/* TODO: Border and background should darken on selection */}
      {COLLECTION_METHODS.map((option, index) => {
        let interpretedMethod = option.value;
        if (
          option.value === 'AT_HOME' &&
          service.name !== SUPERPOWER_BLOOD_PANEL &&
          service.name !== CUSTOM_BLOOD_PANEL
        ) {
          interpretedMethod = 'PHLEBOTOMY_KIT';
        }

        return (
          <div
            key={index}
            className={cn(
              'flex space-x-4 border-2 rounded-3xl p-6 flex-1 bg-white',
              interpretedMethod === collectionMethod
                ? 'border-zinc-500'
                : 'border-zinc-200 hover:bg-zinc-50',
              option.value === 'IN_LAB' &&
                service.name !== SUPERPOWER_BLOOD_PANEL &&
                service.name !== CUSTOM_BLOOD_PANEL
                ? 'bg-zinc-50'
                : '',
            )}
            role="presentation"
            onClick={() => {
              if (
                option.value === 'IN_LAB' &&
                service.name !== SUPERPOWER_BLOOD_PANEL &&
                service.name !== CUSTOM_BLOOD_PANEL
              )
                return;

              updateCollectionMethod(interpretedMethod);
              updateLocation(null);
            }}
          >
            <RadioGroupItem
              value={interpretedMethod}
              id={interpretedMethod}
              checked={interpretedMethod === collectionMethod}
              disabled={
                option.value === 'IN_LAB' &&
                service.name !== SUPERPOWER_BLOOD_PANEL &&
                service.name !== CUSTOM_BLOOD_PANEL
              }
              className="mt-0.5 min-w-5"
            />
            <Label htmlFor={option.value} className="w-full">
              <div className="flex h-[140px] flex-col justify-between sm:h-[200px]">
                <div className="space-y-3">
                  <h4 className="text-2xl text-primary">{option.name}</h4>
                  <p className="leading-normal text-zinc-500">
                    {option.description}
                  </p>
                  {option.cancelationText && (
                    <p className="text-xs leading-normal text-zinc-500">
                      {option.cancelationText}
                    </p>
                  )}
                </div>
                <span className="text-zinc-500">
                  {option.price === 0 || code === 'SPPROMO'
                    ? 'Included'
                    : `+${formatMoney(option.price)}`}
                </span>
              </div>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

function LocationList({
  locations,
}: {
  locations: PhlebotomyLocation[];
}): JSX.Element {
  const { location, updateLocation } = useOrder((s) => s);

  if (!locations || locations.length === 0) {
    return (
      <p className="text-zinc-500">
        No locations found. Please enter a new zip code.
      </p>
    );
  }

  return (
    <div className="max-h-[240px] overflow-y-scroll rounded-2xl border border-zinc-200 bg-white p-2">
      <div className="flex flex-col">
        {locations?.map((option, index) => (
          <button
            key={index}
            className={cn(
              'rounded-lg p-4 text-left transition-all hover:bg-accent',
              // selected && formatAddress(selected?.address) === formatAddress(item.address) && 'bg-muted'
            )}
            onClick={() => {
              updateLocation(option);
            }}
          >
            <div className="flex items-center gap-4">
              <RadioIcon
                checked={
                  !!location &&
                  formatAddress(location?.address) ===
                    formatAddress(option.address)
                }
              />
              <div className="flex flex-col items-start">
                <h3 className="text-[#52525B]">
                  {formatAddress(option.address)}
                </h3>
                <div className="flex flex-row items-center text-[#A1A1AA]">
                  <MapPin className="mr-1 size-4" />
                  <p className="text-sm">
                    {option.name
                      ? `${option.name} ( ${option.distance} mile${option.distance > 1 ? 's' : ''} )`
                      : `${option.distance} mile${option.distance > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export interface RadioIconProps {
  checked?: boolean;
}

export function RadioIcon({ checked = false }: RadioIconProps): JSX.Element {
  return checked ? <RadioChecked /> : <RadioEmpty />;
}

function RadioEmpty(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#E4E4E7" />
    </svg>
  );
}

function RadioChecked(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="11"
        stroke="#18181B"
        strokeWidth="2"
      />
      <rect x="4" y="4" width="16" height="16" rx="8" fill="#18181B" />
    </svg>
  );
}
