import { ArrowRight } from 'lucide-react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { Biomarker } from '@/types/api';
import { handleShare } from '@/utils/share';

export const BiomarkerFamilyRiskSuggestions = ({
  biomarker,
}: {
  biomarker: Biomarker;
}) => {
  if (!biomarker.familyRisk) return;

  return (
    <div className="flex gap-3 rounded-2xl border p-4 shadow-sm">
      <AIIcon className="size-6 min-w-6" />
      <div className="space-y-2">
        <div className="space-y-1">
          <Body2 className="text-vermillion-900">
            Key insight - Familial Risk
          </Body2>
          <Body2>{biomarker.familyRisk.insight}</Body2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center gap-1 text-zinc-500"
          onClick={() =>
            biomarker.familyRisk
              ? handleShare(biomarker.familyRisk.sms)
              : undefined
          }
        >
          Share this with your family
          <ArrowRight size={12} />
        </Button>
      </div>
    </div>
  );
};
