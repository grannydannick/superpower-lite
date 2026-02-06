import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

interface SetupItemData {
  id: string;
  title: string;
  description?: string;
  image: string;
}

const SETUP_ITEMS: SetupItemData[] = [
  {
    id: 'tell-us',
    title: 'Tell us about yourself',
    description: 'Set aside 10 min for best results',
    image: '/onboarding/finish-twin/tell-us-about-you-paper.webp',
  },
  {
    id: 'additional-tests',
    title: 'Explore additional tests',
    image: '/onboarding/finish-twin/additional-tests.webp',
  },
  {
    id: 'schedule-tests',
    title: 'Schedule your tests',
    image: '/onboarding/finish-twin/schedule-tests.webp',
  },
  {
    id: 'sync-wearables',
    title: 'Sync wearables',
    image: '/onboarding/finish-twin/connect-wearables.webp',
  },
  {
    id: 'upload-labs',
    title: 'Upload past labs',
    image: '/onboarding/finish-twin/upload-past-labs.webp',
  },
];

const ActiveIndicator = () => (
  <div className="relative size-[44px] shrink-0">
    {/* Static background with shadow */}
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0"
    >
      <g filter="url(#filter0_dd_active)">
        <rect
          x="8"
          y="4"
          width="28"
          height="28"
          rx="14"
          fill="white"
          shapeRendering="crispEdges"
        />
        <rect
          x="8.5"
          y="4.5"
          width="27"
          height="27"
          rx="13.5"
          stroke="#E4E4E7"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_active"
          x="0"
          y="0"
          width="44"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.025 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
    {/* Rotating dots layer */}
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-3 top-2 animate-spin"
      style={{ animationDuration: '4s' }}
    >
      <path
        d="M10.6243 2.2915C10.6243 2.63668 10.3445 2.9165 9.99935 2.9165C9.65417 2.9165 9.37435 2.63668 9.37435 2.2915C9.37435 1.94633 9.65417 1.6665 9.99935 1.6665C10.3445 1.6665 10.6243 1.94633 10.6243 2.2915Z"
        fill="#FC5F2B"
      />
      <path
        d="M2.91602 9.7915C2.91602 10.1367 2.63619 10.4165 2.29102 10.4165C1.94584 10.4165 1.66602 10.1367 1.66602 9.7915C1.66602 9.44633 1.94584 9.1665 2.29102 9.1665C2.63619 9.1665 2.91602 9.44633 2.91602 9.7915Z"
        fill="#FC5F2B"
      />
      <path
        d="M18.3327 9.7915C18.3327 10.1367 18.0529 10.4165 17.7077 10.4165C17.3625 10.4165 17.0827 10.1367 17.0827 9.7915C17.0827 9.44633 17.3625 9.1665 17.7077 9.1665C18.0529 9.1665 18.3327 9.44633 18.3327 9.7915Z"
        fill="#FC5F2B"
      />
      <path
        d="M10.6243 17.7082C10.6243 18.0533 10.3445 18.3332 9.99935 18.3332C9.65417 18.3332 9.37435 18.0533 9.37435 17.7082C9.37435 17.363 9.65417 17.0832 9.99935 17.0832C10.3445 17.0832 10.6243 17.363 10.6243 17.7082Z"
        fill="#FC5F2B"
      />
      <path
        d="M7.62692 2.63909C7.75902 2.95799 7.60758 3.3236 7.28867 3.45569C6.96977 3.58778 6.60417 3.43635 6.47207 3.11744C6.33998 2.79854 6.49142 2.43293 6.81032 2.30084C7.12922 2.16875 7.49483 2.32019 7.62692 2.63909Z"
        fill="#FC5F2B"
      />
      <path
        d="M3.37548 12.518C3.50757 12.8369 3.35613 13.2025 3.03723 13.3346C2.71833 13.4667 2.35272 13.3153 2.22063 12.9964C2.08853 12.6775 2.23997 12.3119 2.55887 12.1798C2.87778 12.0477 3.24338 12.1991 3.37548 12.518Z"
        fill="#FC5F2B"
      />
      <path
        d="M17.6186 6.61833C17.7507 6.93724 17.5993 7.30284 17.2804 7.43494C16.9615 7.56703 16.5959 7.41559 16.4638 7.09669C16.3317 6.77778 16.4831 6.41218 16.802 6.28009C17.1209 6.14799 17.4865 6.29943 17.6186 6.61833Z"
        fill="#FC5F2B"
      />
      <path
        d="M13.5266 16.8822C13.6587 17.2011 13.5073 17.5667 13.1884 17.6988C12.8695 17.8309 12.5039 17.6795 12.3718 17.3606C12.2397 17.0417 12.3911 16.6761 12.71 16.544C13.0289 16.4119 13.3945 16.5633 13.5266 16.8822Z"
        fill="#FC5F2B"
      />
      <path
        d="M4.99084 4.10716C5.23492 4.35123 5.23492 4.74696 4.99084 4.99104C4.74676 5.23512 4.35104 5.23512 4.10696 4.99104C3.86288 4.74696 3.86288 4.35123 4.10696 4.10716C4.35104 3.86308 4.74676 3.86308 4.99084 4.10716Z"
        fill="#FC5F2B"
      />
      <path
        d="M4.84353 14.8611C5.08761 15.1051 5.08761 15.5009 4.84353 15.745C4.59945 15.989 4.20372 15.989 3.95965 15.745C3.71557 15.5009 3.71557 15.1051 3.95965 14.8611C4.20372 14.617 4.59945 14.617 4.84353 14.8611Z"
        fill="#FC5F2B"
      />
      <path
        d="M15.7448 3.95984C15.9888 4.20392 15.9888 4.59965 15.7448 4.84373C15.5007 5.0878 15.105 5.0878 14.8609 4.84373C14.6168 4.59965 14.6168 4.20392 14.8609 3.95984C15.105 3.71577 15.5007 3.71577 15.7448 3.95984Z"
        fill="#FC5F2B"
      />
      <path
        d="M15.8921 15.0084C16.1361 15.2525 16.1361 15.6482 15.8921 15.8923C15.648 16.1363 15.2523 16.1363 15.0082 15.8923C14.7641 15.6482 14.7641 15.2525 15.0082 15.0084C15.2523 14.7643 15.648 14.7643 15.8921 15.0084Z"
        fill="#FC5F2B"
      />
      <path
        d="M3.11699 6.47256C3.4359 6.60465 3.58733 6.97026 3.45524 7.28916C3.32315 7.60807 2.95754 7.7595 2.63864 7.62741C2.31974 7.49532 2.1683 7.12971 2.30039 6.81081C2.43248 6.49191 2.79809 6.34047 3.11699 6.47256Z"
        fill="#FC5F2B"
      />
      <path
        d="M7.09624 16.4643C7.41514 16.5964 7.56658 16.962 7.43448 17.2809C7.30239 17.5998 6.93679 17.7512 6.61788 17.6191C6.29898 17.487 6.14754 17.1214 6.27964 16.8025C6.41173 16.4836 6.77733 16.3322 7.09624 16.4643Z"
        fill="#FC5F2B"
      />
      <path
        d="M12.9959 2.22112C13.3148 2.35321 13.4663 2.71881 13.3342 3.03772C13.2021 3.35662 12.8365 3.50806 12.5176 3.37596C12.1987 3.24387 12.0472 2.87827 12.1793 2.55936C12.3114 2.24046 12.677 2.08902 12.9959 2.22112Z"
        fill="#FC5F2B"
      />
      <path
        d="M17.3601 12.3723C17.679 12.5044 17.8305 12.87 17.6984 13.1889C17.5663 13.5078 17.2007 13.6592 16.8818 13.5271C16.5629 13.395 16.4114 13.0294 16.5435 12.7105C16.6756 12.3916 17.0412 12.2402 17.3601 12.3723Z"
        fill="#FC5F2B"
      />
    </svg>
    {/* Center circle */}
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-3 top-2"
    >
      <path
        d="M15.4173 10.0002C15.4173 12.9917 12.9922 15.4168 10.0007 15.4168C7.00911 15.4168 4.58398 12.9917 4.58398 10.0002C4.58398 7.00862 7.00911 4.5835 10.0007 4.5835C12.9922 4.5835 15.4173 7.00862 15.4173 10.0002Z"
        fill="#FC5F2B"
      />
    </svg>
  </div>
);

