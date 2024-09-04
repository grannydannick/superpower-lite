import { X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';

export function ClinicianNoteHeader(): JSX.Element {
  const { isAdmin, published } = usePlan((s) => s);
  const { data: user } = useUser();
  return (
    <div className="flex w-full justify-between p-5 md:p-7">
      <div className="flex items-center justify-center gap-[16px]">
        <Button
          className="size-[44px] rounded-full bg-white p-0 shadow-[0_32px_64px_0_rgba(212,212,212,0.5)] hover:bg-white"
          // onClick={onClose}
        >
          <X width="16px" height="16px" color="#52525B" />
        </Button>
        <div>
          <h1 className="text-sm">
            For: {user?.firstName} {user?.lastName}
          </h1>
          {/*<p className="text-xs text-[#A1A1AA]">*/}
          {/*  Saved{' '}*/}
          {/*  {formatDistance(new Date(savedTime), new Date(), {*/}
          {/*    addSuffix: true,*/}
          {/*  })}*/}
          {/*</p>*/}
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-[12px]">
          <Button
            className="rounded-[12px] bg-white px-[24px] py-[12px] text-black shadow-[0_32px_64px_0_rgba(212,212,212,0.5)] hover:bg-white"
            // onClick={() => onSubmit(actionPlan)}
          >
            Save
            {/*{isLoading ? (*/}
            {/*  <Loader2 className="w-4 animate-spin stroke-black text-black" />*/}
            {/*) : (*/}
            {/*  statusSave*/}
            {/*)}*/}
          </Button>
          {/*<div className="bg-white py-[12px] px-[16px] h-[40px] shadow-[0_32px_64px_0_rgba(212,212,212,0.5)] hover:bg-white rounded-[12px] text-black flex gap-[10px]">*/}
          {/*  <p className="text-sm">Preview</p>*/}
          {/*  <Switch />*/}
          {/*</div>*/}
          {!published && (
            <Button
              className="rounded-[12px] bg-black px-[24px]  py-[12px] text-white shadow-[0_32px_64px_0_rgba(212,212,212,0.5)]"
              // onClick={() => onSubmit(actionPlan, true)}
            >
              {/*{isLoading ? (*/}
              {/*  <Loader2 className="w-4 animate-spin stroke-white text-white" />*/}
              {/*) : (*/}
              {/*  statusPublish*/}
              {/*)}*/}
              Publish
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
