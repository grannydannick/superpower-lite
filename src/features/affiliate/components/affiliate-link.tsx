import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckIcon, LinkIcon, SendIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { useInviteLink } from '../hooks/use-invite-link';

export function AffiliateLink({ className }: { className?: string }) {
  const { link } = useInviteLink();

  const { copyToClipboard, copied } = useCopyToClipboard(link, {
    resetDelay: 2000,
  });

  return (
    <div className={className}>
      <div className="mt-2 flex flex-col gap-4">
        <div className="relative flex w-full overflow-hidden rounded-xl border bg-white text-base shadow-sm">
          <Input
            className="h-14 rounded-none border-none pr-32 shadow-none"
            value={link}
            readOnly
            onClick={(e) => {
              //select the text when clicked
              (e.target as HTMLInputElement).select();
            }}
          ></Input>
          <Button
            variant={'link'}
            size="small"
            className="absolute right-0 top-1/2 h-14 shrink-0 -translate-y-1/2 px-4 text-vermillion-900"
            onClick={() => {
              copyToClipboard();
              toast.success('Link copied');
            }}
          >
            Copy Link
            {copied ? (
              <CheckIcon className="ml-2 size-4" />
            ) : (
              <LinkIcon className="ml-2 size-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-200"></div>
          <div className="shrink-0">
            <Body1 className="text-secondary">or invite via email</Body1>
          </div>
          <div className="h-px flex-1 bg-zinc-200"></div>
        </div>
        <div>
          <AffiliateInviteForm />
        </div>
      </div>
    </div>
  );
}

export const AffiliateInviteForm = () => {
  const { track } = useAnalytics();

  const { link } = useInviteLink();

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return new Promise((resolve) => {
        // temporary - using posthog to send invite event
        track('referral_invite_sent', {
          email,
          invite_url: link,
        });
        //simulate network request
        setTimeout(() => {
          resolve(email);
        }, 1000);
      });
    },
    onSuccess: (email) => {
      toast.success(`Invited ${email}`);
      form.reset();
    },
  });

  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .min(1, 'Please enter an email address.')
          .email('Please enter a valid email address.'),
      }),
    ),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
    },
  });

  React.useEffect(() => {
    if (mutation.isSuccess && form.formState.isDirty) {
      mutation.reset();
    }
  }, [mutation, form.formState.isDirty]);

  const onSubmit = (data: { email: string }) => {
    mutation.mutate(data.email);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-stretch gap-2">
          <div className="grow">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => {
                return (
                  <FormItem className="">
                    <FormControl>
                      <Input
                        variant={fieldState.error ? 'error' : 'default'}
                        autoComplete="off"
                        placeholder="Your friend's email"
                        {...field}
                        className="h-14"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div>
            <Button type="submit" className="h-14">
              Invite
              {mutation.isPending ? (
                <Spinner className="ml-2" />
              ) : mutation.isSuccess ? (
                <CheckIcon className="ml-2 size-4" />
              ) : (
                <SendIcon className="ml-2 size-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
