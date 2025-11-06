import { H4 } from '@/components/ui/typography';

import {
  AmericanExpressIcon,
  HSAFSAIcon,
  MasterCardIcon,
  VisaIcon,
} from '../../../../components/icons';

const AVAILABLE_PAYMENT_METHODS = [
  { icon: <AmericanExpressIcon />, key: 'american-express' },
  { icon: <VisaIcon />, key: 'visa' },
  { icon: <MasterCardIcon />, key: 'mastercard' },
  { icon: <HSAFSAIcon />, key: 'hsa-fsa' },
];

export const PaymentDetails = ({
  titleSm = 'Card',
  titleMd = 'Card',
}: {
  titleSm?: string;
  titleMd?: string;
}) => {
  return (
    <div className="mb-6 flex flex-row justify-between gap-2 md:mb-0 md:gap-4">
      <H4 className="text-zinc-900">
        <span className="md:hidden">{titleSm}</span>
        <span className="hidden md:inline">{titleMd}</span>
      </H4>
      <div className="flex gap-2">
        {AVAILABLE_PAYMENT_METHODS.map((pm) => (
          <div key={pm.key}>{pm.icon}</div>
        ))}
      </div>
    </div>
  );
};
