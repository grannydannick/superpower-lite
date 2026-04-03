import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { toast } from '@/components/ui/sonner';
import {
  clearPendingReport,
  getPendingReport,
} from '@/features/wearables/hooks/use-wearable-report';

export function WearableReportToast() {
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const pending = getPendingReport();
    if (pending == null) return;

    toast.success(`Your ${pending.providerName} insights report is ready`, {
      action: {
        label: 'View report →',
        onClick: () => {
          clearPendingReport();
          void navigate({ to: `/concierge/${pending.threadId}` });
        },
      },
      duration: 10000,
    });
  }, [navigate]);

  return null;
}
