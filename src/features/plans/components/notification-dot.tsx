import { cn } from '@/lib/utils';

export const NotificationDot = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'aspect-square size-2 relative rounded-full bg-vermillion-900 outline outline-2 outline-offset-0 outline-white',
      className,
    )}
  >
    <div className="absolute inset-0 animate-ping rounded-full bg-vermillion-900" />
  </div>
);
