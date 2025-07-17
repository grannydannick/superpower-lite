import { Body1, Body2 } from '@/components/ui/typography';

export const REGISTER_FEATURES = [
  '100+ biomarkers tested',
  'A personalized plan that evolves with you',
  '17 health scores and your biological age',
  'A medical team in your pocket you can message 24/7',
  'An ecosystem of the best diagnostics, supplements, Rx’s and more',
];

export const MEMBERSHIP_BENEFITS = [
  {
    title: <Body1>100+ lab tests</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        Annual whole body testing for heart health, hormones, inflammation,
        nutrients, and more.&nbsp;
        <a
          href="https://superpower.com/biomarkers"
          target="_blank"
          rel="noreferrer"
          className="text-vermillion-900"
        >
          See all tests
        </a>
      </Body2>
    ),
    image: 'onboarding/lab-tests.webp',
  },
  {
    title: <Body1>Your data tracked overtime</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        Medical records, family history, and your lab results all in one place
        tracked over a lifetime
      </Body2>
    ),
    image: 'onboarding/your-data.webp',
  },
  {
    title: <Body1>Custom protocol & 24/7 health concierge</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        An action plan from world-class experts using the latest in scientific
        research and unlimited texting with your concierge
      </Body2>
    ),
    image: 'onboarding/custom-protocol.webp',
  },
];

export const MEMBERSHIP_FAQ = [
  {
    display: 'What lab tests do I get in a membership?',
    description: (
      <p>
        A membership covers two lab panels per year. The first establishes your
        baseline across 60 labs — each handpicked by our board of MDs. The
        second, six months later, rechecks the same 60 to track progress. You
        can find the full list of tested biomarkers{' '}
        <a
          href="https://superpower.com/biomarkers"
          target="_blank"
          rel="noreferrer"
          className="text-vermillion-900 underline-offset-2 hover:underline"
        >
          here
        </a>
        . Our membership also includes a custom written action plan and access
        to a concierge medical team via text.
      </p>
    ),
  },
  {
    display: 'Don’t I already get a blood test in my general checkup?',
    description:
      "Your general check up includes anywhere from 10 to 30 labs, which isn't a comprehensive view of your health. We take it a step further by testing 60+ labs across 17 core areas of health (e.g. heart, liver, inflammation, hormones and more) to ensure we give you a precise and tailored action plan to take your health to the next level.",
  },
  {
    display: 'Can I get more tests whenever I want?',
    description:
      'Yes. We’re here to support all of your preventative health, performance and longevity needs. A core part of the Superpower Concierge is being able to get you access to all the testing you need. That includes gut microbiome, toxin tests, Galleri’s cancer screen, and more.',
  },
  {
    display: 'Do you replace my primary care doctor?',
    description:
      'We do not offer typical sick care, but rather, our care team is there to answer questions related to prevention, performance, and longevity.',
  },
  {
    display: 'Where do I go for my lab visit?',
    description:
      'We partner with over 2,000 locations across the US. Our lab partner performs billions of tests each year and is one of the leading labs in the nation. We also offer at-home testing for an additional fee where a private nurse will come to you.',
  },
  {
    display: 'Does Superpower accept HSA/FSA?',
    description: (
      <p>
        Superpower is HSA/FSA eligible, and members can request an itemized
        receipt from{' '}
        <a
          href="mailto:members@superpower.com"
          className="text-vermillion-900 underline-offset-2 hover:underline"
        >
          members@superpower.com
        </a>{' '}
        to submit for reimbursement. If for whatever reason your HSA/FSA
        reimbursement is declined, we’re happy to refund you prior to your first
        lab test.
      </p>
    ),
  },
];
