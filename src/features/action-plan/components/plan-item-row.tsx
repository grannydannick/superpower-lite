import { format } from 'date-fns';
import { CalendarIcon, Dot, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { useProducts } from '@/features/action-plan/api/get-products';
import { ActionPlanBiomarkerRow } from '@/features/action-plan/components/data-view';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { useServices } from '@/features/services/api/get-services';
import { cn } from '@/lib/utils';
import { HealthcareService, PlanGoalItem, Product } from '@/types/api';

export type ActionPlanItemRowProps = {
  item: PlanGoalItem;
  goalId: string;
};

export function ActionPlanItemRow(
  props: ActionPlanItemRowProps,
): JSX.Element | null {
  const { item, goalId } = props;
  const { isAdmin, deleteGoalItem } = usePlan((s) => s);
  const biomarkersQuery = useBiomarkers();
  const servicesQuery = useServices();
  const productsQuery = useProducts();

  if (
    biomarkersQuery.isLoading ||
    servicesQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return <Skeleton className="h-[96px] w-full rounded-[20px]" />;
  }

  switch (props.item.itemType) {
    case 'PRODUCT': {
      const product = productsQuery.data?.products.find(
        (product) => product.id === item.itemId,
      );
      return product ? (
        <div className="flex w-full items-center justify-center gap-4">
          <ActionPlanProductRow
            product={product}
            goalItem={item}
            goalId={goalId}
          />
          {isAdmin && (
            <div
              role="presentation"
              className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full shadow-md"
              onClick={() => deleteGoalItem(goalId, product.id)}
            >
              <Trash2 width={20} height={20} className="text-pink-700" />
            </div>
          )}
        </div>
      ) : null;
    }
    case 'SERVICE': {
      const service = servicesQuery.data?.services.find(
        (service) => service.id === item.itemId,
      );
      return service ? (
        <div className="flex w-full items-center justify-center gap-4">
          <ActionPlanServiceRow
            service={service}
            goalItem={item}
            goalId={goalId}
          />
          {isAdmin && (
            <div
              role="presentation"
              className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full shadow-md"
              onClick={() => deleteGoalItem(goalId, service.id)}
            >
              <Trash2 width={20} height={20} className="text-pink-700" />
            </div>
          )}
        </div>
      ) : null;
    }
    case 'BIOMARKER': {
      const biomarker = biomarkersQuery.data?.biomarkers.find(
        (biomarker) => biomarker.id === item.itemId,
      );
      return biomarker ? (
        <div className="flex w-full flex-1 items-center justify-center gap-4">
          <ActionPlanBiomarkerRow biomarker={biomarker} />
          {isAdmin && (
            <div
              role="presentation"
              className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full shadow-md"
              onClick={() => deleteGoalItem(goalId, biomarker.id)}
            >
              <Trash2 width={20} height={20} className="text-pink-700" />
            </div>
          )}
        </div>
      ) : null;
    }
    default:
      return null;
  }
}

interface ActionPlanProductRowInterface {
  product: Product;
  goalItem: PlanGoalItem;
  goalId: string;
}

function ActionPlanProductRow({
  product,
  goalItem,
  goalId,
}: ActionPlanProductRowInterface): JSX.Element {
  const { isAdmin, changeGoalItemDescription, updateActionPlan } = usePlan(
    (s) => s,
  );
  const debouncedInstructions = useDebouncedCallback(async (value: string) => {
    changeGoalItemDescription(goalId, goalItem, value);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  return (
    <div
      role="presentation"
      className={cn(
        `flex flex-row space-x-6 items-center bg-zinc-50 transition rounded-[20px] p-3 h-[96px] w-full`,
        !isAdmin ? 'cursor-pointer' : '',
      )}
      onClick={() => !isAdmin && window.open(product.url, '_blank')}
    >
      <img
        alt={product.name}
        src={product.image}
        className="size-[72px] rounded-[8px] bg-white object-cover object-center"
      />
      <div className="flex flex-1 flex-col gap-1">
        <Body1>{product.name}</Body1>
        <Input
          className={cn(
            ACTION_PLAN_INPUT_STYLE,
            'placeholder:italic italic text-base placeholder:text-base text-zinc-500 bg-zinc-50 disabled:bg-zinc-50',
          )}
          placeholder={
            !isAdmin
              ? 'Clinician will add note here.'
              : 'Please write short instructions'
          }
          maxLength={75}
          disabled={!isAdmin}
          defaultValue={goalItem.description}
          onChange={(e) => debouncedInstructions(e.target.value)}
        />
      </div>
    </div>
  );
}

interface ActionPlanServiceRowInterface {
  service: HealthcareService;
  goalItem: PlanGoalItem;
  goalId: string;
}

function ActionPlanServiceRow({
  service,
  goalId,
  goalItem,
}: ActionPlanServiceRowInterface): JSX.Element {
  const { isAdmin, changeGoalItemDescription, updateActionPlan } = usePlan(
    (s) => s,
  );

  const debouncedInstructions = useDebouncedCallback(async (value: string) => {
    changeGoalItemDescription(goalId, goalItem, value);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  return (
    <div className="flex h-[96px] w-full items-center justify-between rounded-[20px] bg-zinc-50 p-3 transition">
      <div className="flex w-full items-center space-x-6">
        <img
          alt={service.name}
          src={service.image}
          className="size-[72px] rounded-[8px] bg-white object-cover object-center"
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex">
            <Body1 className="line-clamp-1">{service.name}</Body1>
            {!isAdmin && goalItem.timestamp && (
              <>
                <Dot color="#A1A1AA" className="hidden md:block" />
                {goalItem.timestamp && (
                  <Body1 className="hidden text-zinc-400 md:block">
                    By {format(new Date(goalItem.timestamp), 'PP')}
                  </Body1>
                )}
              </>
            )}
          </div>
          <Input
            className={cn(
              ACTION_PLAN_INPUT_STYLE,
              'italic placeholder:italic text-base placeholder:text-base text-zinc-500 bg-zinc-50 disabled:bg-zinc-50',
            )}
            placeholder={
              !isAdmin
                ? 'Clinician will add note here.'
                : 'Please write short instructions'
            }
            maxLength={75}
            disabled={!isAdmin}
            defaultValue={goalItem.description}
            onChange={(e) => debouncedInstructions(e.target.value)}
          />
        </div>
      </div>
      {isAdmin && (
        <ActionPlanItemDatePicker goalItem={goalItem} goalId={goalId} />
      )}
    </div>
  );
}

interface ActionPlanItemDatePickerInterface {
  goalItem: PlanGoalItem;
  goalId: string;
}

function ActionPlanItemDatePicker({
  goalItem,
  goalId,
}: ActionPlanItemDatePickerInterface) {
  const [date, setDate] = useState<Date>();
  const { isAdmin, changeItemDeadline } = usePlan((s) => s);

  useEffect(() => {
    if (goalItem.timestamp) {
      setDate(new Date(goalItem.timestamp));
    }
  }, []);

  useEffect(() => {
    if (date) {
      changeItemDeadline(goalId, goalItem, date.toISOString());
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal bg-zinc-50 ml-8 h-[52px] p-3 w-auto whitespace-nowrap disabled:opacity-1 text-sm',
            !date && 'text-muted-foreground',
          )}
          disabled={!isAdmin}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? (
            `Book before ${format(date, 'PP')}`
          ) : (
            <span>Choose Deadline</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
