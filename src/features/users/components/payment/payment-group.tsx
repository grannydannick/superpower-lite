import { cn } from '@/lib/utils';

export const PaymentGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn('space-y-4', className)}>{children}</div>;
};
