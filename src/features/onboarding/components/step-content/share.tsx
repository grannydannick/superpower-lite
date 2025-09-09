import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { useInviteLink } from '@/features/affiliate/hooks/use-invite-link';
import { useUpdateTask } from '@/features/tasks/api/update-task';

export const Share = () => {
  const { mutateAsync: updateTaskProgress, isPending } = useUpdateTask();

  const { link } = useInviteLink();

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
                value={link}
              />
              <CopyToClipboard
                link={link}
                className="flex min-w-14 items-center justify-center bg-white"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={async () => {
            await updateTaskProgress({
              taskName: 'onboarding',
              data: { status: 'completed' },
            });
          }}
          disabled={isPending}
          type="submit"
          className="w-full"
          variant="white"
        >
          {isPending ? <Spinner variant="primary" /> : 'Continue'}
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
