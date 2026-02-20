import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useSequence } from '../../../../hooks/use-screen-sequence';

type BackButtonProps = {
  className?: string;
};

export const BackButton = ({ className }: BackButtonProps) => {
  const { back } = useSequence();

  return (
    <button
      type="button"
      onClick={back}
      className={cn(
        'group flex items-center gap-1 self-start text-zinc-500 transition-colors hover:text-zinc-700',
        className,
      )}
      aria-label="Go back"
    >
      <ChevronLeft className="-mt-0.5 size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span className="text-sm">Back</span>
    </button>
  );
};
