import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import { useBiomarkerSummary } from '@/features/data/api/get-biomarker-summary';
import { useTypingAnimation } from '@/hooks/use-typing-animation';

export const PersonalizedExplanation = ({ category }: { category: string }) => {
  const { data, isLoading } = useBiomarkerSummary({ category });

  const formattedSummary = data?.summary.replaceAll('•', '-');
  const displayedText = useTypingAnimation(formattedSummary);

  const showSkeleton = isLoading && !displayedText;
  const showText = displayedText || (data && !isLoading);

  return (
    <div className="space-y-4">
      {showSkeleton && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      {showText && (
        <Body2 className="text-secondary">
          <span className="whitespace-pre-wrap">{displayedText}</span>
        </Body2>
      )}
    </div>
  );
};
