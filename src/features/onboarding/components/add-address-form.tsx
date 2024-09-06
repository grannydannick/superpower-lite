import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Body2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  formAddressInputSchema,
  FormAddressInput,
  useUpdateProfile,
} from '@/shared/api';
import { useGetServiceability } from '@/shared/api/get-serviceability';
import { Address } from '@/types/api';

function FullAddressForm({
  setIsAdding,
  googleAddres,
}: {
  setIsAdding: () => void;
  googleAddres: FormAddressInput;
}) {
  const { updateBlocked, isBlocked, collectionMethod } = useOnboarding();
  // const [asDefault, setAsDefault] = useState<boolean>(false);

  const user = useUser();
  const primaryAddress = user.data?.primaryAddress?.address;
  const getServiceabilityMutation = useGetServiceability();

  const form = useForm<FormAddressInput>({
    resolver: zodResolver(formAddressInputSchema),
    defaultValues: {
      line1: primaryAddress?.line.join(' ') ?? googleAddres.line1 ?? '',
      postalCode: primaryAddress?.postalCode ?? googleAddres.postalCode ?? '',
      city: primaryAddress?.city ?? googleAddres.city ?? '',
      state: primaryAddress?.state ?? googleAddres.state ?? '',
    },
  });

  const updateProfileMutation = useUpdateProfile();

  const onSubmit = async (data: FormAddressInput) => {
    const { serviceable } = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.postalCode,
        collectionMethod: collectionMethod ?? 'IN_LAB',
      },
    });

    if (serviceable) {
      const address: Address = {
        line: [data.line1],
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      };

      await updateProfileMutation.mutateAsync({
        data: { activeAddress: { address } },
      });

      updateBlocked(false);
      setIsAdding();
    } else {
      updateBlocked(true);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="line1"
          render={({ ...rest }) => (
            <FormItem>
              <FormLabel className="text-zinc-600">Street Address</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="Address" {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-600">City</FormLabel>
                <FormControl>
                  <Input autoComplete="off" placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-600">State</FormLabel>
                <FormControl>
                  <Input autoComplete="off" placeholder="State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-600">Zip Code</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="ZIP Code"
                    className={cn(
                      isBlocked
                        ? 'border border-[#B90090] bg-[#FFF3F6] focus-visible:bg-[#FFF3F6] focus-visible:ring-0'
                        : null,
                    )}
                    {...field}
                  />
                </FormControl>
                {!isBlocked && <FormMessage />}
              </FormItem>
            )}
          />
          {isBlocked && (
            <Body2 className="text-[#B90090]">
              Sorry, we’re unable to service your area right now. please go back
              and try a different address.
            </Body2>
          )}
        </div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex cursor-pointer items-center gap-1.5">
            <Checkbox
              id="default"
              // onChange={() => setAsDefault((prev) => !prev)}
            />
            <Label
              htmlFor="default"
              className="line-clamp-1 text-base text-zinc-500"
            >
              Set as default address
            </Label>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button variant="outline" type="button" className="w-full">
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              {getServiceabilityMutation.isPending ? (
                <Spinner className="size-6" variant="light" />
              ) : (
                'Add address'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function AddAddressForm({ setIsAdding }: { setIsAdding: () => void }) {
  const [googleAddress, setGoogleAddress] = useState<
    FormAddressInput | undefined
  >();

  if (googleAddress) {
    return (
      <FullAddressForm setIsAdding={setIsAdding} googleAddres={googleAddress} />
    );
  }

  return (
    <div className="space-y-8">
      <AddressAutocomplete
        emptyMessage="Start searching..."
        placeholder="Address"
        onSubmit={(address) => {
          setGoogleAddress(address);
        }}
        color="zinc"
      />
      <div className="flex justify-end">
        <Button variant="outline" onClick={setIsAdding}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
