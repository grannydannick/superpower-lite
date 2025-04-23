import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { US_STATE_CODES } from '@/const/us-state-codes';
import { FormAddressInput, formAddressInputSchema } from '@/features/users/api';
import { useCreateAddress } from '@/features/users/api/create-address';
import { cn } from '@/lib/utils';
import { Address } from '@/types/api';

/**
 * Props for the AddressForm component.
 */
interface AddressFormProps {
  /**
   * Mode of operation - determines button text and some behaviors
   */
  mode?: 'add' | 'edit';

  /**
   * Callback function invoked upon successful form submission.
   */
  onSuccess?: () => void;

  /**
   * Custom function to handle form submission.
   * If provided, it overrides the default submission handler.
   * @param data - The validated form data.
   */
  onFormSubmit?: (data: FormAddressInput) => void;

  /**
   * Optional React node to be rendered as the form's footer.
   */
  formFooter?: ReactNode;

  /**
   * Determines the styling theme of the form.
   * - `'default'`: Standard styling.
   * - `'glass'`: Glassmorphism-inspired styling.
   * @default 'default'
   */
  theme?: 'glass' | 'default';

  /**
   * Optional default values to pre-fill the form fields.
   * Useful for editing existing address information.
   */
  defaultValues?: FormAddressInput;

  /**
   * Optional flag used to disable cancel button,
   * useful for dialogs where the user has no address yet
   * and we should not show this button since the dialog
   * has a "Back" button
   */
  hideCancelButton?: boolean;
}

/**
 * AddressForm Component
 *
 * A form component for adding or updating a user's address information.
 *
 * @returns {ReactNode} The rendered AddressForm component.
 */
export const AddressForm = ({
  mode = 'add',
  onSuccess,
  onFormSubmit,
  formFooter,
  theme = 'default',
  defaultValues,
  hideCancelButton,
}: AddressFormProps): ReactNode => {
  const createAddressMutation = useCreateAddress({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Address added successfully');
      },
      onError: (error) => {
        toast.error(`Failed to add address. Please try again.`);
        console.error(`Failed to add address:`, error);
      },
    },
  });

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

  async function onSubmit(data: FormAddressInput): Promise<void> {
    const line = [data.line1];

    if (data.line2) {
      line.push(data.line2);
    }

    const address: Address = {
      line,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      text: data.text,
    };

    await createAddressMutation.mutateAsync({
      data: {
        address,
      },
    });
  }

  useEffect(() => {
    if (createAddressMutation.isSuccess) {
      onSuccess && onSuccess();
    }
  }, [createAddressMutation.isSuccess]);

  // Determine button text based on mode
  const buttonText = mode === 'add' ? 'Add address' : 'Save changes';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit ? onFormSubmit : onSubmit)}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  theme === 'default' ? 'text-zinc-600' : 'text-white',
                )}
              >
                Address Line 1
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Street address"
                  {...field}
                  variant={theme}
                />
              </FormControl>
              <FormMessage
                className={cn(theme === 'glass' ? 'text-pink-300' : null)}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  theme === 'default' ? 'text-zinc-600' : 'text-white',
                )}
              >
                Address Line 2
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Apartment, suite, etc. (optional)"
                  {...field}
                  variant={theme}
                />
              </FormControl>
              <FormMessage
                className={cn(theme === 'glass' ? 'text-pink-300' : null)}
              />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    theme === 'default' ? 'text-zinc-600' : 'text-white',
                  )}
                >
                  City
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="City"
                    {...field}
                    variant={theme}
                  />
                </FormControl>
                <FormMessage
                  className={cn(theme === 'glass' ? 'text-pink-300' : null)}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    theme === 'default' ? 'text-zinc-600' : 'text-white',
                  )}
                >
                  State
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          theme === 'glass'
                            ? 'border-white/20 bg-white/5 text-white focus:border-white focus:ring-0 focus:ring-offset-0'
                            : null,
                        )}
                      >
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
                <FormMessage
                  className={cn(theme === 'glass' ? 'text-pink-300' : null)}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    theme === 'default' ? 'text-zinc-600' : 'text-white',
                  )}
                >
                  ZIP Code
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="ZIP Code"
                    inputMode="numeric"
                    maxLength={5}
                    variant={theme}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  className={cn(theme === 'glass' ? 'text-pink-300' : null)}
                />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  theme === 'default' ? 'text-zinc-600' : 'text-white',
                )}
              >
                Additional instructions
              </FormLabel>
              <FormControl>
                <Textarea
                  autoComplete="off"
                  placeholder="Up long driveway. Buzz code is..."
                  variant={theme}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className={cn(theme === 'glass' ? 'text-pink-300' : null)}
              />
            </FormItem>
          )}
        />
        {formFooter ? (
          formFooter
        ) : (
          <div className="flex w-full flex-col gap-4 pt-6 md:flex-row md:justify-end">
            {!hideCancelButton ? (
              <DialogClose asChild>
                {!createAddressMutation.isSuccess ? (
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                ) : null}
              </DialogClose>
            ) : null}
            {!createAddressMutation.isSuccess ? (
              <Button type="submit" className="w-auto">
                {createAddressMutation.isPending ? <Spinner /> : buttonText}
              </Button>
            ) : null}
          </div>
        )}
      </form>
    </Form>
  );
};
