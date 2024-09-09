import { ArrowRight, CheckIcon, LockKeyhole } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

export const TimelineRoute = () => {
  return (
    <div className="space-y-12 sm:space-y-20">
      <div className="flex gap-x-4 sm:justify-center sm:gap-x-6">
        <NavLink to={'/timeline'}>
          <span className="text-2xl text-zinc-900 opacity-100 sm:text-[20px]">
            Timeline
          </span>
        </NavLink>
        <NavLink to={'/services'}>
          <span className="text-2xl text-zinc-900 opacity-20 sm:text-[20px]">
            Services
          </span>
        </NavLink>
      </div>
      {/* <div className="mx-auto max-w-[600px]"> */}
      {/*   <TimelineList /> */}
      {/* </div> */}
      <div className="space-y-8">
        <div className="mx-auto flex flex-col justify-center space-y-1 text-center">
          <div className="mx-auto">
            <svg
              width="1"
              height="32"
              viewBox="0 0 1 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="32"
                x2="0.500001"
                y2="-2.18557e-08"
                stroke="url(#paint0_linear_4284_13352)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_4284_13352"
                  x1="1.5"
                  y1="32"
                  x2="1.5"
                  y2="-1.40866e-06"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FC5F2B" />
                  <stop offset="0.43" stopColor="#C2897C" stopOpacity="0.365" />
                  <stop offset="1" stopColor="#A1A1AA" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="text-sm leading-5 text-zinc-500">Jan 3, 2024</p>
          <p className="text-sm leading-5 text-zinc-400">
            Your Superpower health journey begins
          </p>
        </div>
        <Example />
        <div className="mx-auto flex flex-col justify-center space-y-1 text-center">
          <div className="mx-auto">
            <svg
              width="1"
              height="32"
              viewBox="0 0 1 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="32"
                x2="0.500001"
                y2="-2.18557e-08"
                stroke="url(#paint0_linear_4284_13352)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_4284_13352"
                  x1="1.5"
                  y1="32"
                  x2="1.5"
                  y2="-1.40866e-06"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FC5F2B" />
                  <stop offset="0.43" stopColor="#C2897C" stopOpacity="0.365" />
                  <stop offset="1" stopColor="#A1A1AA" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="text-sm leading-5 text-zinc-500">Baseline program</p>
        </div>
        <Example />
      </div>
    </div>
  );
};

// const timelineItems = [
//   {
//     name: 'Health history evaluation',
//     imgPath: '/src/assets/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Insurance Integration',
//     imgPath: '/src/assets/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Connect wearables',
//     imgPath: '/src/assets/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Activate your concierge',
//     imgPath: '/src/assets/services/superpower_blood_panel.png',
//   },
// ];

// const TimelineList = () => {
//   return (
//     <div className="grid grid-cols-1 gap-y-2">
//       {timelineItems.map((ti) => (
//         <TimelineItem key={ti.name} {...ti} />
//       ))}
//     </div>
//   );
// };

type TimelineItemProps = {
  name: string;
  imgPath: string;
};

const TimelineItem = (props: TimelineItemProps) => {
  return (
    <div className="rounded-[24px] bg-[#F7F7F7] p-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-x-8">
          <img
            src={props.imgPath}
            alt={props.name}
            className="size-[72px] rounded-[16px]"
          />
          <p className="text-lg text-zinc-900">{props.name}</p>
        </div>
        <ArrowRight className="text-zinc-400" />
      </div>
    </div>
  );
};

const steps = [
  {
    name: 'Create account',
    description: 'Vitae sed mi luctus laoreet.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'Profile information',
    description: 'Cursus semper viverra facilisis et et some more.',
    href: '#',
    status: 'current',
  },
  {
    name: 'Business information',
    description: 'Penatibus eu quis ante.',
    href: '#',
    status: 'upcoming',
  },
  {
    name: 'Theme',
    description: 'Faucibus nec enim leo et.',
    href: '#',
    status: 'else',
  },
  {
    name: 'Preview',
    description: 'Iusto et officia maiores porro ad non quas.',
    href: '#',
    status: 'upcoming',
  },
];

export default function Example() {
  return (
    <nav aria-label="Progress">
      <ol className="mx-auto max-w-[600px]">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== steps.length - 1 ? 'pb-2' : '',
              'relative -ml-20',
            )}
          >
            {step.status === 'complete' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-4 top-12 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-center"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-8 items-center bg-white py-3"
                  >
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border border-zinc-300 bg-white">
                      <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-[#10B981] p-1">
                        <CheckIcon
                          aria-hidden="true"
                          className="size-3 text-white"
                        />
                      </span>
                      <div
                        style={{
                          borderRadius: 50,
                          opacity: 0.7,
                          background: '#34D399',
                          filter: 'blur(6px)',
                          position: 'absolute',
                          left: 8,
                          width: 16,
                          height: 16,
                          bottom: 0,
                        }}
                      />
                    </span>
                  </span>
                  <span className="ml-12 w-full">
                    <div>
                      <TimelineItem
                        name="Health history evaluation"
                        imgPath="/services/superpower_blood_panel.png"
                      />
                    </div>
                  </span>
                </a>
              </>
            ) : step.status === 'else' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-4 top-12 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                  />
                ) : null}
                <a
                  href={step.href}
                  aria-current="step"
                  className="group relative flex items-center"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-8 items-center bg-white py-3"
                  >
                    <div className="relative z-10 flex size-8 items-center justify-center rounded-full bg-white">
                      <span className="relative z-10 flex size-[21px] items-center justify-center rounded-full border-[1.3px] border-[#FC5F2B]">
                        <span className="size-[13px] rounded-full bg-[#FC5F2B]" />
                      </span>
                      <div
                        style={{
                          width: 15.75,
                          height: 15.75,
                          position: 'absolute',
                          left: 8,
                          bottom: 5,
                          background: '#FC5F2B',
                          opacity: 0.4,
                          filter: 'blur(2.625px)',
                          borderRadius: '100%',
                        }}
                      />
                    </div>
                  </span>
                  <span className="ml-12 w-full">
                    <div>
                      <TimelineItem
                        name="Health history evaluation"
                        imgPath="/services/superpower_blood_panel.png"
                      />
                    </div>
                  </span>
                </a>
              </>
            ) : step.status === 'current' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-4 top-12 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                  />
                ) : null}
                <a
                  href={step.href}
                  aria-current="step"
                  className="group relative flex items-center"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-8 items-center bg-white py-3"
                  >
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-white">
                      <span className="relative z-10 flex size-5 items-center justify-center rounded-full border border-zinc-400 p-1"></span>
                    </span>
                  </span>
                  <span className="ml-12 w-full">
                    <div>
                      <TimelineItem
                        name="Health history evaluation"
                        imgPath="/services/superpower_blood_panel.png"
                      />
                    </div>
                  </span>
                </a>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-4 top-12 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-center"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-8 items-center bg-white py-3"
                  >
                    <span className="relative z-10 flex size-8 items-center justify-center">
                      <span className="relative z-10 flex size-[18px] items-center justify-center rounded-full">
                        <LockKeyhole
                          aria-hidden="true"
                          className="size-[18px] text-zinc-400"
                        />
                      </span>
                    </span>
                  </span>
                  <span className="ml-12 w-full">
                    <div>
                      <TimelineItem
                        name="Health history evaluation"
                        imgPath="/services/superpower_blood_panel.png"
                      />
                    </div>
                  </span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
