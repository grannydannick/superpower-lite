import { ChevronRight } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import { env } from '@/config/env';

export const GiftActionCard = () => {
  return (
    <button
      type="button"
      onClick={() =>
        window.open(
          `${env.WEBSITE_URL}/gifting`,
          '_blank',
          'noopener,noreferrer',
        )
      }
      className="group relative flex w-full items-center gap-3 rounded-[20px] px-4 py-2 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src="/gifting/present.webp"
          alt="Gift"
          className="size-12 shrink-0 object-contain"
          style={{
            maskImage:
              'radial-gradient(ellipse 80% 80% at center, black 25%, #00000050 60%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 80% at center, black 25%, #00000050 60%, transparent 75%)',
          }}
        />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">Send your gift</Body1>
          <Body2 className="text-zinc-600">Enter recipient details</Body2>
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </div>
    </button>
  );
};
