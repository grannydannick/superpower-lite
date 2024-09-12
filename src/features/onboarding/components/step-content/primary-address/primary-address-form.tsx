import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { US_STATE_CODES } from '@/const';
import { OnboardingInput } from '@/features/onboarding/components/onboarding-input';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useGetServiceability } from '@/features/orders/api';
import {
  FormAddressInput,
  formAddressInputSchema,
  useUpdateProfile,
} from '@/features/users/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { Address } from '@/types/api';

function FullPrimaryAddressForm({
  googleAddres,
}: {
  googleAddres: FormAddressInput;
}) {
  const { nextOnboardingStep } = useStepper((s) => s);
  const { updateBlocked, updateServiceAddress } = useOnboarding();
  const user = useUser();
  const primaryAddress = user.data?.primaryAddress?.address;

  const getServiceabilityMutation = useGetServiceability();
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<FormAddressInput>({
    resolver: zodResolver(formAddressInputSchema),
    defaultValues: {
      line1: googleAddres.line1 ?? primaryAddress?.line.join(' ') ?? '',
      postalCode: googleAddres.postalCode ?? primaryAddress?.postalCode ?? '',
      city: googleAddres.city ?? primaryAddress?.city ?? '',
      state: googleAddres.state ?? primaryAddress?.state ?? '',
    },
  });

  const onSubmit = async (data: FormAddressInput) => {
    const { serviceable } = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.postalCode,
        collectionMethod: 'IN_LAB',
      },
    });

    if (serviceable) {
      const address: Address = {
        line: [data.line1],
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      };

      const user = await updateProfileMutation.mutateAsync({
        data: { primaryAddress: { address } },
      });

      updateServiceAddress(user.primaryAddress ?? null);
      updateBlocked(false);
      await nextOnboardingStep();
    } else {
      updateBlocked(true);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-md space-y-8 text-left"
      >
        <FormField
          control={form.control}
          name="line1"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className="text-white">Street Address</FormLabel>
              <FormControl>
                <OnboardingInput
                  autoComplete="off"
                  placeholder="Line 1"
                  {...field}
                />
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
              <FormItem className="space-y-0">
                <FormLabel className="text-white">City</FormLabel>
                <FormControl>
                  <OnboardingInput
                    autoComplete="off"
                    placeholder="City"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="pt-2" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-white">State</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white transition-colors focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:outline-none">
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
                <FormMessage className="pt-2" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className="text-white">Zip Code</FormLabel>
              <FormControl>
                <OnboardingInput
                  autoComplete="off"
                  placeholder="ZIP Code"
                  maxLength={5}
                  {...field}
                />
              </FormControl>
              <FormMessage className="pt-2" />
            </FormItem>
          )}
        />
        <Button type="submit" variant="white" className="w-full">
          {getServiceabilityMutation.isPending ? (
            <Spinner className="size-6" variant="primary" />
          ) : (
            'Confirm'
          )}
        </Button>
      </form>
    </Form>
  );
}

export function PrimaryAddressForm() {
  const [googleAddress, setGoogleAddress] = useState<
    FormAddressInput | undefined
  >();

  if (googleAddress) {
    return <FullPrimaryAddressForm googleAddres={googleAddress} />;
  }

  return (
    <AddressAutocomplete
      emptyMessage="Start searching..."
      placeholder="Address"
      onSubmit={(address) => {
        setGoogleAddress(address);
      }}
    />
  );
}
