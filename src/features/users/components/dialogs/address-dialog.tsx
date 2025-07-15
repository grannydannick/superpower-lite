import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { H2 } from '@/components/ui/typography';
import { US_STATES } from '@/const';
import { useGetServiceability } from '@/features/orders/api';
import { useGeocode } from '@/features/users/api/geocode';
import { NotServiceableDialog } from '@/features/users/components/dialogs/not-serviceable-dialog';
import { SuggestedAddressDialog } from '@/features/users/components/dialogs/suggested-address-dialog';
import {
  AddressInput,
  FormAddressInput,
  formAddressInputSchema,
} from '@/types/address';
import { Address, NotServiceableReason } from '@/types/api';
import { isSameFormAddressInput } from '@/utils/format';
import { addressFromGoogleComponents } from '@/utils/google';

import { useEditAddress, useCreateAddress } from '../../api';

interface AddressDialogProps {
  mode: 'add' | 'edit';
  children?: ReactNode;
  address?: Address;
  onSuccess?: () => void;
  isDialogClosable?: boolean;
}

export function AddressDialog({
  children,
  mode,
  address,
  onSuccess,
  isDialogClosable = true,
}: AddressDialogProps) {
  const [isOpen, setIsOpen] = useState(children === undefined);
  const [reason, setReason] = useState<NotServiceableReason | undefined>(
    undefined,
  );
  const [suggestedAddress, setSuggestedAddress] = useState<
    FormAddressInput | undefined
  >(undefined);
  const defaultValues: FormAddressInput | undefined = address
    ? {
        line1: address.line[0] || '',
        line2: address.line[1] || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
      }
    : undefined;

  const form = useForm<FormAddressInput>({
    resolver: zodResolver(formAddressInputSchema),
    defaultValues: defaultValues
      ? defaultValues
      : {
          line1: '',
          postalCode: '',
          city: '',
          state: '',
        },
  });

  const geocodeMutation = useGeocode({
    mutationConfig: {
      onError: () => {
        toast.error('Server error during address validation.');
      },
    },
  });
  const getServiceabilityMutation = useGetServiceability();

  const createAddressMutation = useCreateAddress({
    mutationConfig: {
      onSuccess: () => {
        handleDialogClose();
        toast.success('Address added successfully');
      },
      onError: (error) => {
        console.error(`Failed to add address:`, error);
      },
    },
  });

  const editAddressMutation = useEditAddress({
    mutationConfig: {
      onSuccess: () => {
        handleDialogClose();
        toast.success('Address edited successfully');
      },
      onError: (error) => {
        toast.error(`Failed to edit address. Please try again.`);
        console.error(`Failed to edit address:`, error);
      },
    },
  });

  const title = mode === 'add' ? 'Add an address' : 'Edit address';

  const handleDialogClose = () => {
    // reset the mutation state so the user can create a new address
    createAddressMutation.reset();
    setIsOpen(false);
    if (onSuccess) onSuccess();
  };

  const handleFormSubmit = async (data: FormAddressInput) => {
    const { results, status } = await geocodeMutation.mutateAsync({
      data: data,
    });

    if (status === 'ZERO_RESULTS') {
      toast('Invalid address provided.');
      return;
    }
    const googleAddress = addressFromGoogleComponents(
      results?.[0]?.address_components ?? [],
    );

    if (!isSameFormAddressInput(googleAddress, data)) {
      setSuggestedAddress(googleAddress);
      return;
    }

    const response = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.postalCode,
        // we should ideally also check for AT_HOME
        collectionMethod: 'IN_LAB',
      },
    });

    if (response.serviceable === false) {
      setReason(response.reason);
      return;
    }

    if (mode === 'edit' && address) {
      // Update existing address
      const updatedAddress: AddressInput = {
        line: [data.line1, data.line2 || ''].filter((line) => line.length > 0),
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        use: address.use,
      };

      await editAddressMutation.mutateAsync({
        data: updatedAddress,
        id: address.id,
      });
    } else {
      const newAddress: AddressInput = {
        line: [data.line1, data.line2 || ''].filter((line) => line.length > 0),
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        use: 'old',
      };

      await createAddressMutation.mutateAsync({
        data: newAddress,
      });
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    setReason(undefined);
    setSuggestedAddress(undefined);
  };

  const isPending =
    createAddressMutation.isPending ||
    geocodeMutation.isPending ||
    editAddressMutation.isPending ||
    getServiceabilityMutation.isPending;

  return (
    <Dialog open={isDialogClosable ? isOpen : true} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] p-8 sm:max-w-[525px]">
        <H2>{title}</H2>
        <NotServiceableDialog
          onClick={() => setReason(undefined)}
          variant="block"
          reason={reason}
        />
        {suggestedAddress ? (
          <SuggestedAddressDialog
            suggestedAddress={suggestedAddress}
            onAccept={() => {
              form.setValue('line1', suggestedAddress.line1);
              form.setValue('line2', suggestedAddress.line2);
              form.setValue('state', suggestedAddress.state);
              form.setValue('postalCode', suggestedAddress.postalCode);
              form.setValue('city', suggestedAddress.city);
              setSuggestedAddress(undefined);
            }}
            onReject={() => {
              setSuggestedAddress(undefined);
            }}
            variant="block"
          />
        ) : null}
        {!reason && !suggestedAddress ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        {...field}
                        placeholder="Street address"
                        onFormSubmit={(data) => {
                          form.setValue('line1', data.line1);
                          form.setValue('line2', data.line2);
                          form.setValue('state', data.state);
                          form.setValue('postalCode', data.postalCode);
                          form.setValue('city', data.city);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="Apartment, suite, etc. (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder="City"
                          {...field}
                        />
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
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="State"
                                asChild={false}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-zinc-600">
                            {US_STATES.map((state) => (
                              <SelectItem value={state.value} key={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder="ZIP Code"
                          inputMode="numeric"
                          maxLength={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex w-full flex-col gap-4 pt-6 md:flex-row md:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                {!createAddressMutation.isSuccess ? (
                  <Button type="submit" className="w-auto">
                    {isPending ? <Spinner /> : title.split(' ')[0]}
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
