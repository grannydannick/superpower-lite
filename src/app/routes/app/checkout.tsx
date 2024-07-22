import { ArrowUpRight, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { useState } from 'react';

import dashboard from '@/assets/checkout/dashboard.png';
import membershipAvi from '@/assets/checkout/membership-avi.png';
import logoDark from '@/assets/logo-dark.svg';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export const CheckoutRoute = () => {
  return (
    <div className="flex flex-row">
      <div className="fixed w-1/2">
        <CheckoutFeatureSection />
      </div>
      <div className="ml-[50%] w-1/2">
        <CheckoutOptionsSection />
      </div>
    </div>
  );
};

const CheckoutOptionsSectionPlan = () => {
  return (
    <section id="plan" className="w-[500px] space-y-6">
      <div className="space-y-2">
        <h3 className="text-3xl text-[#1E1E1E]">Plan</h3>
      </div>
      <div>
        <div className="flex flex-row items-center rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-6 py-5">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-row gap-x-4">
              <img
                src={membershipAvi}
                alt="Superpower Membership"
                className="size-12"
              />
              <div>
                <p>Superpower Membership</p>
                <div className="flex flex-row items-center">
                  <span>$499</span>
                  <Dot className="text-[#A1A1AA]" />
                  <span className="text-[#A1A1AA]">Billed annually</span>
                </div>
              </div>
            </div>
            <RadioGroup>
              <div className="flex flex-row items-center gap-x-6">
                <RadioGroupItem
                  value={'Superpower Membership'}
                  className="size-5 border-[#E4E4E7]"
                  checked={true}
                />
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </section>
  );
};

const CheckoutOptionsSectionPackage = () => {
  return (
    <section id="package" className="w-[500px] space-y-6">
      <div className="space-y-2">
        <h3 className="text-3xl text-[#1E1E1E]">Blood test package</h3>
        <p className="text-base text-[#71717A]">
          Choose the blood test package would like as part of your membership.
        </p>
        <a
          href="https://superpower.com/biomarkers"
          target="blank"
          rel="noreferrer"
          className="flex flex-row items-center space-x-1 text-[#FC5F2B]"
        >
          <span>See all tests and compare plans</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
      <div className="space-y-2">
        <RadioGroup>
          {packages.map((service, i) => (
            <BloodTestPackageCard key={i} service={service} />
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

const CheckoutOptionsSectionConsults = () => {
  return (
    <section id="consult" className="w-[500px] space-y-2">
      <div className="space-y-2">
        <h3 className="text-3xl text-[#1E1E1E]">Doctor consults</h3>
        <p className="text-base text-[#71717A]">
          Book a 1 on 1, in-depth consultation with one of our longevity
          doctors.
        </p>
      </div>
      <div>
        {[
          {
            name: '1-1 Advisory Call',
            description: 'Consultation with a longevity doctor.',
            price: 199,
          },
        ].map((service, i) => (
          <AdditionalServiceCard key={i} service={service} />
        ))}
      </div>
    </section>
  );
};

const CheckoutOptionsSectionServices = () => {
  return (
    <section id="services" className="w-[500px] space-y-8">
      <div className="space-y-2">
        <h3 className="text-3xl text-[#1E1E1E]">Additional services</h3>
        <p className="text-base text-[#71717A]">
          Your private health concierge will help you schedule them.
        </p>
      </div>
      <div className="space-y-2">
        {services.map((service, i) => (
          <AdditionalServiceCard key={i} service={service} />
        ))}
      </div>
    </section>
  );
};

const CheckoutOptionsSection = () => {
  return (
    <div className="flex flex-col items-center space-y-24 px-16 py-32">
      <CheckoutOptionsSectionPlan />
      <CheckoutOptionsSectionPackage />
      <CheckoutOptionsSectionConsults />
      <CheckoutOptionsSectionServices />
    </div>
  );
};

const packages = [
  {
    name: 'Baseline',
    description: '65 biomarkers',
    price: 0,
  },
  {
    name: 'Advanced',
    description: '85 biomarkers',
    price: 199,
  },
];

type BloodTestPackageCardProps = {
  service: HealthcareService;
};

const BloodTestPackageCard = ({ service }: BloodTestPackageCardProps) => {
  return (
    <div className="flex flex-row items-center rounded-xl border border-[#E4E4E7] px-6 py-5">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row gap-x-4">
          <div>
            <p>{service.name}</p>
            <div className="flex flex-row items-center">
              <span className="text-[#A1A1AA]">{service.description}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-6">
          <span className="text-[#71717A]">
            {service.price === 0 ? 'Included' : `+$${service.price}`}
          </span>
          <RadioGroupItem
            value={service.name}
            className="size-5 border-[#E4E4E7]"
          />
        </div>
      </div>
    </div>
  );
};

const services = [
  {
    name: 'Grail Galleri Multi Cancer Test',
    description:
      'Detect signals of over 50 types of cancers at their earliest, most treatable stages.',
    price: 1099,
  },
  {
    name: 'Full Genetic Sequencing',
    description:
      'Examines your DNA to identify genetic predispositions to certain conditions.',
    price: 10,
  },
  {
    name: 'Food & Environmental Allergy Testing',
    description:
      'Determine your allergy and sensitivity status to over 350+ foods and common allergens.',
    price: 10,
  },
  {
    name: 'Continuous Glucose Monitor',
    description: '80+ biomarkers tested in a fully comprehensive blood panel.',
    price: 10,
  },
];

type HealthcareService = {
  name: string;
  description: string;
  price: number;
};

type AdditionalServiceCardProps = {
  service: HealthcareService;
};

const AdditionalServiceCard = ({ service }: AdditionalServiceCardProps) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <div
      className={cn(
        'flex flex-row items-center rounded-xl border border-[#E4E4E7] py-5 pl-6 pr-8 hover:bg-[#FAFAFA] cursor-pointer',
        checked ? 'bg-[#FAFAFA]' : '',
      )}
      onClick={() => {
        setChecked(!checked);
      }}
      role="presentation"
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex max-w-[300px] flex-row gap-x-4">
          <img
            src={`/src/assets/services/${service.name.replaceAll(' ', '_')}.png`}
            alt={service.name}
            className="m-1 size-16 rounded-lg object-cover"
          />
          <div className="flex flex-col">
            <p className="line-clamp-1 text-[#71717A]">{service.name}</p>
            <span className="line-clamp-2 text-[#A5A5AE]">
              {service.description}
            </span>
            <a href="#" className="mt-1 text-[#FC5F2B]">
              More info
            </a>
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-6">
          <span className="text-[#71717A]">+${service.price}</span>
          <Checkbox checked={checked} className="size-5 border-[#E4E4E7]" />
        </div>
      </div>
    </div>
  );
};

const CheckoutFeatureSection = () => {
  return (
    <div className="bg-[#F7F7F7]">
      <div id="feature">
        <div className="flex min-h-screen w-full flex-col items-center justify-between p-8">
          <section
            id="header"
            className="flex w-full items-center justify-between"
          >
            <div className="size-12" />
            <div className="w-[114px]">
              <img className="w-auto" src={logoDark} alt="logo" />
            </div>
            <div className="size-12" />
          </section>
          <div
            className="flex w-full max-w-3xl items-center justify-center"
            style={{ flexGrow: 1 }}
          >
            <img src={dashboard} alt="dashboard" className="w-full" />
          </div>
          <section id="footer" className="my-3 w-full text-[#A1A1A1]">
            <p className="text-xs">FAQ - How it works</p>
            <p className="text-lg text-zinc-900">
              What does the Superpower Concierge do?
            </p>
            <hr className="mb-2 mt-3 bg-[#71717A]" />
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center space-x-4">
                <ChevronLeft className="size-4 cursor-pointer hover:text-zinc-900" />
                <ChevronRight className="size-4 cursor-pointer hover:text-zinc-900" />
              </div>
              <a href="#" className="text-sm hover:text-zinc-900">
                View FAQs
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
