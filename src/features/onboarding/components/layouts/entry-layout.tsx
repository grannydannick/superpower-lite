import { ChevronLeft } from 'lucide-react';
import moment from 'moment';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body3, Mono } from '@/components/ui/typography';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

type EntryLayoutType =
  | 'empty' // no text top and bottom
  | 'time-footer' // semi-transparent footer and time text overlay.
  | 'default' // text positioned at both the top and bottom.
  | 'action-header' // semi-transparent footer, logo, and back button
  | 'animation'; // white background and black text

type Props = {
  type: EntryLayoutType;
  title: string;
  children: JSX.Element;
  className?: string;
  bottomBlockTxt?: string;
};

export const EntryLayout = (props: Props) => {
  const { prevStep } = useStepper((s) => s);
  const { type, title, children, className, bottomBlockTxt } = props;
  const [time, setTime] = useState(moment().format('MMMM Do YYYY, h:mm:ss a'));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format('MMMM Do YYYY, h:mm a'));
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const imgBg =
    type === 'default' ||
    type === 'time-footer' ||
    type === 'empty' ||
    type === 'action-header';

  const displayBtmText = type === 'default' || type === 'animation';

  const displayTopText =
    type === 'default' || type === 'animation' || type === 'time-footer';

  const displayBottomBlock = type === 'time-footer' || type === 'action-header';

  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'flex min-h-screen w-full flex-col items-center p-8 md:p-6',
          type === 'animation' && 'bg-[#F7F7F7]',
        )}
      >
        {imgBg && (
          <div
            className={cn(
              'fixed left-0 top-0 z-0 h-screen w-full bg-female-looking-up bg-cover bg-center',
              className,
            )}
          />
        )}
        <div className="z-10 flex w-full flex-1 flex-col">
          {displayTopText ? (
            <div>
              <Mono
                className={cn(
                  'text-center text-xs tracking-[2.4px] text-white opacity-60',
                  type === 'animation' && 'text-zinc-900',
                )}
              >
                {time}
              </Mono>
            </div>
          ) : null}
          {type === 'action-header' ? (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="glass"
                className="size-12 rounded-full p-0"
                onClick={() => {
                  prevStep();
                }}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="w-[114px]">
                <img className="w-auto" src="/logo.svg" alt="logo" />
              </div>
              <div className="size-12" />
            </div>
          ) : null}
          <div className="flex w-full flex-1 flex-col justify-center">
            {children}
          </div>
          {displayBtmText ? (
            <div>
              <Mono
                className={cn(
                  'text-center tracking-[2.4px] text-white opacity-60',
                  type === 'animation' && 'text-zinc-900',
                )}
              >
                Superpower Your Health
              </Mono>
            </div>
          ) : null}

          {displayBottomBlock && (
            <div className="fixed bottom-0 left-0 flex w-full justify-center bg-white/5 p-4">
              <Body3 className="text-center text-white">
                {bottomBlockTxt ??
                  ` Your answers will only be viewed by your medical team and will
                not be shared with any partners without your explicit consent.`}
              </Body3>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
