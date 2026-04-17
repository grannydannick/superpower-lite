import { m } from 'framer-motion';
import { useState } from 'react';

interface ImageWithRevealProps {
  src: string;
  alt: string;
  className?: string;
  /** Extra delay after image loads before starting the fade-in (seconds). Default: 0 */
  delay?: number;
}

/**
 * Renders an image that fades in only after it has fully loaded,
 * preventing the pop-in that occurs when the TransitionWrapper animation
 * fires before the browser has decoded the image.
 */
export const ImageWithReveal = ({
  src,
  alt,
  className,
  delay = 0,
}: ImageWithRevealProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <m.img
      src={src}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
      initial={{ opacity: 0, y: 12 }}
      animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
    />
  );
};
