import type { ReactNode } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';

import { Sequence } from '../../../sequence';

import { CLINICIAN_AVATARS } from './bundle-picker-assets';

interface BundlePickerHeaderProps {
  children: ReactNode;
}

export function BundlePickerHeader({ children }: BundlePickerHeaderProps) {
  const clinicianAvatarImages: ReactNode[] = [];
  for (const src of CLINICIAN_AVATARS) {
    clinicianAvatarImages.push(
      <img
        key={src}
        src={src}
        alt=""
        data-testid="clinician-avatar"
        className="inline-block size-[22px] rounded-full border-2 border-white object-cover"
      />,
    );
  }

  return (
    <>
      <Sequence.StepHeader className="hidden md:block md:p-6">
        <SuperpowerLogo className="h-4 w-auto text-zinc-900" />
      </Sequence.StepHeader>

      <div
        data-testid="bundle-picker-content"
        className="flex w-full flex-1 flex-col pb-52 pt-5 md:mx-auto md:max-w-[1100px] md:pb-28 md:pt-6"
      >
        <header className="flex flex-col gap-3 px-4 md:items-center md:px-8 md:text-center">
          <h1 className="text-3xl leading-9 tracking-tight text-zinc-900 md:text-center">
            <span className="md:hidden">
              Upgrade your
              <br />
              assessment plan
            </span>
            <span className="hidden md:inline">
              Upgrade your assessment plan
            </span>
          </h1>
          <p className="hidden max-w-md text-base leading-relaxed text-zinc-500 md:block">
            Your baseline test is already comprehensive however there are ways
            to increase your insights with additional testing
          </p>
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex -space-x-2">{clinicianAvatarImages}</div>
            <p className="flex-1 text-base leading-relaxed text-zinc-500">
              Designed by world-class clinicians
            </p>
          </div>
        </header>

        {children}
      </div>
    </>
  );
}
