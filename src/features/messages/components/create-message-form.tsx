import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowUpIcon, Clock, Loader, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Body1, H3 } from '@/components/ui/typography';

import {
  CreateMessageInput,
  createMessageInputSchema,
  useCreateMessage,
} from '../api/create-message';

export const CreateMessageForm = () => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const form = useForm<CreateMessageInput>({
    resolver: zodResolver(createMessageInputSchema),
    defaultValues: {
      text: '',
      type: 'concierge',
    },
  });

  const watchedText = useWatch({
    control: form.control,
    name: 'text',
  });
  const watchedTextValue = watchedText ?? '';

  const createMessageMutation = useCreateMessage({
    mutationConfig: {
      onSuccess: () => {
        setShowConfirmationModal(true);
        toast.success('Message sent! We will get back to you within 24 hours.');
        form.reset();
      },
    },
  });

  function onSubmit(values: CreateMessageInput) {
    if (createMessageMutation.isPending) return;

    createMessageMutation.mutate({ data: values });
  }

  return (
    <>
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
                  <div className="flex flex-col-reverse gap-2 lg:flex-col lg:gap-4">
                    <div className="rounded-xl border border-zinc-200 bg-white px-4 pt-4">
                      <Textarea
                        {...field}
                        placeholder="Ask questions about your health from longevity advisors and get help from our customer service team"
                        className="min-h-0 border-none p-1 outline-none scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={createMessageMutation.isPending}
                      />

                      <div className="flex w-full flex-row justify-end pb-4 pt-2">
                        <Button
                          className="h-fit rounded-full p-1.5"
                          type="submit"
                          disabled={
                            watchedTextValue.length === 0 ||
                            createMessageMutation.isPending
                          }
                          aria-busy={createMessageMutation.isPending}
                          aria-label={
                            createMessageMutation.isPending
                              ? 'Sending message'
                              : 'Send message'
                          }
                        >
                          {createMessageMutation.isPending ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <ArrowUpIcon size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <SuccessDialog
        showConfirmationModal={showConfirmationModal}
        setShowConfirmationModal={setShowConfirmationModal}
      />
    </>
  );
};

const SuccessDialog = ({
  showConfirmationModal,
  setShowConfirmationModal,
}: {
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
}) => {
  const navigate = useNavigate();

  return (
    <Dialog
      open={showConfirmationModal}
      onOpenChange={setShowConfirmationModal}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-3 top-3 text-zinc-500"
          >
            <XIcon size={16} />
          </Button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="hidden">Message Sent</DialogTitle>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div className="flex -space-x-2">
              <img
                className="size-20 min-w-20 rounded-full border-2 border-white object-cover"
                src="/services/doctors/doc_1.webp"
                alt="Superpower Concierge Doctor 1"
              />
              <img
                className="size-20 min-w-20 rounded-full border-2 border-white object-cover"
                src="/services/doctors/doc_2.webp"
                alt="Superpower Concierge Doctor 2"
              />
              <img
                className="size-20 min-w-20 rounded-full border-2 border-white object-cover"
                src="/services/doctors/doc_3.webp"
                alt="Superpower Concierge Doctor 3"
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-zinc-400" size={16} />
              <Body1 className="line-clamp-1 text-center text-zinc-400">{`<24h on weekdays`}</Body1>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-2 px-8 py-4">
          <H3 className="text-center">Your care team is contacted via SMS</H3>
          <Body1 className="mb-11 text-center text-secondary">
            Your care team has been contacted. One of our health experts will
            text you from &nbsp;
            <a
              href="tel:+14157422828"
              className="text-vermillion-900 transition-all duration-150 hover:text-vermillion-700"
            >
              +1 (415) 742-2828
            </a>
            &nbsp; within 24 hours on weekdays.
          </Body1>
          <Button
            variant="default"
            className="w-full rounded-full"
            onClick={() => {
              void navigate({ to: '/concierge' });
            }}
          >
            Message Superpower AI
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full text-zinc-500"
            onClick={() => {
              setShowConfirmationModal(false);
            }}
          >
            Return to Concierge Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
