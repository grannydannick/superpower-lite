import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export const ItemPreview = (
  props: React.ComponentProps<'div'> & { image: string },
) => {
  return (
    <div
      {...props}
      className={cn(
        'relative flex size-full aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white',
        props.className,
      )}
    >
      <motion.div
        initial={{ backgroundColor: 'white' }}
        animate={{ backgroundColor: 'transparent' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative z-20 size-full max-w-[512px]"
      >
        <motion.img
          src={props.image}
          alt="Test Box"
          className="relative z-10 aspect-square size-full object-contain"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>
      <div className="absolute left-1/2 top-1/2 size-full max-h-[512px] max-w-[512px] -translate-x-1/2 -translate-y-1/2">
        <motion.img
          src="/services/drop-shadow.webp"
          alt="Shadow"
          className="absolute left-1/2 top-1/2 ml-[-10%] mt-[10%] size-full object-contain [@media(max-height:550px)]:ml-[-6.5vh] [@media(max-height:550px)]:mt-[7vh]"
          initial={{
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.95)',
          }}
          animate={{
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  );
};
