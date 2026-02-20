import QuickLink from '@/components/shared/quicklink';
import { Body2, H4 } from '@/components/ui/typography';
import { useSummary } from '@/features/summary/api/get-summary';
import { useUser } from '@/lib/auth';

export const WaitingScreen = () => {
  const { data: user } = useUser();
  const summaryQuery = useSummary();

  const gating = summaryQuery.data;
  const ETA = gating?.hasPartialResults ? '4-7' : '7-10';

  return (
    <div className="mx-auto max-w-3xl flex-1 overflow-y-auto rounded-[24px] bg-white p-6 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300">
      <div className="size-full">
        <H4 className="mb-2">Hi {user?.firstName},</H4>
        <Body2 className="mb-4 text-zinc-400">
          We are currently awaiting and analyzing your first test results. They
          should be with you in {ETA} days and appear here in the data page.
          You&apos;ll receive an e-mail once your results are ready and your
          digital twin is set up.
          <br />
          <br />
          Until then, feel free to upload your existing health records or
          connect your wearables.
        </Body2>
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          <QuickLink
            to="/data/records"
            title="Upload existing health records"
            className="flex-1 overflow-hidden pb-0 md:w-1/2"
          >
            <div className="relative flex h-32 flex-1 items-center justify-center overflow-hidden duration-1000 animate-in fade-in">
              <div className="pointer-events-none absolute bottom-0 z-20 h-24 w-full bg-gradient-to-b from-transparent to-white transition-colors group-hover:to-zinc-50" />
              <img
                src="/data/pdf-stack-1.webp"
                alt="Upload existing health records PDF"
                className="transition-timing-function-[cubic-bezier(0.68,-0.6,0.32,1.6)] absolute -bottom-20 z-10 aspect-[0.707] w-[150px] -translate-x-4 translate-y-8 -rotate-2 rounded-[4px] border border-zinc-200 object-cover shadow-lg transition-all duration-700 animate-in fade-in slide-in-from-bottom-10 group-hover:-translate-x-1 group-hover:rotate-0 group-hover:duration-300"
              />
              <img
                src="/data/pdf-stack-1.webp"
                alt="Upload existing health records PDF"
                className="transition-timing-function-[cubic-bezier(0.68,-0.6,0.32,1.6)] absolute -bottom-20 aspect-[0.707] w-[150px] translate-x-4 translate-y-8 rotate-6 rounded-[4px] border border-zinc-200 object-cover shadow-lg transition-all duration-1000 animate-in fade-in slide-in-from-bottom-10 group-hover:translate-x-1 group-hover:rotate-2 group-hover:duration-300"
              />
            </div>
          </QuickLink>
          <QuickLink
            to="/settings?tab=integrations"
            title="Connect your health trackers"
            className="flex-1 overflow-hidden pb-0 md:w-1/2"
          >
            <div className="pointer-events-none absolute bottom-0 z-20 h-24 w-full bg-gradient-to-b from-transparent to-white transition-colors group-hover:to-zinc-50" />
            {/*<video
              src="/data/videos/wearables.webm"
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="transition-timing-function-[cubic-bezier(0.68,-0.6,0.32,1.6)] pointer-events-none -mt-8 h-40 w-full flex-1 origin-bottom object-cover object-top transition-all duration-300 will-change-transform group-hover:scale-[.97]"
            />*/}
            <img
              src="/data/wearables.webp"
              alt="Wearables"
              className="transition-timing-function-[cubic-bezier(0.68,-0.6,0.32,1.6)] pointer-events-none h-32 w-full flex-1 origin-bottom translate-x-16 translate-y-4 object-contain object-bottom transition-all duration-300 group-hover:scale-[.97]"
            />
          </QuickLink>
        </div>
      </div>
    </div>
  );
};
