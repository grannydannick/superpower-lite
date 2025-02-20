import { AlertTriangle } from 'lucide-react';

import { Body2, H2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';

export const AtHomeNoticeSection = () => {
  const { data: user } = useUser();

  const state = user?.primaryAddress?.address.state;

  if (state !== 'NY' && state !== 'NJ') {
    return null;
  }

  return (
    <section id="subscriptions" className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <H2 className="text-[#1E1E1E]">NY/NJ Notice</H2>
          <AlertTriangle className="text-vermillion-900" />
        </div>
        <div className="space-y-3 rounded-xl border border-vermillion-500 bg-vermillion-50 p-4 sm:px-6 sm:py-5">
          <Body2 className="text-zinc-500">
            We currently support at-home appointments only in New York (NY) and
            New Jersey (NJ).
          </Body2>
          <Body2 className="italic text-zinc-500">
            Please note that an additional fee of $79 will apply for this
            service. This fee will be added during the lab booking process.
          </Body2>
        </div>
      </div>
    </section>
  );
};
