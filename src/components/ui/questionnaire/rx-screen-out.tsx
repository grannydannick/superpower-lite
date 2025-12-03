import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body2, H3, H4 } from '@/components/ui/typography';

import { isGLP1FrontDoorExperiment } from './utils/questionnaire-utils';

const RX_SCREEN_OUT_TEXT = [
  {
    title:
      'Thank you for taking the time to share your health information with us.',
    heading: 'Our clinical decision',
    body: [
      'After reviewing your responses, our clinical team is not able to safely prescribe the medication you requested at this time. This decision is based on medical guidelines and safety considerations designed to protect your long-term health.',
    ],
  },
  {
    heading: 'Why we made this decision',
    body: [
      'We know this may feel disappointing, especially if you were hoping this medication could support your goals. Your health and well-being are important to us, and we appreciate the time you took to share your information.',
    ],
  },
  {
    heading: 'Have questions or concerns?',
    body: [
      'If you have questions about this decision, or believe something may have been misunderstood, please reach out to your concierge at concierge@superpower.com so we can review it with you and help you understand possible next steps.',
    ],
  },
];

const RX_SCREEN_OUT_FRONT_DOOR_TEXT = [
  {
    title:
      'Thank you for taking the time to share your health information with us.',
    heading: 'Our clinical decision',
    body: [
      'After reviewing your responses, our clinical team is not able to safely prescribe GLP-1 medication at this time. This decision is based on medical guidelines and safety considerations designed to protect your long-term health.',
    ],
  },
  {
    heading: 'What happens next?',
    body: [
      'We know this may be disappointing if you were hoping to start GLP-1s, and we appreciate the time you took to complete the intake.',
      'Because we’re unable to move forward with treatment, your payment has been fully refunded to your original payment method, and you will not be enrolled in a Superpower membership.',
    ],
  },
  {
    heading: 'Questions about your refund or care?',
    body: [
      'If you have any questions about this decision or your refund, please reach out to our concierge at concierge@superpower.com and we’ll be happy to review it with you.',
    ],
  },
];

export const RxScreenOut = ({
  response,
}: {
  response: QuestionnaireResponse;
}) => {
  const isFrontDoorExperiment = isGLP1FrontDoorExperiment(response);
  const navigate = useNavigate();

  const text = isFrontDoorExperiment
    ? RX_SCREEN_OUT_FRONT_DOOR_TEXT
    : RX_SCREEN_OUT_TEXT;

  return (
    <div className="min-h-screen bg-zinc-100 px-8">
      <div className="mx-auto max-w-[570px] py-24 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <SuperpowerLogo className="w-32" />
        </motion.div>
        <RxScreenOutInformation text={text} />
        {/* NOTE: We don't render this button if it's a front door experiment since
          their Superpower membership is cancelled; we don't want them going anywhere unintended! */}
        {!isFrontDoorExperiment && (
          <Button className="mt-10 w-full" onClick={() => navigate('/')}>
            I Understand
          </Button>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-16 w-full items-end justify-between bg-gradient-to-t from-white/25 to-transparent">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 0V25H25C11.1934 25 0 13.8071 0 0Z"
              fill="white"
            />
          </svg>
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M25 0V25H0C13.8066 25 25 13.8071 25 0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

function RxScreenOutInformation({
  text,
}: {
  text: typeof RX_SCREEN_OUT_TEXT | typeof RX_SCREEN_OUT_FRONT_DOOR_TEXT;
}) {
  return (
    <motion.section
      id="main"
      className="space-y-8 pt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {text.map((item: any, idx: number) => (
        <motion.div
          key={item.heading || idx}
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            delay: 0.2 + idx * 0.1,
          }}
        >
          <H3>{item.title}</H3>
          <H4>{item.heading}</H4>
          <div className="space-y-4">
            {item.body.map((body: string, index: number) => (
              <Body2 key={index} className="text-secondary">
                {body
                  .split(/(concierge@superpower\.com)/g)
                  .map((part: string, i: number) =>
                    part.match(/concierge@superpower\.com/) ? (
                      <a
                        key={i}
                        href={`mailto:concierge@superpower.com`}
                        className="text-vermillion-900 underline-offset-1 hover:underline"
                      >
                        concierge@superpower.com
                      </a>
                    ) : (
                      part
                    ),
                  )}
              </Body2>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
