import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  CreateRdnInput,
  createRdnInputSchema,
  useCreateRdn,
} from '@/features/rdns/api/create-rdn';

export function CreateRdnForm(): JSX.Element {
  const { mutateAsync, isPending } = useCreateRdn();

  const form = useForm<CreateRdnInput>({
    resolver: zodResolver(createRdnInputSchema),
    defaultValues: {
      npi: '',
      schedulingLink: '',
      licensed: '',
      userId: '',
    },
  });

  async function onSubmit(data: CreateRdnInput): Promise<void> {
    await mutateAsync({
      data,
    });
  }

  return (
    <div>
      <h1 className="text-xl">Create New RDN</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 pt-8">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="licensed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#71717A]">
                    Licensed States (comma-separated, two characters)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="CA, UT, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="npi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#71717A]">NPI</FormLabel>
                  <FormControl>
                    <Input placeholder="NPI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedulingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#71717A]">
                    Scheduling Link
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://calendly.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#71717A]">
                    User Id
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="userid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 w-full">
              {isPending ? <Spinner /> : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
