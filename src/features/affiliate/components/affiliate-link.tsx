import { CopyIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { cn } from '@/lib/utils';

export function AffiliateLink(): JSX.Element {
  const { data, isLoading } = useAffiliateLinks();

  const onClick = async (copyText: string | undefined): Promise<void> => {
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
  };

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
      <div className="flex flex-row items-center justify-between gap-4 p-12">
        <div className="flex flex-row items-center">
          <h3 className="border-r pr-8 text-base text-primary lg:text-xl">
            Share referral link
          </h3>
          <a
            href="#"
            className={cn(
              'flex flex-row items-center space-x-2 pl-8 text-base text-[#FC5F2B] lg:text-xl',
              links.length > 0 ? '' : 'cursor-auto',
            )}
            onClick={() => onClick(links[0])}
          >
            <span>{links[0] || 'On request'}</span>
            {links.length > 0 && <CopyIcon />}
          </a>
        </div>
      </div>
    </Card>
  );
}
