import React, { useState } from 'react';

import { Banner } from '@/components/ui/banner';
import { getBannerVariant, getCookie, setCookie } from '@/utils/banner-cookie';

import { ButtonGroup } from './button-group';

export const AffiliateBanner = () => {
  // If `dismissDate` exists, hide the banner
  const [isVisible, setIsVisible] = useState(!getCookie('dismissDate'));
  const bannerVariant = getBannerVariant();

  const handleDismiss = () => {
    // Set the dismissal date to hide the banner and rotate variants next week
    setCookie('dismissDate', new Date().toISOString(), 7);
    // Hide the banner without reloading
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const simpleSubtext =
    'Earn $100 for each friend you invite that joins Superpower';
  switch (bannerVariant) {
    case 'A':
      return (
        <Banner
          title="Invite a friend and earn $100"
          textContent={simpleSubtext}
          buttonGroup={
            <ButtonGroup
              sourceParam="simple-referral"
              onDismiss={handleDismiss}
            />
          }
        />
      );
    case 'B':
      return (
        <Banner
          title="Get free supplements from the Superpower marketplace"
          textContent={simpleSubtext}
          bannerImage="/affiliate/banner-supplements.webp"
          buttonGroup={
            <ButtonGroup
              sourceParam="supplements-referral"
              onDismiss={handleDismiss}
            />
          }
        />
      );
    case 'C':
      return (
        <Banner
          title="Get a free gut microbiome test"
          textContent="Invite friends to Superpower to get a free gut microbiome test valued at $199"
          bannerImage="/affiliate/banner-gut-microbiome.webp"
          buttonGroup={
            <ButtonGroup
              sourceParam="gut-microbe-referral"
              onDismiss={handleDismiss}
            />
          }
        />
      );
    default:
      return null;
  }
};
