import {
  centralIcons,
  type CentralIconName,
} from '@central-icons-react/round-filled-radius-2-stroke-1.5/icons';

interface LazyIconProps {
  name: string;
  size?: number | string;
  className?: string;
}

export function LazyIcon({ name, size = 24, className }: LazyIconProps) {
  const iconData = centralIcons[name as CentralIconName];
  if (iconData == null) return null;

  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      dangerouslySetInnerHTML={{ __html: iconData.svg }}
    />
  );
}
