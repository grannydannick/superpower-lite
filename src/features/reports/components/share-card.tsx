import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

import type { ReportMetric } from '../types';

export function ShareButton({ metric }: { metric: ReportMetric }) {
  if (metric.status !== 'good' && metric.status !== 'healthy') return null;

  const handleShare = async () => {
    const text = `${metric.identity} — ${metric.value}${metric.unit} ${metric.label}. Powered by @superpowerhealth`;

    if (navigator.share != null) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="absolute right-5 top-14 z-20 flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg transition-colors hover:bg-white/20"
      aria-label="Share this insight"
    >
      <Share2 className="size-4 text-white/70" />
    </button>
  );
}
