import { cva } from 'class-variance-authority';

// This card variants will be re-used in the whole app
export const cardVariants = cva(
  'flex aspect-[12/16] h-full rounded-2xl border border-white/10 bg-cover bg-center p-3 shadow-xl transition-all duration-500 ease-out',
  {
    variants: {
      type: {
        scoreCard: 'bg-[url("/cards/organic-orange.webp")]',
        ageCard: 'bg-[url("/cards/age-card.webp")]',
      },
    },
  },
);
