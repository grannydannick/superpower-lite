import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatMoney } from '@/utils/format-money';

import { Detail } from './detail';
import { usePanelId, useUpsellPanelIds } from './panel-id-context';

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
}: PanelCTAButtonsProps) => {
  const panelId = usePanelId();
  const shownPanelIds = useUpsellPanelIds();
  const { track } = useAnalytics();

  const handleOrder = useCallback(() => {
    if (panelId) {
      track('upsell_detail_purchase_clicked', {
        panel_id: panelId,
        shown_panel_ids: shownPanelIds,
      });
    }
    onOrder();
  }, [panelId, shownPanelIds, track, onOrder]);

  const handleSkip = useCallback(() => {
    if (panelId) {
      track('upsell_detail_skipped', {
        panel_id: panelId,
        shown_panel_ids: shownPanelIds,
      });
    }
    onSkip();
  }, [panelId, shownPanelIds, track, onSkip]);

  return (
    <Detail.CTAGroup>
      <Button
        onClick={handleOrder}
        variant="vermillion"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <TransactionSpinner />
        ) : (
          <>
            Buy now{' '}
            <span className="ml-2 opacity-80">{formatMoney(price)}</span>
          </>
        )}
      </Button>
      <Button
        onClick={handleSkip}
        variant="outline"
        className="w-full"
        disabled={isPending}
      >
        I&apos;m not interested
      </Button>
    </Detail.CTAGroup>
  );
};
