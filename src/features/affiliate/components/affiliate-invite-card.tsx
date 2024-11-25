import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Body2, H4 } from '@/components/ui/typography';

export const AffiliateInviteCard = () => {
  const navigate = useNavigate();
  const handleInviteClick = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'invite_button_click',
      event_category: 'engagement',
      event_label: 'latest-referral-card',
    });
    navigate(`/invite?source=latest-referral-card`);
  };

  return (
    <div className="flex h-[188px] w-full flex-col justify-between rounded-3xl bg-zinc-100 p-5">
      <div className="flex flex-col">
        <H4 className="text-primary">Invite a friend to join</H4>
        <Body2 className="text-zinc-400">
          Invite friends or family members to bypass the Superpower waitlist.
        </Body2>
      </div>

      <div className="mt-6 flex h-14 justify-between">
        <img
          className="size-14"
          src="/affiliate/welcome-box.webp"
          alt="Welcome box"
        />
        <Button className="h-11 w-[107px] self-end" onClick={handleInviteClick}>
          <Body2 className="text-white">Invite friend</Body2>
        </Button>
      </div>
    </div>
  );
};
