import { Description } from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { ImagePlus, RefreshCcw, X } from 'lucide-react';
import { useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Hover3D } from '@/components/ui/hover-3d';
import { SimpleTabs, SimpleTabsContent } from '@/components/ui/simple-tabs';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2 } from '@/components/ui/typography';
import { cardVariants } from '@/features/shareables/utils/card-variants';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { useAvatar } from '../api/get-avatar';
import { useUploadAvatar } from '../api/upload-avatar';
import { removeBackground } from '../utils/remove-background';

import { AvatarUploadWrapper } from './avatar-upload-wrapper';

export const EditAvatarModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const uploadAvatarMutation = useUploadAvatar();

  // Local blobs that need to be uploaded to the server
  const [originalAvatar, setOriginalAvatar] = useState<Blob | null>(null);
  const [removedBackgroundAvatar, setRemovedBackgroundAvatar] =
    useState<Blob | null>(null);
  const { data: user } = useUser();

  const { data: avatar } = useAvatar({
    username: user?.username ?? '',
  });

  if (!user) {
    return <div>No user found</div>;
  }

  const { firstName, lastName } = user;

  const handleFileChange = async (file: File) => {
    setIsUploading(true);
    try {
      const removeBackgroundPromise = removeBackground(file);
      toast.promise(removeBackgroundPromise, {
        loading: 'Uploading...',
        success: () => {
          return <div>Uploaded image successfully</div>;
        },
        error: () => {
          return <div>Failed to upload</div>;
        },
      });
      const blob = await removeBackgroundPromise;
      setOriginalAvatar(file);
      setRemovedBackgroundAvatar(blob);

      uploadAvatarMutation.mutate({
        data: {
          avatar: file,
          // removed background avatar is always a png file
          avatar_bg_removed: new File([blob], 'avatar_bg_removed.png', {
            type: 'image/png',
          }),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const originalAvatarSrc = originalAvatar
    ? URL.createObjectURL(originalAvatar)
    : avatar?.original;

  const removedBackgroundAvatarSrc = removedBackgroundAvatar
    ? URL.createObjectURL(removedBackgroundAvatar)
    : avatar?.removedBg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogVariants({ size: 'xlarge' }))}>
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-5 top-5 text-zinc-400"
          >
            <X strokeWidth={2.5} className="size-4" />
          </Button>
        </DialogClose>
        <DialogTitle>
          <Body1 className="text-zinc-400">Edit Profile Photo</Body1>
        </DialogTitle>
        <div className="flex flex-col items-center justify-center gap-2">
          <SimpleTabs
            tabs={[
              { label: 'Profile Photo', value: 'profile-photo' },
              { label: 'Member Card', value: 'member-card' },
            ]}
            defaultTab="profile-photo"
            className="flex flex-col items-center justify-center"
          >
            <SimpleTabsContent
              value="profile-photo"
              className="flex flex-col items-center justify-center"
            >
              <div className="relative flex h-96 w-full items-center justify-center">
                {isUploading && <CircleLoadingIndicator />}
                <AvatarUploadWrapper onFileChange={handleFileChange}>
                  <div className="group cursor-pointer rounded-full transition-all duration-500 ease-out animate-in zoom-in-95">
                    <Avatar
                      src={originalAvatarSrc}
                      className="mx-auto size-36"
                    />
                    <UploadIndicator />
                  </div>
                </AvatarUploadWrapper>
              </div>
            </SimpleTabsContent>
            <SimpleTabsContent
              value="member-card"
              className="flex flex-col items-center justify-center"
            >
              <div className="relative flex h-96 w-full items-center justify-center py-4">
                <Hover3D
                  options={{
                    shadow: {
                      opacity: 0.1,
                      color: 'rgba(0, 0, 0)',
                    },
                    resetOnHover: true,
                    resetDuration: 500,
                  }}
                >
                  <AvatarUploadWrapper
                    onFileChange={handleFileChange}
                    className="group h-80 cursor-pointer"
                  >
                    <div
                      className={cn(
                        'relative animate-in zoom-in-95',
                        cardVariants({ type: 'scoreCard' }),
                      )}
                    >
                      <SuperpowerLogo
                        className="absolute left-5 top-4 w-32"
                        fill="white"
                      />
                      {(removedBackgroundAvatar || avatar?.removedBg) && (
                        <div className="absolute left-1/2 top-1/2 -mt-4 size-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [mask-image:radial-gradient(circle,black_10%,transparent_70%)]">
                          <div className="absolute inset-0 bg-vermillion-900 mix-blend-soft-light" />
                          <Avatar
                            src={
                              removedBackgroundAvatarSrc || avatar?.removedBg
                            }
                            className="size-full"
                          />
                        </div>
                      )}
                      <UploadIndicator />
                      <div className="absolute bottom-5 left-5">
                        <Body1 className="text-white">
                          {firstName} {lastName}
                        </Body1>
                        <Body2 className="text-white/60">Member Card</Body2>
                      </div>
                    </div>
                  </AvatarUploadWrapper>
                </Hover3D>
              </div>
            </SimpleTabsContent>
          </SimpleTabs>
          <AvatarUploadWrapper onFileChange={handleFileChange} className="mb-4">
            <Button variant="outline" className="max-w-xs">
              <RefreshCcw className="mr-2 size-4 text-zinc-500" />
              Change profile image
            </Button>
          </AvatarUploadWrapper>
          <Body2 className="max-w-sm text-center text-zinc-400">
            Ideally upload a portrait photo with a clear background for best
            results on your personalized member card.
          </Body2>
        </div>
        <Description hidden>
          Edit your profile photo and member card.
        </Description>
      </DialogContent>
    </Dialog>
  );
};

const UploadIndicator = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 p-4 opacity-0 backdrop-blur-lg transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      <ImagePlus className="size-6 text-white" />
    </div>
  );
};

const CircleLoadingIndicator = () => {
  return (
    <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
      <svg width="100%" height="100%" viewBox="0 0 48 48">
        {Array.from({ length: 64 }).map((_, i) => {
          const angle = (i * 360) / 64;
          const x1 = 24 + Math.cos((angle * Math.PI) / 180) * 19;
          const y1 = 24 + Math.sin((angle * Math.PI) / 180) * 19;
          const baseX2 = 24 + Math.cos((angle * Math.PI) / 180) * 20;
          const baseY2 = 24 + Math.sin((angle * Math.PI) / 180) * 20;
          const randomRadius = 18 + Math.random() * 4;
          const extendedX2 =
            24 + Math.cos((angle * Math.PI) / 180) * randomRadius;
          const extendedY2 =
            24 + Math.sin((angle * Math.PI) / 180) * randomRadius;
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              stroke="#FF6B00"
              strokeLinecap="round"
              strokeWidth="0.5"
              initial={{
                opacity: 0.5,
                x2: baseX2,
                y2: baseY2,
              }}
              animate={{
                opacity: [0.1, 1, 0.1],
                strokeWidth: ['0.5', '1', '0.5'],
                x2: [baseX2, extendedX2, baseX2],
                y2: [baseY2, extendedY2, baseY2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.03,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};
