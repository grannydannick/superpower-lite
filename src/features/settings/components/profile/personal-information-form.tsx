import { Lock } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/lib/auth';
import { capitalize } from '@/utils/format';

export function PersonalInformationForm() {
  const { data: user } = useUser();
  // const { data: avatar, isLoading: isAvatarLoading } = useAvatar({
  //   username: user?.username ?? '',
  // });

  // const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { firstName, lastName, dateOfBirth, gender } = user;

  return (
    <div className="flex flex-col gap-8">
      {/* <div className="flex w-full flex-col items-start">
        <Label className="text-sm text-[#71717A]">Profile Photo</Label>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="group relative mt-2 p-0"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            <div className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-black p-1 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
              <Plus strokeWidth={2.5} className="size-4 text-white" />
            </div>
            <Avatar
              className="size-20"
              src={avatar?.original}
              isLoading={isAvatarLoading}
            />
          </Button>
          <Button
            variant="default"
            size="small"
            className="mt-2"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            Edit profile image
          </Button>
        </div>
      </div> */}
      <div
        className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-4"
        id="personal"
      >
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">First Name</Label>
          <div className="relative">
            <Input
              className="bg-white md:bg-[#EFEFEF4D]"
              name="firstName"
              id="firstName"
              value={firstName}
              disabled
            />
            <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
          </div>
        </div>
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">Last Name</Label>
          <div className="relative">
            <Input
              className="bg-white md:bg-[#EFEFEF4D]"
              name="lastName"
              id="lastName"
              value={lastName}
              disabled
            />
            <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-[#71717A]">Birth Date</Label>
        <div className="relative">
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            name="dateOfBirth"
            id="dateOfBirth"
            value={new Date(dateOfBirth).toISOString().slice(0, 10)}
            disabled
          />
          <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-[#71717A]">Biological Sex</Label>
        <div className="relative">
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            name="gender"
            id="gender"
            value={capitalize(gender.toLowerCase())}
            disabled
          />
          <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
        </div>
      </div>
      {/* <EditAvatarModal
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
      /> */}
    </div>
  );
}
