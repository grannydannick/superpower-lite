import { AddressForm } from '@/components/ui/autocomplete-address/autocomplete-address';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetServiceability } from '@/features/onboarding/api/get-serviceability';

export const OnboardingPrimaryAddress = (props: {
  nextStep: (() => void) | undefined;
}) => {
  const getServiceabilityMutation = useGetServiceability();

  const onSubmit = async (address: any) => {
    const data = { postalCode: address.postalCode };
    const { serviceable } = await getServiceabilityMutation.mutateAsync({
      data,
    });

    if (serviceable) {
      props.nextStep && props.nextStep();
    }
  };

  return (
    <section
      id="main"
      className="mx-auto flex max-w-[500px] flex-col gap-y-12 text-center md:max-w-3xl"
    >
      <div className="space-y-12">
        <div className="space-y-3 ">
          <p className="text-sm text-white opacity-80 md:text-base">
            Welcome to Superpower
          </p>
          <h1 className="text-3xl text-white md:text-6xl">
            Where do you live or primarily plan to receive services?
          </h1>
        </div>
        <AddressForm
          //googleApiKey={'AIzaSyB4uyJlUrJDEcJHmHDzeS0gHa4Wcg--keU'}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
};

export const OnboardingContentComingSoon = (props: {
  prevStep: (() => void) | undefined;
  nextStep: (() => void) | undefined;
}) => (
  <section
    id="main"
    className="mx-auto flex max-w-md flex-col gap-y-12 text-center"
  >
    <div className="flex flex-col space-y-12">
      <div className="space-y-3">
        <h1 className="text-3xl text-white md:text-6xl">
          More coverage
          <br /> coming soon
        </h1>
        <p className="text-sm text-white opacity-80 md:text-base">
          While we haven’t reached your area yet, we’re actively
          <br className="hidden md:block" /> expanding. Stay tuned, and we’ll
          let you know as soon as <br className="hidden md:block" />
          we’re available nearby.
        </p>
      </div>
      <div className="mx-auto flex flex-row text-sm text-white opacity-80 md:text-base">
        <div className="mr-4 mt-0.5">
          <Checkbox
            id="terms"
            className="border-white/80 data-[state=checked]:bg-white data-[state=checked]:text-orange-900"
          />
        </div>
        <p>Notify me when service is available</p>
      </div>
      <div>
        <Button
          // isLoading={schema.isPending}
          onClick={() => {
            props.nextStep && props.nextStep();
          }}
          type="submit"
          className="w-full text-base md:text-lg"
          variant="white"
          size="lg"
        >
          Done
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => props.prevStep && props.prevStep()}
        >
          Try another zip code
        </Button>
      </div>
    </div>
  </section>
);
