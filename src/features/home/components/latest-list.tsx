import React, { Fragment } from 'react';

import { AffiliateInviteCard } from '@/features/affiliate/components/affiliate-invite-card';
import { BiologicalAgeCard } from '@/features/biomarkers/components/biological-age-card';
import { ScoreCard } from '@/features/biomarkers/components/score-card';
import { CompleteOnboardingCard } from '@/features/home/components/complete-onboarding-card';

export const LatestList = () => {
  const cards = [
    {
      content: <CompleteOnboardingCard />,
    },
    {
      content: <ScoreCard />,
    },
    {
      content: <BiologicalAgeCard />,
    },
    {
      content: <AffiliateInviteCard />,
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((c, index) => (
        <Fragment key={index}>{c.content}</Fragment>
      ))}
    </div>
  );
};
