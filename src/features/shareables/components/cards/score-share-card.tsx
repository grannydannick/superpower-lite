import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Hover3D } from '@/components/ui/hover-3d';
import { Body1, Body2 } from '@/components/ui/typography';
import { SCORE_MESSAGES } from '@/const/score-messages';
import { useLatestHealthScore } from '@/features/data/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { cardVariants } from '../../utils/card-variants';

export const ScoreShareCard = () => {
  const { data: user } = useUser();
  // const { data: avatar } = useAvatar({
  //   username: user?.username ?? '',
  // });
  const latestHealthScoreQuery = useLatestHealthScore();

  if (!user || !latestHealthScoreQuery.data?.healthScore) {
    return <div>No health score found</div>;
  }

  const { firstName, lastName } = user;

  const latestHealthScore =
    latestHealthScoreQuery.data.healthScore.quantity.value;

  return (
    <div className="flex min-h-96 justify-center">
      <Hover3D
        options={{
          shadow: {
            opacity: 0.1,
            color: 'rgba(0, 0, 0)',
          },
          resetOnHover: true,
          resetDuration: 500,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'relative flex w-64 flex-col overflow-hidden animate-in zoom-in-95',
              cardVariants({ type: 'scoreCard' }),
            )}
          >
            {/* {!avatar && ( */}
            <img
              src={'/cards/woman.webp'}
              alt="avatar"
              className="absolute inset-0 mix-blend-soft-light"
            />
            {/* )} */}
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex size-full items-start justify-between gap-4 p-1">
                <SuperpowerScoreLogo className="w-40" logoColor="white" />
                <span className="mr-2 mt-1 text-3xl text-white">
                  {latestHealthScore}
                </span>
              </div>
              {/* {avatar && (
                <div className="absolute left-1/2 top-1/2 -mt-4 size-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [mask-image:radial-gradient(circle,black_10%,transparent_70%)]">
                  <div className="absolute inset-0 bg-vermillion-900 mix-blend-soft-light" />
                  <Avatar src={avatar?.removedBg} className="size-full" />
                </div>
              )} */}
              <div className="p-1">
                <Body1 className="text-xl text-white">
                  {firstName} {lastName}
                </Body1>
                <Body2 className="text-white/60">
                  {
                    SCORE_MESSAGES.find(
                      (message) =>
                        latestHealthScore >= message.range[0] &&
                        latestHealthScore <= message.range[1],
                    )?.message
                  }
                </Body2>
              </div>
            </div>
          </div>
        </div>
      </Hover3D>
    </div>
  );
};
