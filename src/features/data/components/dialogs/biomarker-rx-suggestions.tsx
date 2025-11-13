import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import { useRx } from '@/features/rx/api/get-rx';
import { ServiceActionCard } from '@/features/services/components/service-action-card';
import { BiomarkerRecommendedTests } from '@/types/api';
import { getPrescriptionImage } from '@/utils/prescription';

export const BiomarkerRxSuggestion = ({
  recommendedTests,
}: {
  recommendedTests: BiomarkerRecommendedTests;
}) => {
  const getRxQuery = useRx();
  const navigate = useNavigate();

  if (getRxQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  const rx = getRxQuery.data;

  if (!rx) {
    return null;
  }

  const recommendedRxIds = new Set(recommendedTests.rx.map((s) => s.id));

  const filteredRx = rx.filter((r) => recommendedRxIds.has(r.id));

  if (!filteredRx) return null;

  return recommendedTests.rx.map((rt) => {
    const existingRx = filteredRx.find((rx) => rx.id === rt.id);

    return (
      <div className="space-y-2" key={rt.id}>
        <Body2 className="mb-6 whitespace-pre-wrap text-zinc-500">
          {rt.explanation}
        </Body2>

        {existingRx ? (
          <ServiceActionCard
            key={existingRx.id}
            service={{
              ...existingRx,
              additionalClassification: [],
              phlebotomy: false,
              supportsLabOrder: false,
              bloodTubeCount: 0,
              price: 0,
            }}
            imgOverwrite={getPrescriptionImage(existingRx.name)}
            displayPrice={false}
            toggle={() => {
              navigate(`/prescriptions/${existingRx.id}`);
            }}
            trigger={<Button size="small">Learn more</Button>}
          />
        ) : (
          <Body2 className="whitespace-pre-wrap rounded-2xl border border-dashed p-4 text-zinc-500">
            Recommended service not available in your state
          </Body2>
        )}
      </div>
    );
  });
};
