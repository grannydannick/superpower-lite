import { useEffect, useRef, useState } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { Spinner } from '../ui/spinner';

const CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed';
const CHECKOUT_SESSION_FAILED = 'checkout.session.failed';
const CHECKOUT_SESSION_ERROR = 'checkout.session.error';
const CHECKOUT_SESSION_PAYMENT_FAILED = 'payment_intent.payment_failed';

interface FlexHSAFSAModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string | null;
  loading: boolean;
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
}

export const FlexHSAFSAModal = ({
  isOpen,
  onClose,
  checkoutUrl,
  loading,
  onPaymentSuccess,
  onPaymentError,
}: FlexHSAFSAModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const eventType = event.data.event_type;
      switch (eventType) {
        case CHECKOUT_SESSION_COMPLETED:
          onPaymentSuccess(event.data);
          break;
        case CHECKOUT_SESSION_FAILED:
        case CHECKOUT_SESSION_ERROR:
        case CHECKOUT_SESSION_PAYMENT_FAILED:
          onPaymentError(event.data);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onPaymentSuccess, onPaymentError]);

  // Defer iframe rendering to improve perceived performance on Safari - wait one frame to allow modal animation to start before loading iframe
  useEffect(() => {
    if (isOpen && checkoutUrl && !loading) {
      requestAnimationFrame(() => {
        setShouldRenderIframe(true);
      });
    } else {
      setShouldRenderIframe(false);
    }
  }, [isOpen, checkoutUrl, loading]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="size-full max-h-[80vh] max-w-[80vw] md:max-h-[90vh] md:max-w-[70vw] p-0">
        {loading || !checkoutUrl || !shouldRenderIframe ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : (
          <div className="relative size-full">
            <iframe
              ref={iframeRef}
              src={checkoutUrl}
              allow="payment *; publickey-credentials-get *"
              className="size-full"
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              title="Flex HSA/FSA Checkout"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
