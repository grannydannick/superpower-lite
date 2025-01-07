import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { FancySwitch } from '@/components/ui/fancy-switch';
import { Separator } from '@/components/ui/separator';
import { H4 } from '@/components/ui/typography';
import { BiomarkerDataView } from '@/features/action-plan/components/biomarkers/biomarker-data-view';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { TypeformAnswers } from '@/features/rdns/components/typeforms';

const TOOLS_OPTIONS = ['typeforms', 'biomarkers'];

export const ClinicianTools = () => {
  const { isAdmin } = usePlan(useShallow((s) => s));
  const [selectedOption, setSelectedOption] = useState('typeforms');

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="sticky top-28 hidden max-h-fit max-w-screen-md space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12 xl:block">
      <div className="flex items-center justify-between">
        <H4>
          {selectedOption === 'biomarkers'
            ? 'Blood biomarker data'
            : 'Typeforms data'}
        </H4>
        <FancySwitch
          value={selectedOption}
          options={TOOLS_OPTIONS}
          onChange={setSelectedOption}
          highlighterIncludeMargin={true}
        />
      </div>
      <Separator />
      {selectedOption === 'biomarkers' ? (
        <BiomarkerDataView />
      ) : (
        <TypeformAnswers />
      )}
    </div>
  );
};
