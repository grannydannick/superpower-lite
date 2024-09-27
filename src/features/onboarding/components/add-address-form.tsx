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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Body2 } from '@/components/ui/typography';
import { US_STATE_CODES } from '@/const';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useGetServiceability } from '@/features/orders/api';
import {
  FormAddressInput,
  formAddressInputSchema,
  useUpdateProfile,
} from '@/features/users/api';
import { cn } from '@/lib/utils';
import { Address } from '@/types/api';

function FullAddressForm({
  setIsAdding,
  googleAddress,
}: {
  setIsAdding: () => void;
  googleAddress: FormAddressInput;
}) {
  const { updateBlocked, isBlocked, collectionMethod } = useOnboarding();
  const getServiceabilityMutation = useGetServiceability();
  const [asDefault, setAsDefault] = useState(false);

  const form = useForm<FormAddressInput>({
    resolver: zodResolver(formAddressInputSchema),
    defaultValues: {
      line1: googleAddress.line1 ?? '',
      postalCode: googleAddress.postalCode ?? '',
      city: googleAddress.city ?? '',
      state: googleAddress.state ?? '',
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
        data: asDefault
          ? { primaryAddress: { address } }
          : { activeAddress: { address } },
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
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-600">Street Address</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="Line 1" {...field} />
              </FormControl>
              <FormMessage className="pt-2" />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl bg-white px-6 py-4 text-base font-normal">
                        <SelectValue placeholder="State" asChild={false} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-zinc-600">
                      {US_STATE_CODES.map((state) => (
                        <SelectItem value={state} key={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    maxLength={5}
                    onFocus={() => updateBlocked(false)}
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
              Sorry, we’re unable to service your area right now. Try different
              address.
            </Body2>
          )}
        </div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex cursor-pointer items-center gap-1.5">
            <Checkbox
              id="default"
              onCheckedChange={() => setAsDefault((prev) => !prev)}
            />
            <Label
              htmlFor="default"
              className="line-clamp-1 text-base text-zinc-500"
            >
              Set as default address
            </Label>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => setIsAdding()}
            >
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
      <FullAddressForm
        setIsAdding={setIsAdding}
        googleAddress={googleAddress}
      />
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
