import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export const ChatSuggestion = ({
  suggestion,
  onClick,
  className,
}: {
  suggestion: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        'group rounded-2xl lg:max-w-40 h-full flex border border-zinc-200 px-4 py-2 text-left transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 hover:bg-zinc-100',
        className,
      )}
      onClick={onClick}
    >
      <Body2 className="text-zinc-400 transition-all duration-200 group-hover:text-zinc-700">
        {suggestion}
      </Body2>
    </button>
  );
};
