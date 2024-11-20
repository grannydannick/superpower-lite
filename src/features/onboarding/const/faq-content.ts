type Faq = {
  display: string;
  description: string;
};

const HOW_IT_WORKS: Faq[] = [
  {
    display: 'Can I get more tests whenever I want?',
    description:
      'Yes. We’re here to support all of your preventative health, performance and longevity needs. A core part of the Superpower Concierge is being able to get you access to all the testing you need, in minutes. That includes custom lab panels, MRIs, Galleri’s cancer screen, and more.',
  },
  {
    display: 'Do you replace my primary care doctor?',
    description: `No. Your annual membership to Superpower’s Baseline testing and health concierge is designed to complement your primary care doctor, not replace them.

We do not offer typical sick care, but rather, our longevity clinicians are there to answer questions related to prevention, performance, and longevity. We try to step in where the healthcare system is falling short. We provide best-in-class early diagnostics assessments and guidance from our longevity-trained clinicians.`,
  },
  {
    display: 'Where do I go for my lab visit?',
    description:
      'You will be tested at one of over 2,000 locations across the US, within 10 miles of nearly every home in the United States. Our lab partner performs over 50 million tests per year and is trusted by the entire medical community. We also offer at-home testing for an additional fee where a nurse will come to you.',
  },
];

const MEMBERSHIP: Faq[] = [
  {
    display: 'Does Superpower accept health insurance?',
    description: `Not at this time, but we’re working on it. We already accept HSA and FSA.

We see Superpower like a gym membership for those committed to prevention and performance. Superpower is a bridge between wellness and healthcare. Health insurance traditionally focuses on reactive care whereas, at Superpower, we believe it’s never too early to start looking out for your long-term health.`,
  },
  {
    display: 'Which tests are included in my membership?',
    description: `The first lab panel includes over 60 biomarkers, with a 6-month follow-up included in your membership.

Additional tests can be ordered at any time from the Superpower app. We have brought together the best tests into one platform. Many of these are hard to access anywhere else.`,
  },
  {
    display: 'Can I business expense Superpower?',
    description: `The majority of members business expense Superpower. Your health directly impacts the success of your business. Just as executive coaching sessions and other professional services are considered a justified expense, Superpower should be viewed in the same light. If there are reservations, we are more than willing to discuss the value of this investment with your company’s leadership team – it's a minimal cost for potentially significant returns.`,
  },
  {
    display: 'What is your price & health guarantee?',
    description: `
    Our price guarantee means that for all items in our curated marketplace, we will price match.
Our health guarantee means that all products meet our rigorous standards for ingredient quality and scientific efficacy.`,
  },
];

const SECURITY: Faq[] = [
  {
    display: 'Is my data secure?',
    description:
      'We take data privacy and information security extremely seriously. Superpower is designed to be your lifelong health partner and give you full control and ownership of your health information. All of your data is securely encrypted with full HIPAA compliance.',
  },
];

const ALL_FAQ = [...HOW_IT_WORKS, ...MEMBERSHIP, ...SECURITY];

export { ALL_FAQ, MEMBERSHIP, SECURITY, HOW_IT_WORKS };
