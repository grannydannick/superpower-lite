import React, { ReactNode } from 'react';

import { Body1, Body2 } from '@/components/ui/typography';

type BannerProps = {
  title: string;
  textContent: string;
  bannerImage?: string;
  buttonGroup?: ReactNode;
};

export const Banner: React.FC<BannerProps> = ({
  title,
  textContent,
  bannerImage,
  buttonGroup,
}) => {
  return (
    <div className="mx-auto hidden h-[96px] w-full items-center gap-3 rounded-[20px] bg-zinc-100 p-5 md:flex">
      {bannerImage && (
        <div className="size-[60px]">
          <img src={bannerImage} alt="Banner Icon" />
        </div>
      )}
      <div className="flex grow items-center justify-between gap-3">
        <div>
          <Body1 className="text-base text-primary">{title}</Body1>
          <Body2 className="line-clamp-1 text-secondary">{textContent}</Body2>
        </div>
      </div>
      {buttonGroup && <div>{buttonGroup}</div>}
    </div>
  );
};