const InactiveIndicator = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <g filter="url(#filter0_dd_inactive)">
      <rect
        x="8"
        y="4"
        width="28"
        height="28"
        rx="14"
        fill="white"
        shapeRendering="crispEdges"
      />
      <rect
        x="8.5"
        y="4.5"
        width="27"
        height="27"
        rx="13.5"
        stroke="#E4E4E7"
        shapeRendering="crispEdges"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_inactive"
        x="0"
        y="0"
        width="44"
        height="44"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.025 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow"
          result="effect2_dropShadow"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

const AnimatedDottedLine = () => (
  <motion.div
    className="mt-2 h-full w-px"
    style={{
      backgroundImage:
        'linear-gradient(to bottom, #E4E4E7 50%, transparent 50%)',
      backgroundSize: '1px 8px',
    }}
    animate={{
      backgroundPositionY: ['0px', '8px'],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

const SetupItem = ({
  item,
  isActive,
  isLast,
  index,
}: {
  item: SetupItemData;
  isActive: boolean;
  isLast: boolean;
  index: number;
}) => {
  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.4 + index * 0.1,
        ease: 'easeOut',
      }}
    >
      <div className="mt-6 flex flex-col items-center">
        {isActive ? <ActiveIndicator /> : <InactiveIndicator />}
        {!isLast && <AnimatedDottedLine />}
      </div>
      <div
        className={cn(
          'mb-3 flex flex-1 items-center bg-white gap-4 rounded-2xl border p-4',
          isActive
            ? 'border-vermillion-900 outline-2 outline outline-vermillion-900/20'
            : 'border-zinc-200 shadow-sm',
        )}
      >
        <div className="flex-1">
          <div className="text-lg font-medium text-zinc-900">{item.title}</div>
          {item.description && (
            <div className="text-sm text-zinc-500">{item.description}</div>
          )}
        </div>
        <img src={item.image} alt="" className="h-14 w-auto object-contain" />
      </div>
    </motion.div>
  );
};

export const ChecklistStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered className="bg-zinc-50">
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <H2 className="text-zinc-900">Let&apos;s complete your twin</H2>
            <Body1 className="mt-2 text-zinc-500">
              The more information you share the better your insights and
              recommendations will be.
            </Body1>
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="mb-4 text-lg font-medium text-zinc-900">
              Set up your twin
            </div>
            <div>
              {SETUP_ITEMS.map((item, index) => (
                <SetupItem
                  key={item.id}
                  item={item}
                  isActive={index === 0}
                  isLast={index === SETUP_ITEMS.length - 1}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          <p className="mt-8 text-center text-sm text-zinc-400">
            All your health data is private and secure,
            <br />
            and will never be sold to a third party.
          </p>
        </div>
      </div>

      <Sequence.StepFooter className="bg-zinc-50">
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Next
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
