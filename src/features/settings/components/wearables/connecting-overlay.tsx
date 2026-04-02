import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function ConnectingOverlay({
  providerName,
  onDismiss,
}: {
  providerName: string;
  onDismiss: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-[4px] animate-in fade-in">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <Spinner size="lg" variant="light" />
        <h3 className="text-lg font-semibold text-white">
          Connecting {providerName}
        </h3>
        <p className="max-w-xs text-sm text-white/70">
          Finish connecting your device in the opened window. This overlay will
          close automatically.
        </p>
      </div>
      <Button
        variant="ghost"
        size="small"
        className="mt-8 text-xs text-white/50 hover:text-white/80"
        onClick={onDismiss}
      >
        Window didn&apos;t open? Click here to dismiss
      </Button>
    </div>,
    document.body,
  );
}
