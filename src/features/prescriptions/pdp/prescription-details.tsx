import { PrescriptionsCategory } from '@/features/prescriptions/components/prescriptions-category';
import type { Rx } from '@/types/api';

import { Faq } from './prescriptions-faq';
import { Header } from './prescriptions-header';
import { HowTo } from './prescriptions-how-to';
import { Science } from './prescriptoions-science';

type PrescriptionDetailsProps = {
  prescription: Rx;
  otherPopularPrescriptions?: Rx[];
};

export const PrescriptionDetails = ({
  prescription,
  otherPopularPrescriptions = [],
}: PrescriptionDetailsProps) => {
  return (
    <div className="space-y-12 lg:space-y-32">
      <Header prescription={prescription} />
      <Science prescription={prescription} />
      <HowTo prescription={prescription} />
      <Faq prescription={prescription} />
      {otherPopularPrescriptions.length > 0 && (
        <PrescriptionsCategory
          title="Other popular products"
          prescriptions={otherPopularPrescriptions}
          path="/marketplace?tab=prescriptions"
        />
      )}
    </div>
  );
};
