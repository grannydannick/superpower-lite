import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Body2 } from '@/components/ui/typography';
import { US_STATES } from '@/const';
import { useCreatePatient } from '@/features/insurance/api/create-patient';
import {
  CreatePolicyInput,
  createPolicyInputSchema,
  useCreatePolicy,
} from '@/features/insurance/api/create-policy';
import { usePayers } from '@/features/insurance/api/get-payers';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const CreatePolicyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { data: user } = useUser();
  const createPolicyMutation = useCreatePolicy();
  const createPatientMutation = useCreatePatient();

  const [requireMemberId, setRequireMemberId] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);

  const getPayersQuery = usePayers({
    data: {
      query: debouncedSearch,
      limit: 100,
    },
  });

  const payers = getPayersQuery.data?.payers ?? [];

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicyInputSchema),
    defaultValues: {
      state: user?.primaryAddress?.address.state,
      firstName: user?.firstName,
      lastName: user?.lastName,
      dateOfBirth: user?.dateOfBirth ? new Date(user?.dateOfBirth) : undefined,
    },
  });

  const payerMemberId = form.watch('payer.memberId');

  useEffect(() => {
    setRequireMemberId(payerMemberId ?? false);
  }, [payerMemberId]);

  async function onSubmit(values: CreatePolicyInput) {
    const policy = await createPolicyMutation.mutateAsync({ data: values });

    if (policy.status === 'UNKNOWN') {
      toast.error(
        'The benefits for this payer aren’t available. Try again later.',
      );

      return;
    }

    if (policy.status === 'INVALID' && policy?.errors) {
      for (const error of policy.errors) {
        // Note, there are some errors that require you to override a Payer’s optional Member ID behavior, and collect it (72 and 76).
        if (error.code === '72') {
          toast.error('Member ID not found, please provide one');
          setRequireMemberId(true);
          return;
        }

        if (error.code === '76') {
          toast.error('Duplicate patient found, provide member ID');
          setRequireMemberId(true);
          return;
        }
      }
    }

    await createPatientMutation.mutateAsync({
      data: {
        state: policy.state,
        firstName: policy.person?.firstName ?? '',
        lastName: policy.person?.lastName ?? '',
        dateOfBirth: policy.person?.dateOfBirth
          ? new Date(policy.person.dateOfBirth)
          : new Date(),
        email: user?.email ?? '',
        coverage: [{ rank: 0, policyId: policy.id }],
        phone: user?.phone,
      },
    });

    onSuccess();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 md:max-w-[372px]"
      >
        <Body2 className="text-zinc-500">
          Enter your insurance details below to be notified when Superpower
          begins accepting insurance for provider consults.
        </Body2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Legal first name" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Legal last name" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => {
            const { value, ...rest } = field;

            return (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    value={value.toISOString().slice(0, 10)}
                    {...rest}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="payer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Providers</FormLabel>
              {/*https://github.com/shadcn-ui/ui/issues/542#issuecomment-1587142689*/}
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'justify-between truncate',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? payers.find((payer) => payer.id === field.value.id)
                            ?.name
                        : 'Select provider'}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search providers..."
                      onValueChange={(value) => setSearchQuery(value)}
                    />
                    <CommandList>
                      {getPayersQuery.isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Spinner variant="primary" />
                        </div>
                      ) : null}
                      {!getPayersQuery.isLoading ? (
                        <CommandEmpty>No provider found.</CommandEmpty>
                      ) : null}
                      <CommandGroup>
                        {payers.map((payer) => (
                          <CommandItem
                            value={payer.name}
                            key={payer.id}
                            onSelect={() => {
                              form.setValue('payer', payer);
                              form.clearErrors('payer');
                            }}
                          >
                            {payer.name}
                            <Check
                              className={cn(
                                'ml-auto',
                                payer.id === field.value?.id
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>State</FormLabel>
              {/*https://github.com/shadcn-ui/ui/issues/542#issuecomment-1587142689*/}
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'justify-between truncate',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? US_STATES.find((state) => state.value === field.value)
                            ?.label
                        : 'Select state'}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search states..." />
                    <CommandList>
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {US_STATES.map((state) => (
                          <CommandItem
                            value={state.label}
                            key={state.value}
                            onSelect={() => {
                              form.setValue('state', state.value);
                            }}
                          >
                            {state.label}
                            <Check
                              className={cn(
                                'ml-auto',
                                state.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem className={cn(requireMemberId ? 'block' : 'hidden')}>
              <FormLabel>Member ID</FormLabel>
              <FormControl>
                <Input placeholder="Member ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pb-12">
          <Button
            className="w-full"
            type="submit"
            disabled={
              createPolicyMutation.isPending ||
              getPayersQuery.isPending ||
              createPatientMutation.isPending
            }
          >
            {createPolicyMutation.isPending ||
            getPayersQuery.isPending ||
            createPatientMutation.isPending ? (
              <Spinner />
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
