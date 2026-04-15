import { useState } from 'react';

import { PrescriptionsCategory } from '@/features/prescriptions/components/prescriptions-category';
import type { Rx } from '@/types/api';

import { Faq } from './prescriptions-faq';
import { Header } from './prescriptions-header';
import { HowTo } from './prescriptions-how-to';
import { Science } from './prescriptoions-science';
import { getDefaultBillingCode, buildGetStartedUrl } from './utils';

const EMPTY_PRESCRIPTIONS: Rx[] = [];

type PrescriptionDetailsProps = {
  prescription: Rx;
  otherPopularPrescriptions?: Rx[];
};

export const PrescriptionDetails = ({
  prescription,
  otherPopularPrescriptions = EMPTY_PRESCRIPTIONS,
}: PrescriptionDetailsProps) => {
  const [selectedBillingCode, setSelectedBillingCode] = useState(() =>
    getDefaultBillingCode(prescription),
  );
  const getStartedUrl = buildGetStartedUrl(
    prescription.url,
    selectedBillingCode,
  );

  return (
    <div className="space-y-12 lg:space-y-32">
      <Header
        prescription={prescription}
        selectedBillingCode={selectedBillingCode}
        onBillingCodeChange={setSelectedBillingCode}
        getStartedUrl={getStartedUrl}
      />
      <Science prescription={prescription} getStartedUrl={getStartedUrl} />
      <HowTo prescription={prescription} />
      <Faq prescription={prescription} />
      {otherPopularPrescriptions.length > 0 && (
        <PrescriptionsCategory
          title="Other popular products"
          prescriptions={otherPopularPrescriptions}
          viewAllTab="prescriptions"
        />
      )}
    </div>
  );
};
