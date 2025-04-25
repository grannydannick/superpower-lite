import { useState } from 'react';

interface ProgressiveImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  /** Alt text for accessibility (required) */
  alt: string;
  /** Optional low-quality placeholder URL */
}

export function ProgressiveImage({
  src,
  alt,
  className,
  ...rest
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`
        ${className}
        transition-[filter,transform] duration-500 ease-out
        ${loaded ? 'filter-none' : 'bg-muted  blur-sm'}
      `}
      {...rest}
    />
  );
}
