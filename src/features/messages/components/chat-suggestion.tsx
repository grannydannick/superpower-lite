import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export const ChatSuggestion = ({
  suggestion,
  onClick,
  className,
  disableEnterAnimation = false,
}: {
  suggestion: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disableEnterAnimation?: boolean;
}) => {
  return (
    <Button
      variant="outline"
      className={cn(
        'group flex h-auto min-h-12 items-center justify-center rounded-2xl border border-zinc-200 px-4 py-2 text-center shadow-lg shadow-black/5 outline-none transition-all duration-300 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring',
        !disableEnterAnimation && 'animate-in fade-in slide-in-from-bottom-2',
        className,
      )}
      onClick={onClick}
    >
      <Body2 className="line-clamp-2 text-balance p-0 text-secondary transition-all duration-200 group-hover:text-zinc-700">
        {suggestion}
      </Body2>
    </Button>
  );
};
