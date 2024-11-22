import { Copy } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAffiliateLinks } from '@/features/affiliate/api';

export const CopyLinkInput = () => {
  const { data, isLoading, isError } = useAffiliateLinks();
  const [copied, setCopied] = useState(false);

  if (isError || !data?.links?.length) {
    return null;
  }

  const link = data.links[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <Input type="text" value={link} readOnly />

      <Button
        onClick={handleCopy}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            {!copied && <Copy className="mr-2 size-5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </>
        )}
      </Button>
    </div>
  );
};
