import { cva } from 'class-variance-authority';
import { ImagePlus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { useAvatar } from '@/features/avatar/api/get-avatar';
import { cardVariants } from '@/features/shareables/utils/card-variants';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

const interactiveCardVariants = cva(
  'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center',
  {
    variants: {
      type: {
        scoreCard:
          'z-10 -ml-2 -rotate-1 bg-[url("/cards/organic-orange.webp")] group-hover:-ml-10 group-hover:-rotate-6',
        ageCard:
          'ml-1 rotate-2 bg-[url("/cards/age-card.webp")] group-hover:ml-10 group-hover:rotate-3',
      },
    },
  },
);

const AVATAR_UPLOAD_DIALOG_COOKIE = 'avatar_upload:dialog_dismissed';
const AVATAR_UPLOAD_DIALOG_MAX_AGE = 60 * 60 * 24 * 365 * 10;

export const CompleteAvatarUploadModal = () => {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { data: avatar, isLoading: isAvatarLoading } = useAvatar({
    username: user?.username ?? '',
  });

  const getInitial = () => {
    if (typeof document === 'undefined') return false;
    return !document.cookie
      .split('; ')
      .some((c) => c.startsWith(`${AVATAR_UPLOAD_DIALOG_COOKIE}=`));
  };

  const [_open, _setOpen] = useState(getInitial);
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(_open) : value;
      document.cookie = [
        `${AVATAR_UPLOAD_DIALOG_COOKIE}=${next ? '' : '1'}`,
        `path=/`,
        `max-age=${AVATAR_UPLOAD_DIALOG_MAX_AGE}`,
      ].join('; ');
      _setOpen(next);
    },
    [_open],
  );

  const shouldShowModal = _open && !isAvatarLoading && !avatar?.original;

  return (
    <Dialog open={shouldShowModal} onOpenChange={setOpen}>
      <DialogContent className={cn(dialogVariants({ size: 'xlarge' }))}>
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-5 top-5 text-zinc-400"
          >
            <X strokeWidth={2.5} className="size-4" />
          </Button>
        </DialogClose>
        <div className="group relative mb-12 mt-4 flex h-72 w-full items-center justify-center">
          <div
            className={cn(
              cardVariants({ type: 'scoreCard' }),
              interactiveCardVariants({ type: 'scoreCard' }),
            )}
          >
            <SuperpowerScoreLogo className="absolute left-4 top-2 w-36" />
            <div className="flex size-24 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg">
              <ImagePlus className="size-8 text-white" />
            </div>
          </div>
          <div
            className={cn(
              cardVariants({ type: 'ageCard' }),
              interactiveCardVariants({ type: 'ageCard' }),
            )}
          >
            <H4 className="absolute left-4 top-2 w-32 text-lg text-white">
              Biological Age
            </H4>
            <div className="flex size-24 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg">
              <ImagePlus className="size-8 text-white" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <H3 className="text-center">New personalized member cards</H3>
          <Body1 className="text-center text-secondary">
            Upload a profile photo to personalize your superpower score and
            biological age cards.
          </Body1>
        </div>
        <div className="flex flex-col items-end justify-between">
          <Button
            variant="default"
            className="h-12 w-full rounded-full"
            onClick={() => {
              navigate('/settings');
              setOpen(false);
            }}
          >
            Upload profile photo
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full"
            data-testid="keep-default-avatar-btn"
            onClick={() => {
              setOpen(false);
            }}
          >
            Keep default avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
