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
        'group flex rounded-2xl border border-zinc-200 px-4 py-2 text-left shadow-lg shadow-black/5 outline-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring lg:max-w-44',
        className,
      )}
      onClick={onClick}
    >
      <Body2 className="text-balance p-0 text-secondary transition-all duration-200 group-hover:text-zinc-700">
        {suggestion}
      </Body2>
    </button>
  );
};
