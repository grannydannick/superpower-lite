import { Description } from '@radix-ui/react-dialog';
import { LinkedInLogoIcon } from '@radix-ui/react-icons';
import { Download, LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';

import { InstagramIcon } from '@/components/icons/instagram-icon';
import { XIcon } from '@/components/icons/x-icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { buildShareableLink } from '@/features/shareables/const/link-builder';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { SHARE_TEXT } from '../const/share-text';

export const SharingOptionsModal = ({
  open,
  onOpenChange,
  cardType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardType: 'score' | 'age' | 'age-hidden';
}) => {
  const { data: user } = useUser();
  const shortCardType =
    cardType === 'score' ? 's' : cardType === 'age' ? 'ba' : 'b';
  const shareText = SHARE_TEXT[cardType];

  const socialShareOptions = [
    {
      label: 'Share on X (formerly Twitter)',
      icon: XIcon,
      action: () => {
        window.open(
          `https://x.com/share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
            buildShareableLink({
              format: 'o',
              cardType: shortCardType,
              platform: 't',
              username: user?.username,
            }),
          )}`,
          '_blank',
        );
      },
    },
    {
      label: 'Share on LinkedIn',
      icon: LinkedInLogoIcon,
      action: () => {
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
            buildShareableLink({
              format: 'o',
              cardType: shortCardType,
              platform: 'l',
              username: user?.username,
            }),
          )}`,
          '_blank',
        );
      },
    },
    {
      label: 'Share on Instagram',
      icon: InstagramIcon,
      action: () => {
        window.open(
          buildShareableLink({
            format: 's',
            cardType: shortCardType,
            platform: 'i',
            username: user?.username,
          }),
          '_blank',
        );
      },
    },
    {
      label: 'Share Link',
      icon: LinkIcon,
      action: () => {
        navigator.clipboard.writeText(
          buildShareableLink({
            format: 'o',
            cardType: shortCardType,
            platform: 't',
            username: user?.username,
          }),
        );
        toast.success('Link copied to clipboard');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent
          isStacked
          className={cn(
            dialogVariants({ size: '2xlarge' }),
            'md:min-h-[750px]',
          )}
        >
          <DialogTitle>
            <Body1 className="text-zinc-400">Share your results</Body1>
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute right-5 top-5 text-zinc-400"
            >
              <X strokeWidth={2.5} className="size-4" />
            </Button>
          </DialogClose>
          <div className="flex flex-col gap-4">
            <div className="mb-4 flex min-h-[40vh] w-full flex-1 items-center justify-center rounded-xl bg-zinc-100 p-4 md:min-h-96 md:p-14">
              <div className="relative aspect-[12/17] h-full max-h-96 overflow-hidden rounded-[20px]">
                <img
                  src={buildShareableLink({
                    cardType: shortCardType,
                    format: 'c',
                    platform: 'r',
                    username: user?.username,
                  })}
                  alt={
                    cardType === 'score'
                      ? 'Superpower Score'
                      : cardType === 'age'
                        ? 'Biological Age'
                        : 'Biological Age (hidden)'
                  }
                  className="relative z-10 size-full max-h-96 object-contain"
                />
                <Skeleton className="absolute inset-0 z-0 size-full" />
              </div>
            </div>
            <div>
              <Body1 className="mb-2 text-center text-zinc-900 md:text-left">
                Share via
              </Body1>
              <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex w-full items-center justify-center gap-2 md:w-auto md:justify-start">
                  {socialShareOptions.map((option) => (
                    <Button
                      key={option.label}
                      variant="ghost"
                      className="size-12 gap-2 rounded-full bg-zinc-100 p-0 text-black transition-colors hover:bg-zinc-200"
                      onClick={option.action}
                    >
                      <option.icon className="size-4" />
                    </Button>
                  ))}
                </div>
                <Button
                  variant="default"
                  className="flex h-12 items-center gap-2"
                  onClick={() => {
                    window.open(
                      buildShareableLink({
                        cardType: shortCardType,
                        format: 's',
                        platform: 'd',
                        username: user?.username,
                      }),
                      '_blank',
                    );
                  }}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
          {/* make the modal accessible for screen readers */}
          <Description hidden>
            Share your results with your friends and family.
          </Description>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
