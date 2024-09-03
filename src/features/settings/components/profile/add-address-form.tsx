import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
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
import { Spinner } from '@/components/ui/spinner';
import { US_STATE_CODES } from '@/const/us-state-codes';
import { useUser } from '@/lib/auth';
import {
  AddressInput,
  addressInputSchema,
  useUpdateProfile,
} from '@/shared/api';

export function AddAddressForm(): JSX.Element {
  const { data: user } = useUser();
  const { mutateAsync, isPending, isSuccess } = useUpdateProfile();

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      line: [],
      postalCode: '',
      city: '',
      state: '',
    },
  });

  async function onSubmit(address: AddressInput): Promise<void> {
    await mutateAsync({
      data: { activeAddress: { address } },
    });
  }

  useEffect(() => {
    if (isSuccess) {
      window.location.reload();
    }
  }, [isSuccess]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 pt-8">
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Name"
            disabled
            value={`${user?.firstName} ${user?.lastName}`}
          />

          <FormField
            control={form.control}
            name="line"
            render={({ ...rest }) => (
              <FormItem>
                <FormLabel className="text-zinc-600">Street Address</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="Address"
                    onChange={(e) => form.setValue('line', [e.target.value])}
                    {...rest}
                  />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white text-black">
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full justify-end gap-4 pt-6">
            <DialogTrigger asChild>
              {!isSuccess && (
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              )}
            </DialogTrigger>
            {!isSuccess && (
              <Button type="submit" className="w-auto">
                {isPending ? <Spinner /> : 'Add address'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
