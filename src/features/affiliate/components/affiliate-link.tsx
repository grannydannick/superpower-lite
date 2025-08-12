import { Card } from '@/components/ui/card';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { cn } from '@/lib/utils';

export function AffiliateLink(): JSX.Element {
  const { data, isLoading } = useAffiliateLinks();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const { links } = data || { links: [] };

  return (
    <Card>
      <div className="relative flex flex-col gap-2 p-6 md:flex-row md:items-center md:gap-4 md:p-12">
        <h3 className="pr-8 text-base text-primary md:pr-0 lg:text-xl">
          Share referral link
        </h3>
        <Separator orientation="vertical" className="hidden h-10 md:block" />
        <div
          className={cn(
            'flex flex-row items-center gap-2 lg:text-xl',
            links.length > 0 ? '' : 'cursor-auto',
          )}
          role="presentation"
        >
          <Body1 className="line-clamp-2 w-full flex-1 text-vermillion-900">
            {/* Leave more space to show full link */}
            {links[0]?.replace('https://', '') || 'On request'}
          </Body1>
          {links.length > 0 && (
            <CopyToClipboard
              link={links[0]}
              className="absolute right-4 top-4 md:static"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
