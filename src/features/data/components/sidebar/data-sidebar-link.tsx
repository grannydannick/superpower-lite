import { Heart } from 'lucide-react';

import { MiniScoreChart } from '@/components/ui/charts/mini-score-chart/mini-score-chart';
import { Link } from '@/components/ui/link';
import type { DataSummaryCategory } from '@/features/data/types/data-api';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import type { CategoryValue } from '@/types/api';

const SUMMARY_CATEGORY: DataSummaryCategory = {
  id: 'summary',
  version: '',
  slug: 'summary',
  name: 'Summary',
  title: 'Summary',
  subtitle: '',
  shortDescription: '',
  description: '',
  content: null,
  metaTitle: null,
  metaDescription: null,
};

export { SUMMARY_CATEGORY };

export const DataSidebarLink = ({
  category,
  isActive,
  className,
}: {
  category: DataSummaryCategory;
  isActive: boolean;
  className?: string;
}) => {
  const { track } = useAnalytics();
  const isSummary = category.slug === 'summary';
  const link = !isSummary ? `/data?category=${category.slug}` : '/data';

  return (
    <Link
      to={link}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (!isSummary) {
          track('selected_health_category', {
            category_id: category.id,
            category_slug: category.slug,
            category_name: category.name,
            category,
          });
        }
      }}
      id={`selector-${category.slug}`}
      key={category.slug}
      className={cn(
        'relative z-[1] flex shrink-0 gap-2 self-start truncate rounded-full border border-transparent p-0.5 pr-3 transition-colors md:w-full lg:w-auto',
        isActive
          ? 'text-black'
          : 'group text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700',
        className,
      )}
    >
      {isSummary ? (
        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-200 p-1 text-zinc-400">
          <Heart className="size-full" />
        </div>
      ) : (
        <MiniScoreChart
          value={(category.score?.value ?? '-') as CategoryValue}
        />
      )}
      <span className="truncate">{category.title}</span>
    </Link>
  );
};
