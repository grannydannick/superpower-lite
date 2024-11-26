import { X } from 'lucide-react';
import moment from 'moment/moment';
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Body1 } from '@/components/ui/typography';
import { usePlans } from '@/features/action-plan/api';

export const PlansModal = ({ children }: { children: ReactNode }) => {
  const plansQuery = usePlans();
  const navigate = useNavigate();

  const plans = plansQuery.data?.actionPlans;

  if (!plans) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="max-h-[90vh] overflow-y-scroll rounded-xl">
          <div className="flex flex-row items-center justify-between px-14 pb-6 pt-12">
            <DialogTitle>Plans</DialogTitle>
            <DialogClose>
              <X className="size-6 cursor-pointer p-1" />
            </DialogClose>
          </div>
          <Separator />
          <div className="space-y-4 px-12 pb-12 pt-6">
            {plans.length === 0 ? (
              <Body1 className="text-zinc-500">No plans available.</Body1>
            ) : null}
            {plans.map((p) => (
              <div
                className="flex items-center justify-between rounded-2xl bg-zinc-100 p-5"
                key={p.id}
              >
                <Body1>{moment(p.timestamp).format('DD MMMM')}</Body1>
                <DialogClose asChild>
                  <Button onClick={() => navigate(`/plans/${p.orderId}`)}>
                    Open
                  </Button>
                </DialogClose>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
