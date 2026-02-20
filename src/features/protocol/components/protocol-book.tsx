import { SuperpowerSignature } from '@/components/shared/superpower-signature';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3 } from '@/components/ui/typography';
import { Body4 } from '@/components/ui/typography/body4/body4';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const ProtocolBook = ({
  title,
  date,
  coverImage = '/action-plan/aiap-book-cover.webp',
  className,
}: {
  title: string;
  date?: string;
  coverImage?: string;
  className?: string;
}) => {
  const { data, isLoading } = useUser();

  return (
    <div
      className={cn(
        'mx-auto aspect-[1/1.414] w-32 [perspective-origin:left_center] [perspective:1000px]',
        className,
      )}
    >
      <div className="absolute right-[-9px] top-4">
        <SuperpowerBookmark />
      </div>
      <div className="relative size-full overflow-hidden">
        {/* front cover */}
        <div
          className={cn(
            'absolute left-0 top-0 z-40 size-full overflow-hidden rounded-[10px]',
            'origin-left transform-gpu [backface-visibility:hidden]',
            'transition-all duration-500 ease-out will-change-transform',
            'transition-delay-[360ms] [transform:translateZ(3px)_rotateY(0deg)]',
            'group-hover:transition-delay-[0ms] group-hover:[transform:translateZ(3px)_rotateY(-80deg)]',
            'group-hover:shadow-xl',
          )}
        >
          <div className="absolute left-0 h-full w-2 bg-black/20" />
          <div className="absolute z-10 flex size-full flex-col py-2 pl-2.5 pr-12 lg:py-3 lg:pl-5">
            <Body1 className="flex-1 leading-tight text-white">{title}</Body1>
            {date && <Body4 className="text-white">{date}</Body4>}
          </div>
          <img
            className="block size-full object-contain"
            src={coverImage}
            alt="Book cover"
          />
        </div>
        {/* inner page (slightly smaller than cover) */}
        <div
          className={cn(
            'absolute left-0 top-1 z-30 flex h-[calc(100%-8px)] w-[calc(100%-8px)] flex-col overflow-hidden rounded-lg bg-gradient-to-r from-zinc-300 via-white via-50% to-white pb-2 pl-3 pr-1 pt-2 md:break-words md:pl-8 md:pr-6 md:pt-6',
            'origin-left transform-gpu [backface-visibility:hidden]',
            'transition-all duration-500 ease-out will-change-transform',
            'transition-delay-[240ms] [transform:translateZ(2px)_rotateY(0deg)]',
            'group-hover:transition-delay-[120ms] group-hover:[transform:translateZ(2px)_rotateY(-30deg)]',
            'group-hover:shadow-md',
          )}
        >
          <div className="flex-1 space-y-2">
            {isLoading ? (
              <Skeleton />
            ) : (
              <Body3 className="break-all !text-[8px] leading-tight md:!text-xs">
                {data?.firstName}&apos;s Action Plan
              </Body3>
            )}
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-1/2 rounded-full bg-zinc-200" />
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-1/2 rounded-full bg-zinc-200" />
          </div>
          <SuperpowerSignature className="w-16" />
        </div>
        {/* back cover */}
        <div
          className={cn(
            'absolute left-0 top-0 z-20 size-full overflow-hidden rounded-[10px] bg-vermillion-900',
            'origin-left transform-gpu [backface-visibility:hidden]',
            'transition-all duration-500 ease-out will-change-transform',
            'transition-delay-[0ms] [transform:translateZ(0)_rotateY(0deg)]',
            'group-hover:transition-delay-[360ms] group-hover:[transform:translateZ(0)_rotateY(-1deg)]',
          )}
        >
          <img
            className="block size-full object-contain blur-xl"
            src={coverImage}
            alt="Book cover"
          />
        </div>
      </div>
    </div>
  );
};

