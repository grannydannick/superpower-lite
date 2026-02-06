import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { formatMoney } from '@/utils/format-money';

import { Detail } from './detail';

type PanelCTAButtonsProps = {
  price: number;
  isPending: boolean;
  onOrder: () => void;
  onSkip: () => void;
};

export const PanelCTAButtons = ({
  price,
  isPending,
  onOrder,
  onSkip,
}: PanelCTAButtonsProps) => (
  <Detail.CTAGroup>
    <Button
      onClick={onOrder}
      variant="vermillion"
      className="w-full"
      disabled={isPending}
    >
      {isPending ? (
        <TransactionSpinner />
      ) : (
        <>
          Order now{' '}
          <span className="ml-2 opacity-80">{formatMoney(price)}</span>
        </>
      )}
    </Button>
    <Button
      onClick={onSkip}
      variant="outline"
      className="w-full"
      disabled={isPending}
    >
      I&apos;m not interested
    </Button>
  </Detail.CTAGroup>
);
