import { Card } from '@/components/ui/card';
import { MembershipBenefit } from '@/features/settings/types/membership';
import { cn } from '@/lib/utils';

export const MembershipBenefits = (props: {
  benefits: MembershipBenefit[];
}): JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {props.benefits.map((benefit, idx) => (
        <Card
          key={idx}
          className={cn(
            'flex flex-1 flex-row items-center space-x-4 rounded-2xl bg-zinc-50 p-4',
            idx === props.benefits.length - 1 &&
              props.benefits.length % 2 !== 0 &&
              'lg:col-span-2',
          )}
        >
          <img
            src={benefit.imgPath}
            alt={benefit.description}
            className="size-12 object-cover sm:size-16"
          />
          <p className="min-h-16 content-center text-sm">
            {benefit.description}
          </p>
        </Card>
      ))}
    </div>
  );
};