const SuperpowerBookmark = () => {
  return (
    <svg
      width="9"
      height="52"
      viewBox="0 0 9 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.09668 3.24219C6.97305 3.24229 8.49414 4.76423 8.49414 6.64062V45.1465C8.49414 47.0229 6.97305 48.5448 5.09668 48.5449H4.21777C1.88604 48.5555 0.000452 49.8181 0 51.375L0 0.411133C0.000249886 1.9747 1.90166 3.24218 4.24707 3.24219H5.09668Z"
        fill="#953D14"
      />
      <path
        d="M3.20914 42.2974C1.9602 42.2974 1.70091 39.8384 3.19617 39.6842C3.29557 39.68 3.3431 39.7217 3.3431 39.7925V40.4052C3.3431 40.4761 3.30853 40.5094 3.23074 40.5261C2.64301 40.6219 2.77698 41.468 3.20914 41.468C3.8833 41.468 3.38632 39.6217 4.65686 39.6217C6.06569 39.6217 6.10026 42.3141 4.60068 42.4558C4.50993 42.4599 4.47103 42.4183 4.47103 42.3432V41.7306C4.47103 41.6639 4.50993 41.6264 4.59204 41.6097C5.17977 41.5055 5.15384 40.4802 4.65686 40.4802C4.02591 40.4802 4.47103 42.2974 3.20914 42.2974ZM2.3794 37.1793C2.29729 37.1793 2.24975 37.146 2.24975 37.0543V36.4708C2.24975 36.3833 2.29729 36.3416 2.3794 36.3416H4.06913C4.90751 36.3416 5.68107 36.8459 5.68107 37.8462C5.68107 38.8464 4.90751 39.3549 4.06913 39.3549L2.3794 39.3591C2.29729 39.3591 2.24975 39.3132 2.24975 39.2299V38.638C2.24975 38.5422 2.29729 38.5088 2.3794 38.5088L4.06913 38.5047C4.7044 38.5047 4.90319 38.1921 4.90319 37.8462C4.90319 37.5002 4.7044 37.1835 4.06913 37.1835L2.3794 37.1793ZM3.57215 29.9106V31.4944C3.23074 31.4944 2.83316 31.1735 2.83316 30.6608C2.83316 30.1482 3.23074 29.9106 3.57215 29.9106ZM4.07777 29.0771H3.95677C2.98441 29.0771 2.14603 29.6147 2.14603 30.6817C2.14603 31.4736 2.69055 32.0404 3.40361 32.2488C3.71476 32.3405 4.05184 32.353 4.37596 32.2863C5.17113 32.1196 5.77615 31.5236 5.77615 30.6817C5.77615 30.5483 5.77615 29.448 4.66118 29.1104C4.58772 29.0896 4.56179 29.1187 4.56179 29.1771V29.8439C4.56179 29.8856 4.58339 29.9148 4.62661 29.9356C4.77354 30.0023 5.06309 30.1774 5.06309 30.6817C5.06309 31.1276 4.64822 31.4944 4.21606 31.4944V29.2063C4.21606 29.1229 4.1642 29.0771 4.07777 29.0771ZM3.58079 11.7848V13.2519C3.24803 13.2519 2.85909 12.9809 2.85909 12.4766C2.85909 11.9723 3.24803 11.7848 3.58079 11.7848ZM4.07777 10.8887H3.95677C2.98441 10.8887 2.14603 11.4305 2.14603 12.4975C2.14603 13.2894 2.68623 13.8562 3.40361 14.0646C3.71476 14.1604 4.05184 14.1729 4.37596 14.1021C5.17113 13.9395 5.77615 13.3394 5.77615 12.4975C5.77615 12.3641 5.77615 11.2638 4.6655 10.922C4.58772 10.9012 4.56179 10.9304 4.56179 10.9929V11.6556C4.56179 11.7014 4.58339 11.7306 4.62661 11.7514C4.77354 11.8181 5.06741 11.9932 5.06741 12.4975C5.06741 12.9434 4.65254 13.2685 4.21606 13.2685V11.0221C4.21606 10.9345 4.1642 10.8887 4.07777 10.8887ZM2.24975 8.65474C2.24975 8.53804 2.31889 8.4797 2.44422 8.4797H2.94984C3.07949 8.4797 3.13567 8.54638 3.13567 8.67142C3.13567 9.40078 3.49004 9.75088 4.40189 9.75088H5.5471C5.62921 9.75088 5.67243 9.8009 5.67243 9.87175V10.4928C5.67243 10.5636 5.62921 10.6053 5.5471 10.6053H4.40189C3.61536 10.6053 2.24975 10.3927 2.24975 8.65474ZM2.24975 16.3569V17.0279C2.24975 17.0737 2.26703 17.0904 2.31889 17.1071L4.39324 17.7823L2.31889 18.3074C2.26703 18.3199 2.24975 18.3408 2.24975 18.3866V19.1743C2.24975 19.241 2.29296 19.2327 2.3405 19.2202L5.58168 18.4116C5.65514 18.3949 5.67243 18.3658 5.67243 18.2866V17.4488C5.67243 17.3863 5.6465 17.3488 5.57735 17.328L3.55486 16.6903L5.57735 16.0568C5.6465 16.036 5.67243 15.9943 5.67243 15.9359V15.094C5.67243 15.0148 5.65514 14.9857 5.58168 14.969L2.3405 14.1604C2.29296 14.1479 2.24975 14.1396 2.24975 14.2105V14.994C2.24975 15.044 2.26703 15.0649 2.31889 15.0774L4.39324 15.6025L2.31889 16.2735C2.26703 16.2902 2.24975 16.311 2.24975 16.3569ZM3.95677 21.7959C3.34743 21.7959 2.95416 21.4791 2.95416 20.9748C2.95416 20.4705 3.34743 20.1079 3.95677 20.1079C4.56611 20.1079 4.96801 20.483 4.96801 20.9748C4.96801 21.4666 4.57043 21.7959 3.95677 21.7959ZM2.14603 20.9748C2.14603 21.9584 2.98441 22.667 3.95677 22.667C4.92912 22.667 5.77615 21.9584 5.77615 20.9748C5.77615 19.9912 4.95505 19.2368 3.95677 19.2368C2.95849 19.2368 2.14603 20.0287 2.14603 20.9748ZM2.24975 26.8181C2.24975 26.7014 2.31889 26.6431 2.44422 26.6431H2.94984C3.07949 26.6431 3.13567 26.7097 3.13567 26.8348C3.13567 27.5641 3.49004 27.9142 4.40189 27.9142H5.5471C5.62921 27.9142 5.67243 27.9643 5.67243 28.0351V28.6561C5.67243 28.727 5.62921 28.7686 5.5471 28.7686H4.40189C3.61536 28.7686 2.24975 28.5561 2.24975 26.8181ZM3.88762 25.5011C4.48832 25.5011 4.88158 25.1885 4.88158 24.6925C4.88158 24.1965 4.49264 23.8464 3.88762 23.8464C3.2826 23.8464 2.9023 24.2091 2.9023 24.6925C2.9023 25.176 3.29125 25.5011 3.88762 25.5011ZM5.32238 25.4552H6.72689C6.809 25.4552 6.85221 25.5011 6.85221 25.5719V26.1971C6.85221 26.268 6.809 26.3096 6.72689 26.3096H2.4399C2.31457 26.3096 2.24975 26.2429 2.24975 26.1221V25.6053C2.24975 25.4802 2.31457 25.4552 2.4399 25.4552H2.75105V25.4094C1.50644 24.7717 2.1806 22.9545 3.88762 22.9545C5.71997 22.9545 6.0484 24.8009 5.32238 25.4552ZM3.88762 35.1704C4.48832 35.1704 4.88158 34.8537 4.88158 34.3619C4.88158 33.8701 4.49264 33.5158 3.88762 33.5158C3.2826 33.5158 2.9023 33.8742 2.9023 34.3619C2.9023 34.8495 3.29125 35.1704 3.88762 35.1704ZM5.32238 35.1329H6.72689C6.809 35.1329 6.85221 35.1829 6.85221 35.2538V35.8748C6.85221 35.9498 6.809 35.9873 6.72689 35.9873H2.4399C2.31457 35.9873 2.24975 35.9248 2.24975 35.8039V35.2829C2.24975 35.1579 2.31457 35.1329 2.4399 35.1329H2.75105V35.0912C1.50644 34.4536 2.1806 32.6364 3.88762 32.6364C5.71997 32.6364 6.0484 34.4827 5.32238 35.1329Z"
        fill="url(#paint0_radial_4568_7176)"
      />
      <defs>
        <radialGradient
          id="paint0_radial_4568_7176"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0.287378 25.4679) scale(7.7918 60.1016)"
        >
          <stop stopColor="white" stopOpacity="0.6" />
          <stop offset="1" stopColor="white" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
  );
};
