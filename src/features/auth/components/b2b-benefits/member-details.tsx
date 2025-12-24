import { ChevronLeft } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { useCheckoutContext } from '@/features/auth/stores';
import { useBenefits } from '@/features/b2b/api';
import { RegisterInput } from '@/lib/auth';

import { YourDetailsSection } from '../configurator/sections';

import { BenefitSummary } from './benefit-summary';

type MemberDetailsProps = {
  onPrev: () => void;
  onSubmit: (data: RegisterInput) => Promise<void>;
};

const MemberDetails = ({ onPrev, onSubmit }: MemberDetailsProps) => {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('id') ?? '';
  const { data: benefits } = useBenefits(organizationId);

  const processing = useCheckoutContext((s) => s.processing);

  const form = useFormContext<RegisterInput>();

  return (
    <SplitScreenLayout title="Benefit Details" className="bg-zinc-50">
      <>
        <div className="relative mx-auto flex size-full flex-col items-center gap-6 px-4 md:px-8 lg:max-w-2xl">
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between">
              <SuperpowerLogo />
              <div className="flex items-center gap-4">
                <Body2 className="text-zinc-400">
                  Step {2} / {2}
                </Body2>
                <Progress value={100} className="h-[3px] w-20" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="mr-auto"
              disabled={processing}
            >
              <ChevronLeft size={14} className="text-zinc-500" />
              <Body2 className="text-zinc-500">Verify eligibility</Body2>
            </Button>
          </div>
          <div className="w-full space-y-3">
            <H3 className="text-primary">
              Covered Benefit for {benefits?.name ?? ''}
            </H3>
            <Body1 className="text-zinc-500">
              Your benefit is covered by your organization at no cost.
            </Body1>
            <div className="block md:hidden">
              <BenefitSummary />
            </div>
          </div>
          <div className="flex w-full flex-col justify-center space-y-6">
            <YourDetailsSection
              emailDisabled={false}
              showAtHomeNoticeAlert={false}
              showGenderField={true}
            />
          </div>
          <Button
            className="w-full rounded-xl border border-zinc-500 bg-black px-6 py-4"
            disabled={processing}
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >
            {processing ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              'Claim Benefit'
            )}
          </Button>
          {processing && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black/50 p-6 backdrop-blur-sm sm:flex-row">
              <Spinner variant="light" size="sm" />
              <Body1 className="text-center text-white">
                Processing your benefit claim. Do not refresh this tab.
              </Body1>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <BenefitSummary />
        </div>
      </>
    </SplitScreenLayout>
  );
};

export { MemberDetails };
