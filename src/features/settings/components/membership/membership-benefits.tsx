import { Card } from '@/components/ui/card';
import { MembershipBenefit } from '@/features/settings/types/membership';

export const MembershipBenefits = (props: {
  benefits: MembershipBenefit[];
}): JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {props.benefits.map((benefit, idx) => (
        <Card
          key={idx}
          className="flex flex-row items-center space-x-4 bg-[#F7F7F7] p-4"
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
