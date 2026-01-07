import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useBiomarkers } from '@/features/data/api';
import { MEMBERSHIP_BENEFITS } from '@/features/settings/const/membership-benefits';
import { useMembership } from '@/features/settings/stores/membership-store';
import { useUser } from '@/lib/auth';
import { Biomarker } from '@/types/api';

import { CancelMembershipStepper } from '../cancel-membership-stepper';
import { MembershipBenefits } from '../membership-benefits';

export const BenefitsStep = (): JSX.Element => {
  const { data: biomarkersData, isLoading } = useBiomarkers();
  const { data: user } = useUser();
  const { daysRemaining } = useMembership((s) => s);
  const methods = CancelMembershipStepper.useStepper();

  const optimalBiomarkers =
    biomarkersData?.biomarkers.filter(
      (biomarker: Biomarker) => biomarker.status === 'OPTIMAL',
    ) ?? [];

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-10">
        <div className="mt-4 space-y-4">
          <h1 className="text-3xl">
            {user?.firstName},{' '}
            <span className="text-vermillion-700">
              {optimalBiomarkers.length}
            </span>{' '}
            of your biomarkers have reached an{' '}
            <span className="text-vermillion-700">optimal state</span> since
            becoming a Superpower Member.{' '}
          </h1>
          <p className="text-zinc-600">
            You have{' '}
            <span className="text-vermillion-700">{daysRemaining} days</span> to
            enjoy your membership benefits until the next billing cycle.{' '}
          </p>
        </div>
        <section id="membership-benefits" className="space-y-4">
          <p className="text-zinc-600">
            If you would like to end this membership, you will lose access to:
          </p>
          <MembershipBenefits benefits={MEMBERSHIP_BENEFITS} />
        </section>
      </div>
      <div className="flex w-full justify-end pt-12">
        <Button onClick={methods.next}>Cancel membership</Button>
      </div>
    </div>
  );
};
