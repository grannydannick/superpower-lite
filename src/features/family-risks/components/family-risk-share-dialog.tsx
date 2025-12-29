import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { api, $api } from '@/orpc/client';

export function FamilyRiskShareDialog({
  planId,
  isPubliclyShared,
  children,
}: {
  planId: string;
  isPubliclyShared: boolean;
  children: React.ReactNode;
}) {
  const { track } = useAnalytics();
  const queryClient = useQueryClient();
  const URL = `${env.WEBSITE_URL}/share/family-risk/plan/${planId}`;

  // Local state to track sharing status (optimistic updates)
  const [localIsShared, setLocalIsShared] = useState(isPubliclyShared);

  // Mutation to enable/disable sharing
  const setPublicSharingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await api.POST('/family-risk/plan/{id}/share', {
        params: { path: { id: planId } },
        body: { enabled },
      });

      if (error) {
        throw new Error('Failed to update sharing status');
      }

      return data;
    },
    onMutate: async (enabled) => {
      // Optimistic update
      setLocalIsShared(enabled);
    },
    onSuccess: (_, enabled) => {
      // Invalidate the family risk plan query to refresh data
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/family-risk/plan').queryKey,
      });

      if (enabled) {
        track('family_ap_share_enabled');
        toast.success('Sharing enabled');
      } else {
        track('family_ap_share_revoked');
        toast.success('Sharing revoked');
      }
    },
    onError: (_, enabled) => {
      // Revert optimistic update
      setLocalIsShared(!enabled);
      toast.error('Failed to update sharing status');
    },
  });

  const handleEnableSharing = () => {
    setPublicSharingMutation.mutate(true);
  };

  const handleRevokeSharing = () => {
    setPublicSharingMutation.mutate(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(URL);
      track('family_ap_share_copy_link_clicked');
      toast.success('Copied link to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenDialog = (open: boolean) => {
    if (open) {
      track('family_ap_share_dialog_opened');
      // Sync local state with prop when dialog opens
      setLocalIsShared(isPubliclyShared);
    }
  };

  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  // Consent screen - shown when not yet shared
  const consentContent = () => (
    <>
      <div className="max-h-80 w-full overflow-hidden rounded-[20px] border-8 border-white bg-[#64A0E9] bg-cover px-20">
        <img
          src="/family-risk/family-baby.webp"
          className="size-full object-cover object-top"
          alt="Family with baby"
        />
      </div>
      <div className="space-y-6 p-6 pt-10">
        <div className="space-y-2">
          <H2 className="text-center">Share family insights</H2>
          <Body1 className="text-balance text-center text-secondary">
            Create a shareable link to send this insight to your doctor, family
            or friends.
          </Body1>
        </div>
        <div className="space-y-2 rounded-xl bg-zinc-50 p-4">
          <Body2 className="text-secondary">
            By enabling public sharing, you consent to making these family
            health insights accessible to anyone who has the URL. <br /> This
            includes any personal health information that has been mentioned in
            each insight
          </Body2>
        </div>
        <div className="flex w-full flex-col space-y-1">
          <Button
            variant="default"
            className="gap-2 rounded-full text-center"
            onClick={handleEnableSharing}
            disabled={!planId || setPublicSharingMutation.isPending}
          >
            {setPublicSharingMutation.isPending
              ? 'Enabling sharing...'
              : 'Enable public sharing'}
          </Button>
        </div>
      </div>
    </>
  );

  // Share screen - shown when already shared
  const shareContent = () => (
    <>
      <div className="max-h-80 w-full overflow-hidden rounded-[20px] border-8 border-white bg-[#64A0E9] bg-cover px-20">
        <img
          src="/family-risk/family-baby.webp"
          className="size-full object-cover object-top"
          alt="Family with baby"
        />
      </div>
      <div className="space-y-6 p-6 pt-10">
        <div className="space-y-2">
          <H2 className="text-center">Share family insights</H2>
          <Body1 className="text-balance text-center text-secondary">
            Share this insight with your doctor, family or friends.
          </Body1>
        </div>
        <div>
          <Input value={URL} readOnly />
          <div className="flex w-full flex-col space-y-1 pt-4">
            <Button
              variant="default"
              className="gap-2 rounded-full text-center"
              onClick={handleCopy}
              disabled={!planId}
            >
              <Copy className="size-4" />
              Copy link
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRevokeSharing}
            disabled={setPublicSharingMutation.isPending}
            className="text-sm text-secondary underline transition-colors hover:text-primary disabled:opacity-50"
          >
            {setPublicSharingMutation.isPending
              ? 'Revoking sharing...'
              : 'Revoke public sharing'}
          </button>
        </div>
      </div>
    </>
  );

  const content = () => (localIsShared ? shareContent() : consentContent());

  if (isMobile) {
    return (
      <Sheet onOpenChange={handleOpenDialog}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <SheetHeader className="sr-only px-6 pb-4 pt-12">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <AIIcon className="-mt-0.5" />
              Share family insights
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild className="absolute right-2 top-2 z-10">
            <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
              <X className="h-4 min-w-4 text-white" />
            </div>
          </SheetClose>
          {content()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AIIcon className="-mt-0.5" />
            Share family insights
          </DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <Button
            variant="glass"
            className="absolute right-4 top-4 flex aspect-square size-8 items-center justify-center bg-transparent p-0 transition-all hover:bg-white/10 hover:backdrop-blur-[2px]"
          >
            <X className="size-4" />
          </Button>
        </DialogClose>
        {content()}
      </DialogContent>
    </Dialog>
  );
}
