import { cva, VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import moment from 'moment';

import { Link } from '@/components/ui/link';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { FhirCarePlan } from '@/types/api';

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
  carePlan: FhirCarePlan;
  className?: string;
}

export const ProtocolActionCard = ({
  carePlan,
  variant,
  className,
}: CreditActionCardProps) => {
  const getUrl = () => {
    return `/plans/${carePlan.id}`;
  };

  return (
    <Link to={getUrl()} className={cn(cardVariants({ variant, className }))}>
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src={'/services/custom_blood_panel.png'}
          alt={'Superpower service'}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">{carePlan.title}</Body1>

          {carePlan.created ? (
            <Body2 className="text-zinc-600">
              {moment(carePlan.created).format('MMM D, YYYY')}
            </Body2>
          ) : null}
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </div>
    </Link>
  );
};
