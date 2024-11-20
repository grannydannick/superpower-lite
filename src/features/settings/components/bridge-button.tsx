import {
  useBridgeModal,
  BridgeProvider,
  BridgeModal,
} from '@usebridge/elements-react';
import { ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { env } from '@/config/env';

type EligibilityType = 'HARD' | 'SOFT';

type BridgeButtonProps = {
  children: ReactNode;
  eligibilityType?: EligibilityType;
  serviceTypeId: string;
  dateOfService?: Date;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'medium' | 'small' | 'icon';
  callback?: () => void;
};

export const BridgeButton = ({ children, ...rest }: BridgeButtonProps) => {
  const bridgeConfig = {
    publishableKey: env.BRIDGE_PUBLISHABLE_KEY,
    endpoint: env.BRIDGE_ENDPOINT,
  };

  return (
    <BridgeProvider config={bridgeConfig}>
      <>
        <BridgeModal appElement="#root" />
        <BridgeButtonConsumer {...rest}>{children}</BridgeButtonConsumer>
      </>
    </BridgeProvider>
  );
};

const BridgeButtonConsumer = ({
  children,
  eligibilityType = 'SOFT',
  serviceTypeId,
  dateOfService = new Date(),
  className,
  variant = 'default',
  size = 'default',
  callback,
}: BridgeButtonProps) => {
  const bridge = useBridgeModal();

  const onClick = () => {
    switch (eligibilityType) {
      case 'SOFT':
        bridge
          .softEligibility({
            serviceTypeId: serviceTypeId,
            dateOfService: dateOfService,
          })
          .then((response) => {
            if (!response) {
              // If the response is null, the user canceled
              toast.warning('Soft eligibility check cancelled');
            } else if (response.providerEligibility.status !== 'ELIGIBLE') {
              // Patient's state/payer combination is not eligible
              toast.warning('Soft eligibility check - not eligible');
              callback && callback();
            } else if (!response.providerEligibility.providers.length) {
              // There are no Providers available
              toast.warning('Soft eligibility check - no providers available');
              callback && callback();
            } else {
              // The patient is eligible for coverage
              toast.success('Soft eligibility check - success, eligible.');
              callback && callback();
            }
          })
          .catch((err) => {
            console.error(err);
          });
        break;
      case 'HARD':
        bridge
          .hardEligibility({
            serviceTypeId,
            dateOfService,
          })
          .then((response) => {
            if (!response) {
              // If the response is null, the user canceled
              toast.warning('Hard eligibility check cancelled');
            } else if (response.serviceEligibility?.status !== 'ELIGIBLE') {
              // Patient's benefits are not valid
              toast.warning('Hard eligibility check - not eligible');
              callback && callback();
            } else if (!response.serviceEligibility?.providers.length) {
              // There are no Providers available
              toast.warning('Hard eligibility check - no providers available');
              callback && callback();
            } else {
              // The patient is eligible for coverage
              toast.success('Hard eligibility check - success, eligible.');
              callback && callback();
            }
          })
          .catch(() => {
            toast.error('Unexpected error');
          });
        break;
      default:
        console.error(
          `${eligibilityType} is not a valid eligibility check type.`,
        );
        break;
    }
  };

  return (
    <Button
      onClick={onClick}
      className={className}
      variant={variant}
      size={size}
      type="button"
    >
      {children}
    </Button>
  );
};
