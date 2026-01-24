import { Icon3dSphere } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/Icon3dSphere';

import { Body2, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface DigitalTwinFallbackProps {
  className?: string;
}

export const DigitalTwinFallback = ({
  className,
}: DigitalTwinFallbackProps) => {
  return (
    <div
      className={cn(
        'w-full h-[28rem] md:mt-0 -mt-12 md:[@media(max-height:800px)]:h-[48rem] md:h-[80vh] md:max-h-[56rem] flex items-center justify-center',
        className,
      )}
    >
      <div className="max-w-md space-y-4 p-8 text-center">
        <Icon3dSphere className="mx-auto mb-4 size-8" />
        <div className="space-y-1.5">
          <H4>Unable to Load 3D Asset</H4>
          <Body2 className="text-sm leading-relaxed text-secondary">
            Your device doesn&apos;t meet the minimum requirements for 3D
            rendering. This may be due to hardware acceleration being disabled
            or insufficient graphics capabilities.
          </Body2>
        </div>
      </div>
    </div>
  );
};
