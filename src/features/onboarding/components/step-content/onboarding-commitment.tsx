import { Button } from '@/components/ui/button';

import { SignatureBlock } from '../signature-block';

export const OnboardingCommitment = (props: {
  nextStep: (() => void) | undefined;
}) => (
  <section className="mx-auto flex max-w-[500px] flex-col gap-y-12">
    <div className="flex flex-col space-y-12">
      <div className="space-y-8">
        <h1 className="text-3xl text-white md:text-6xl">
          Your commitment to health
        </h1>
        <div className="space-y-6">
          <div className="flex flex-row gap-x-4">
            <p className="text-white opacity-60">1</p>
            <p className="text-white">
              Commit to truly putting your health first, always.
            </p>
          </div>
          <div className="flex flex-row gap-x-4">
            <p className="text-white opacity-60">2</p>
            <p className="text-white">
              Realize that optimal health is a daily journey, not a destination.
            </p>
          </div>
          <div className="flex flex-row gap-x-4">
            <p className="text-white opacity-60">3</p>
            <p className="text-white">
              Understand that your health is the foundation to success in your
              career, business, and personal life.
            </p>
          </div>
        </div>
      </div>
      <div>
        <SignatureBlock />
      </div>
      <Button
        // isLoading={schema.isPending}
        onClick={() => props.nextStep && props.nextStep()}
        type="submit"
        className="w-full text-base md:text-lg"
        variant="white"
        size="lg"
      >
        Next
      </Button>
    </div>
  </section>
);
