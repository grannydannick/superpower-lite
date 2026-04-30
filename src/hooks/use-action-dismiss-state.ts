import { useCallback, useState } from 'react';

export const useActionDismissState = (storageKey: string) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {
      // Ignore storage failures.
    }
  }, [storageKey]);

  return { isDismissed, dismiss };
};
