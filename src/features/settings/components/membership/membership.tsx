import { Card } from '@/components/ui/card';
import { CurrentMembership } from '@/features/settings/components/membership/current-membership';
import { MembershipBenefits } from '@/features/settings/components/membership/membership-benefits';
import { MembershipCard } from '@/features/settings/components/membership/membership-card';
import { MEMBERSHIP_BENEFITS } from '@/features/settings/const/membership-benefits';

export const Membership = () => {
  return (
    <>
      <div className="mt-8 gap-y-5 md:mt-0 lg:flex lg:flex-col-reverse">
        <div className="rounded-t-2xl bg-white py-[6%] bg-dot-zinc-400/[0.4] lg:flex lg:justify-center">
          <MembershipCard />
        </div>
        <CurrentMembership />
      </div>

      <Card className="mt-10 md:mx-0 lg:mt-0 lg:rounded-t-none">
        <section
          id="membership-benefits"
          className="space-y-8 px-6 py-8 md:px-14 md:py-12"
        >
          <h3 className="text-lg">
            Your Superpower
            <br className="md:hidden" /> Membership benefits
          </h3>
          <MembershipBenefits benefits={MEMBERSHIP_BENEFITS} />
        </section>
      </Card>
    </>
  );
};
