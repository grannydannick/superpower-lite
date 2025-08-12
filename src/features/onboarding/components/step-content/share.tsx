import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { trackEvent } from '@/utils/analytics';

export const Share = () => {
  const { data, isLoading } = useAffiliateLinks();
  const { mutateAsync: updateTaskProgress, isPending } = useUpdateTask();
  const { track } = useAnalytics();

  const { links } = data || { links: [] };

  return (
    <section className="mx-auto flex max-w-[500px] flex-col gap-y-12 py-12">
      <div className="flex flex-col space-y-12">
        <div className="space-y-6">
          <H1 className="text-white">
            Share the gift of <br />
            better health
          </H1>
          <div className="space-y-3">
            <Body1 className="text-white">
              Invite friends and family to join Superpower to get access to
              advanced testing, a personalized health plan, and insights that
              put their health on autopilot.
            </Body1>
            <Body1 className="text-white">
              Share your link. Superpower together.{' '}
            </Body1>
          </div>
          <div className="space-y-2">
            <Body2 className="text-white">Your Referral Link</Body2>
            <div className="flex gap-2">
              <Input
                variant="glass"
                disabled
                className="disabled:opacity-100"
                value={
                  links.length ? links[0] : "Can't get your link at the moment."
                }
              />
              {links.length > 0 ? (
                <CopyToClipboard
                  link={links[0]}
                  className="flex min-w-14 items-center justify-center bg-white"
                />
              ) : null}
            </div>
          </div>
        </div>
        <Button
          onClick={async () => {
            // Track onboarding completion event with UTM context
            trackEvent('Onboarding Completed', {
              referralLinksAvailable: links.length > 0,
            });

            await updateTaskProgress({
              taskName: 'onboarding',
              data: { status: 'completed' },
            });

            track('completed_onboarding');
          }}
          disabled={isLoading || isPending}
          type="submit"
          className="w-full"
          variant="white"
        >
          {isPending || isLoading ? <Spinner variant="primary" /> : 'Continue'}
        </Button>
      </div>
    </section>
  );
};

export const ShareStep = () => (
  <OnboardingLayout className="bg-female-hands" title="Share">
    <Share />
  </OnboardingLayout>
);
