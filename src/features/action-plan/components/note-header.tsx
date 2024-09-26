import { format } from 'date-fns';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Body2 } from '@/components/ui/typography';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function ClinicianNoteHeader(): React.ReactNode {
  const {
    isAdmin,
    published,
    updateActionPlan,
    isUpdating,
    updateIsAdmin,
    updatedAt,
  } = usePlan((s) => s);
  const { data: user } = useUser();
  const navigate = useNavigate();
  const [isBlurred, setIsBlurred] = useState(false);

  // Scroll event listener to toggle blur effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsBlurred(scrollTop > 50); // Adjust the scroll value threshold as needed
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        'sticky z-10 left-0 top-0 flex w-full justify-between p-5 md:p-7 transition duration-300',
        isBlurred ? 'bg-opacity-40 bg-white backdrop-blur rounded-b-2xl' : null,
      )}
    >
      <div className="flex items-center justify-center gap-4">
        <Button
          className="size-[44px] rounded-full bg-white p-0 shadow-xl hover:bg-white"
          onClick={() => navigate('/', { replace: true })}
        >
          <X width="16px" height="16px" color="#52525B" />
        </Button>
        <div>
          <h1 className="text-sm">
            For: {user?.firstName} {user?.lastName}
          </h1>
        </div>
      </div>
      {user?.adminActor ? (
        <div className="flex items-center gap-4">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Spinner variant="primary" />
              <Body2>Saving...</Body2>
            </div>
          ) : (
            <Body2 className="hidden sm:block">
              Last updated: {format(new Date(updatedAt), 'h:mm a')}
            </Body2>
          )}
          <div className="flex items-center gap-2 rounded-[12px] bg-white px-4 py-3 shadow-md">
            <p className="text-sm">Preview</p>
            <Switch
              checked={!isAdmin}
              onCheckedChange={() => updateIsAdmin(!isAdmin)}
            />
          </div>
          {!published && (
            <Button
              className="min-w-[103px] rounded-[12px] bg-black px-6 py-3 text-white shadow-md"
              onClick={() => updateActionPlan(true)}
            >
              {isUpdating ? <Spinner variant="primary" /> : 'Publish'}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
