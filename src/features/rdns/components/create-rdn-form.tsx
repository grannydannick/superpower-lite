import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { useCreateRdn } from '@/features/rdns/api/create-rdn';

export function CreateRdnForm(): JSX.Element {
  const { mutateAsync, isPending } = useCreateRdn();

  const formSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    licensed: z.string().min(1),
    npi: z.string().min(1),
    schedulingLink: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      npi: '',
      schedulingLink: '',
      licensed: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>): Promise<void> {
    await mutateAsync({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        schedulingLink: data.schedulingLink,
        npi: data.npi,
        licensed: data.licensed.split(',').map((l) => l.trim().toUpperCase()),
      },
    });
  }

  return (
    <div>
      <h1 className="text-xl">Create New RDN</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 pt-8">
          <div className="flex flex-col gap-4">
            <div>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-[#71717A]">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-[#71717A]">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
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
            </div>
            <div>
              <FormField
                control={form.control}
                name="npi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-[#71717A]">
                      NPI
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="NPI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="schedulingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-[#71717A]">
                      Scheduling Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://calendly.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="mt-4 w-full">
              {isPending ? <Spinner /> : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
