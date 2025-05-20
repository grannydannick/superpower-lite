import { motion } from 'framer-motion';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Body2, H3, H4 } from '@/components/ui/typography';

const SCREEN_OUT_TEXT = [
  {
    title:
      'Thank you for taking the time to share your health information with us.',
    body: [
      'Based on your responses, it appears we may need one of our clinicians to manually review your medical history.',
      'You can expect us to get back to you within the next 48 hours.',
    ],
  },
  {
    heading: 'Why do we do this?',
    body: [
      'We understand that it’s inconvenient to have the start of your Superpower journey delayed. However, we take your health seriously, and we always put our members’ safety first. Before we make any recommendations on how to improve, we need to make sure we can do so in a safe manner that prioritizes your wellbeing.',
      "You'll hear from us very soon!",
    ],
  },
];

function Information() {
  return (
    <motion.section
      id="main"
      className="space-y-8 pt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {SCREEN_OUT_TEXT.map((text, idx) => (
        <motion.div
          key={text.heading || idx}
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            delay: 0.2 + idx * 0.1,
          }}
        >
          <H3>{text.title}</H3>
          <H4>{text.heading}</H4>
          <div className="space-y-4">
            {text.body.map((body, index) => (
              <Body2 key={index} className="text-secondary">
                {body.split(/(superpower@superpower\.com)/g).map((part, i) =>
                  part.match(/superpower@superpower\.com/) ? (
                    <a
                      key={i}
                      href={`mailto:${part}`}
                      className="text-white underline-offset-1 hover:underline"
                    >
                      {part}
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

export const ScreenOut = () => {
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
        <Information />
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
        <div className="flex w-screen items-center justify-center bg-white px-10 py-4 text-center md:h-14">
          <Body2 className="text-primary">
            One of our clinicians will call you within the next 48 hours.
          </Body2>
        </div>
      </div>
    </div>
  );
};
