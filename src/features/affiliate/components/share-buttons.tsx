import { MessageCircleMore } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';

type ShareButtonsProps = {
  message: string;
};

export const ShareButtons: React.FC<ShareButtonsProps> = ({ message }) => {
  const smsShareLink = `sms:?&body=${encodeURIComponent(message)}`;
  const twitterShareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

  const handleTwitterShare = () => {
    window.open(twitterShareLink, '_blank', 'noopener,noreferrer');
  };

  const handleTextShare = () => {
    window.open(smsShareLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="h-11 w-[117px]"
        onClick={handleTwitterShare}
      >
        <div className="flex items-center justify-center gap-2">
          <img src="/affiliate/x-icon.svg" alt="X icon" className="size-4" />
          <Body2 className="text-primary">X/Twitter</Body2>
        </div>
      </Button>
      <Button
        variant="outline"
        className="h-11 w-[140px]"
        onClick={handleTextShare}
      >
        <div className="flex items-center justify-center gap-2 text-sm">
          <MessageCircleMore stroke="#A1A1AA" className="h-[18px] w-auto" />
          <Body2 className="text-primary">Share via Text</Body2>
        </div>
      </Button>
    </div>
  );
};
