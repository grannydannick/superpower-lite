import { X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';

export function ClinicianNoteHeader(): React.ReactNode {
  const { isAdmin, published, updateActionPlan, isUpdating, updateIsAdmin } =
    usePlan((s) => s);
  const { data: user } = useUser();
  const navigate = useNavigate();
  return (
    <div className="flex w-full justify-between p-5 md:p-7">
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
        <div className="flex items-center gap-3">
          <Button
            className="rounded-[12px] bg-white px-6 py-3 text-black shadow-md hover:bg-white"
            onClick={() => updateActionPlan()}
          >
            {isUpdating ? <Spinner variant="primary" /> : 'Save'}
          </Button>
          <div className="flex items-center gap-2 rounded-[12px] bg-white px-4 py-3 shadow-md">
            <p className="text-sm">Preview</p>
            <Switch
              checked={!isAdmin}
              onCheckedChange={() => updateIsAdmin(!isAdmin)}
            />
          </div>
          {!published && (
            <Button
              className="rounded-[12px] bg-black px-6 py-3 text-white shadow-md"
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
