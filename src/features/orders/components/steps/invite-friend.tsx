import React from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Body2, H2 } from '@/components/ui/typography';
import { CopyLinkInput } from '@/features/affiliate/components/copy-link';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';

export const InviteFriend = () => {
  const navigate = useNavigate();

  const handleInviteClick = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'invite_button_click',
      event_category: 'engagement',
      event_label: 'checkout-modal',
    });

    navigate(`/invite?source=checkout-modal`);
  };

  return (
    <>
      <div className="space-y-8 p-6 md:p-14">
        <H2 className="text-zinc-900">Get $100 off your next order</H2>
        <Body2 className="mt-4 space-y-2 text-base text-secondary">
          Invite a friend or family member to Superpower.
        </Body2>
        <Body2 className="mt-2 space-y-2 text-base text-secondary">
          Each person that joins Superpower gives you $100 to use when checking
          out Superpower services and products on the marketplace.
        </Body2>

        <div className="mt-8">
          <CopyLinkInput />
        </div>
      </div>
      <HealthcareServiceFooter
        prevBtn={
          <DialogClose>
            <Button variant="outline" className="w-full md:w-auto">
              Done
            </Button>
          </DialogClose>
        }
        nextBtn={
          <Button className="w-full md:w-auto" onClick={handleInviteClick}>
            Invite friend
          </Button>
        }
      />
    </>
  );
};
