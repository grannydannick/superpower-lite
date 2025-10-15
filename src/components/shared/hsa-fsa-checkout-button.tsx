import { CircleCheckBig } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
// eslint-disable-next-line import/no-restricted-paths
import { useCreateFlexCheckoutSession } from '@/features/settings/api/create-flex-checkout-session';

import { Body1 } from '../ui/typography/body1/body1';

import { FlexHSAFSAModal } from './flex-hsa-fsa-modal';

export interface HSAFSACheckoutButtonClickEvent {
  resolve: () => void;
}

interface HSAFSACheckoutButtonProps {
  onPaymentSuccess: (paymentData: any) => Promise<void>;
  onClick?: (event: HSAFSACheckoutButtonClickEvent) => any;
  disabled?: boolean;
  state: string;
  coupon?: string;
  email?: string;
  phone?: string;
}

export const HSAFSACheckoutButton = ({
  onPaymentSuccess,
  onClick,
  disabled = false,
  state,
  coupon,
  email,
  phone,
}: HSAFSACheckoutButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const createCheckoutSessionMutation = useCreateFlexCheckoutSession();
  const preconnectAdded = useRef(false);

  // Preconnect to Flex checkout on mount to improve performance
  useEffect(() => {
    if (!preconnectAdded.current) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://checkout.withflex.com';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      preconnectAdded.current = true;
    }
  }, []);

  const DEBOUNCE_MS = 2000;
  const handleButtonClick = async () => {
    if (disabled) return;

    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_MS) {
      return;
    }

    setLastClickTime(now);

    if (onClick) {
      let shouldContinue = false;
      const event: HSAFSACheckoutButtonClickEvent = {
        resolve: () => {
          shouldContinue = true;
        },
      };

      await onClick(event);

      if (!shouldContinue) {
        return;
      }
    }

    try {
      const checkoutSession = await createCheckoutSessionMutation.mutateAsync({
        data: {
          state,
          coupon,
          email,
          phone,
        },
      });

      setCheckoutUrl(checkoutSession.redirectUrl);
      setIsModalOpen(true);
    } catch (error) {
      // API will show toast if there is an error
      setIsModalOpen(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      setIsModalOpen(false);
      setCheckoutUrl(null);
      await onPaymentSuccess(paymentData);
    } catch (error) {
      toast.error(
        'Something went wrong. Please try again. Please checkout with credit card instead.',
      );
    }
  };

  const handlePaymentError = (error: any) => {
    toast.error(
      error ??
        'HSA/FSA payment failed. Please checkout with credit card instead.',
    );
    setIsModalOpen(false);
    setCheckoutUrl(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCheckoutUrl(null);
    createCheckoutSessionMutation.reset();
  };

  const isLoading = createCheckoutSessionMutation.isPending;

  return (
    <>
      <Button
        variant="outline"
        className={`mb-4 w-full bg-white`}
        onClick={handleButtonClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" variant="primary" className="mr-2" />
          </>
        ) : (
          <>
            <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
            <Body1 className="text-zinc-700">Pay with HSA/FSA</Body1>
          </>
        )}
      </Button>

      <FlexHSAFSAModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        checkoutUrl={checkoutUrl}
        loading={isLoading}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
};
