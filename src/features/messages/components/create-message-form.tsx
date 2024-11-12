import { zodResolver } from '@hookform/resolvers/zod';
import { TimerIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Body1 } from '@/components/ui/typography';

import {
  CreateMessageInput,
  createMessageInputSchema,
  useCreateMessage,
} from '../api/create-message';

export const CreateMessageForm = (): JSX.Element => {
  const form = useForm<CreateMessageInput>({
    resolver: zodResolver(createMessageInputSchema),
    defaultValues: {
      text: '',
      type: 'concierge',
    },
  });

  const createMessageMutation = useCreateMessage({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Message sent. We will get back in <24 hrs on weekdays.');
        form.reset();
      },
    },
  });

  function onSubmit(values: CreateMessageInput) {
    createMessageMutation.mutate({ data: values });
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="h-[150px] w-full resize-none rounded-[20px] px-[18px] py-6"
                  placeholder="Ask questions about your health, book appointments, and get answers from expert clinicians"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-1">
            <TimerIcon color="#71717A" className="size-4" />
            <Body1 className="line-clamp-1 text-zinc-500">{`Response Time: < 24 hrs on weekdays`}</Body1>
          </div>

          <Button
            className="w-full md:w-auto"
            type="submit"
            disabled={createMessageMutation.isPending}
          >
            {createMessageMutation.isPending ? <Spinner /> : 'Send Message'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
