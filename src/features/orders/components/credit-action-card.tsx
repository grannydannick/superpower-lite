import { linkOptions } from '@tanstack/react-router';
import { cva, VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body1, Body2 } from '@/components/ui/typography';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { Credit } from '@/types/api';
import { getServiceImage } from '@/utils/service';

const cardVariants = cva(
  'group relative flex items-center gap-3 rounded-[20px] px-4 py-2',
  {
    variants: {
      variant: {
        highlighted:
          'border border-vermillion-900 bg-white shadow-[0_0_4px_0_rgba(252,95,43,0.5)]',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CreditActionCardProps extends VariantProps<
  typeof cardVariants
> {
  credit: Credit;
  className?: string;
}

export const CreditActionCard = ({
  credit,
  variant,
  className,
}: CreditActionCardProps) => {
  // this is cached after first call so we are safe
  const servicesQuery = useServices();
  const services = servicesQuery.data?.services ?? [];

  const getUrl = () => {
    const service = services.find((s) => s.id === credit.serviceId);

    if (!service || !service?.group) return linkOptions({ to: '/schedule' });

    return linkOptions({ to: '/schedule', search: { mode: service.group } });
  };

  return (
    <Link {...getUrl()} className={cn(cardVariants({ variant, className }))}>
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src={getServiceImage(credit.serviceName)}
          alt={credit.serviceName}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">Schedule your test</Body1>
          <Body2 className="text-zinc-600">{credit.serviceName}</Body2>
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </div>
    </Link>
  );
};
