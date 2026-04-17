import { ChevronRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body1 } from '@/components/ui/typography';

/**
 * Banner component that displays when the user has a family risk plan available.
 * Links to the family risk plan page.
 */
export const FamilyRiskBanner = () => {
  return (
    <Link
      to="/family-risk/plan"
      className="group flex cursor-pointer items-center gap-4 rounded-[20px] bg-cover bg-no-repeat pr-6 shadow-[0_0_4px_rgba(24,24,27,0.1)]"
      style={{
        backgroundImage: `
      url('/home/health-insights-banner.png'),
      linear-gradient(135deg, #252F22 0%, #252F22 20%, #43523A 60%, #4C4F2F 100%)
    `,
      }}
    >
      <div className="size-20 lg:w-28 xl:w-36" />
      <div className="flex-1 md:py-6">
        <Body1 className="text-base text-white">
          What your results may mean
          <br /> for your family
        </Body1>
      </div>
      <ChevronRight className="size-5 text-white transition-all group-hover:-mr-1" />
    </Link>
  );
};
