import { format } from 'date-fns';
import { Dot, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { usePlans } from '@/features/action-plan/api/get-plans';
import { ClinicianNoteDatePicker } from '@/features/action-plan/components/note-date-picker';
import { ClinicianNoteHeader } from '@/features/action-plan/components/note-header';
import { ClinicianNotePopover } from '@/features/action-plan/components/note-popover';
import { ActionPlanItemRow } from '@/features/action-plan/components/plan-item-row';
import {
  PlanStoreProvider,
  usePlan,
} from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface ClinicianNoteProps {
  orderId: string | undefined;
}

export const ClinicianNote = ({ orderId }: ClinicianNoteProps) => {
  const { data: user } = useUser();
  const getPlansQuery = usePlans({});

  if (getPlansQuery.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (!getPlansQuery.data) return <></>;

  const specificPlan = getPlansQuery.data.actionPlans.find(
    (actionPlan) => actionPlan.orderId === orderId,
  );

  if (!specificPlan) return <></>;

  return (
    <PlanStoreProvider
      initialPlan={specificPlan}
      isAdmin={Boolean(user?.adminActor)}
    >
      <ClinicianNoteConsumer />
    </PlanStoreProvider>
  );
};

const ClinicianNoteConsumer = () => {
  const [selectedSection, setSelectedSection] = useState('0');
  const {
    goals,
    timestamp,
    title,
    isAdmin,
    changeTitle,
    description,
    changeDescription,
    deleteGoal,
    addGoal,
    changeGoalDescription,
    changeGoalTitle,
  } = usePlan((s) => s);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-dot-zinc-400/[0.4]">
      <ClinicianNoteHeader />
      <div className="flex w-full flex-col items-center p-5">
        <div className="fixed left-[6.5%] top-60 hidden 2xl:block">
          <ul className="flex flex-col gap-3 font-[14px] text-[#A1A1AA]">
            {goals.map((goal, index) => (
              <li key={index} className="relative">
                {selectedSection === String(index) && (
                  <Dot color="#18181B" className="absolute -left-9" />
                )}
                <a
                  href={`#${index}`}
                  onClick={() => setSelectedSection(String(index))}
                  className={cn(
                    selectedSection === String(index) ? 'text-[#18181B]' : '',
                  )}
                >
                  Goal {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/*{(!isEditable && actionPlan?.videoFileId) || isEditable ? (*/}
        {/*  <AsyncVideoConsult*/}
        {/*    orderId={actionPlan?.orderId}*/}
        {/*    className="mt-[24px]"*/}
        {/*    fileId={actionPlan?.videoFileId}*/}
        {/*    mode={isEditable ? 'admin' : 'user'}*/}
        {/*    onUploaded={onVideoUploadComplete}*/}
        {/*    onDeleted={onVideoDelete}*/}
        {/*  />*/}
        {/*) : null}*/}
        <div
          className={
            'mx-auto mb-10 mt-[16px] w-full max-w-[1000px] rounded-3xl bg-white p-8 md:mt-[16px] md:p-20'
          }
          style={{ boxShadow: '0px 60px 60px 0px rgba(212, 212, 212, 0.25)' }}
        >
          <div>
            <p className="mb-3 text-[#A1A1AA]">
              {format(new Date(timestamp ?? Date.now()), 'PP')}
            </p>
            <Input
              type="text"
              placeholder="Title"
              className="border-0 p-0 text-3xl placeholder:text-3xl placeholder:text-[#A1A1AA] disabled:cursor-auto disabled:bg-white disabled:opacity-10"
              value={title}
              onChange={(e) => changeTitle(e.target.value)}
              disabled={!isAdmin}
            />
            <Textarea
              placeholder="Summary"
              className="mt-6 border-0 p-0 placeholder:text-[#A1A1AA] disabled:cursor-auto disabled:bg-white"
              value={description}
              onChange={(e) => changeDescription(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <div className="flex flex-col gap-[64px] pt-16">
              {goals.map((goal, index) => (
                <div
                  id={String(index)}
                  className="relative flex w-full"
                  key={goal.id}
                >
                  <div className="w-full border-b pt-8">
                    <ClinicianNoteDatePicker
                      date={{
                        from: new Date(goal.from),
                        to: new Date(goal.to),
                      }}
                      goalIndex={index}
                    />
                    <div className="flex flex-row items-center">
                      <h4 className="mr-4 whitespace-nowrap text-3xl">
                        Goal {index + 1}:
                      </h4>
                      <Input
                        type="text"
                        placeholder="Improve heart health"
                        className="border-0 p-0 text-3xl placeholder:text-3xl placeholder:text-[#A1A1AA] disabled:cursor-auto disabled:bg-white"
                        value={goal.title}
                        onChange={(e) => changeGoalTitle(e.target.value, index)}
                        disabled={!isAdmin}
                      />
                    </div>
                    <Textarea
                      placeholder="During our recent meeting, we discussed your health goals..."
                      className="mt-6 resize-none border-0 p-0 placeholder:text-base placeholder:text-[#A1A1AA] disabled:cursor-auto disabled:bg-white"
                      value={goal.description}
                      onChange={(e) =>
                        changeGoalDescription(e.target.value, index)
                      }
                      disabled={!isAdmin}
                    />
                    {/*TODO: add drag & drop / delete functionality */}
                    <div className="flex flex-col gap-[24px] py-[24px]">
                      {goal.goalItems.map((goalItem) => (
                        <ActionPlanItemRow
                          key={goalItem.itemId}
                          goalIndex={index}
                          item={goalItem}
                          getStartedDisabled={true}
                        />
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="my-10">
                        <ClinicianNotePopover goalIndex={index} />
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div
                      role="presentation"
                      className="absolute right-[-160px] top-[50px] flex size-[40px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_32px_64px_0_rgba(212,212,212,0.5)]"
                      onClick={() => deleteGoal(index)}
                    >
                      <Trash2 width={20} height={20} color="#B90090" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="my-6">
                <Button variant="ghost" className="contents" onClick={addGoal}>
                  + Add goal
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
