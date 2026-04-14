import { useEffect, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

export function useCountUp({
  end,
  duration = 1500,
  delay = 0,
  enabled = true,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(() => {
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(eased * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay, enabled]);

  return value;
}
