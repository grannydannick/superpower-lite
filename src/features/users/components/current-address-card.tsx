import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { AddressSelect } from '@/features/users/components/address-select';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface CurrentAddressCardProps {
  className?: string;
  disableEdit?: boolean;
}

export const CurrentAddressCard = ({
  className,
  disableEdit,
}: CurrentAddressCardProps) => {
  const { data: user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const address = user?.primaryAddress;

  if (isEditing && !disableEdit) {
    return (
      <AddressSelect
        closeBtn={
          <Button
            variant="ghost"
            size="icon"
            className="p-0"
            onClick={() => setIsEditing(false)}
          >
            <Body3 className="flex items-center text-zinc-500">Go back</Body3>
          </Button>
        }
      />
    );
  }

  return (
    <div
      className={cn(
        'relative w-full space-y-3 rounded-2xl border border-zinc-200 bg-white px-8 py-6',
        className,
      )}
    >
      <div className="flex items-center">
        <Body2 className="text-zinc-400">Current Address</Body2>
      </div>
      {!disableEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-0 rounded-full p-3 hover:bg-zinc-200/50"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-4 cursor-pointer text-zinc-500" />
        </Button>
      )}

      {address ? (
        <div>
          <Body1 className="text-zinc-700">
            {user?.firstName} {user?.lastName}
          </Body1>
          <Body1 className="text-zinc-700">{address?.line.join(' ')}</Body1>
          <Body1 className="text-zinc-700">{address?.city}</Body1>
          <Body1 className="text-zinc-700">
            {address?.state} {address?.postalCode}, US
          </Body1>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Body1 className="text-primary">Primary address not found</Body1>
          {disableEdit && <CurrentAddressEditSuggestion />}
        </div>
      )}
    </div>
  );
};

export const CurrentAddressEditSuggestion = () => {
  const location = useLocation();

  return location.pathname.includes('onboarding') ? (
    <span>
      Contact concierge at{' '}
      <a
        className="text-vermillion-900 underline"
        href="mailto:concierge@superpower.com"
      >
        concierge@superpower.com
      </a>
    </span>
  ) : (
    <span>
      Add in&nbsp;
      <a className="text-vermillion-900 underline" href="/settings">
        settings
      </a>
    </span>
  );
};
