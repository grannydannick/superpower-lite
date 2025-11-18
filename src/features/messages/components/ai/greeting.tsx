import { motion } from 'framer-motion';

import { useUser } from '@/lib/auth';

export const Greeting = () => {
  const { data: user } = useUser();
  return (
    <div
      key="overview"
      className="mx-auto flex size-full flex-col md:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-semibold md:text-2xl"
      >
        Hi {user?.firstName ?? 'from Superpower'}, how can we help you?
      </motion.div>
    </div>
  );
};
