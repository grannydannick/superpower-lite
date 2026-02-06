import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';

/**
 * OrganAgePreview - Follows same layout pattern as IntroStep
 *
 * Light background on BOTH mobile and desktop.
 * Mobile: Edge-to-edge image at top
 * Desktop: Unconstrained centered image
 */
export const OrganAgePreview = () => {
  const { next, skipNext } = useSequence();
  const { gender } = useGender();

  const imageSrc =
    gender === 'female'
      ? '/onboarding/upsell/splashes/organ-age-splash-female.webp'
      : '/onboarding/upsell/splashes/organ-age-splash-male.webp';

  return (
    <Sequence.StepLayout centered className="bg-zinc-50">
      {/* Desktop: Logo header */}
      <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
        <SuperpowerLogo className="h-4 w-[122px]" />
      </div>

      {/* Mobile: Image at top, edge-to-edge */}
      <div className="flex-1 md:hidden">
        <img
          src={imageSrc}
          alt=""
          className="h-[360px] w-full object-contain"
        />
      </div>

      {/* Desktop: Centered unconstrained image */}
      <div className="-mb-24 hidden w-full rounded-mask md:flex md:flex-col md:items-center md:pt-24">
        <img
          src={imageSrc}
          alt=""
          className="mb-16 size-auto max-h-96 w-full max-w-xl object-contain object-center"
        />
      </div>

      {/* Content */}
      <Sequence.StepContent className="space-y-1 text-center md:mx-auto md:w-full md:max-w-md md:space-y-[17px] md:px-0 md:pt-10">
        <H2 className="text-balance">How old are you really?</H2>
        <Body1 className="text-zinc-500">
          Your baseline test includes your Biological Age but you can also zoom
          into individual health systems.
        </Body1>
      </Sequence.StepContent>

      {/* CTA - stacked buttons */}
      <Sequence.StepFooter className="flex-col gap-2 md:mx-auto md:mt-6 md:w-full md:max-w-md md:px-0">
        <Button onClick={next} className="w-full">
          Go deeper than biological age
        </Button>
        <Button
          type="button"
          onClick={skipNext}
          variant="outline"
          className="hidden w-full md:block"
        >
          I&apos;m fine with ignoring this
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
