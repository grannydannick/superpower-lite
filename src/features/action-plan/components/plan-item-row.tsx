import { format } from 'date-fns';
import { CalendarIcon, ChevronRight, Dot, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body1 } from '@/components/ui/typography';
import { useProducts } from '@/features/action-plan/api/get-products';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { BiomarkersDataTable } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-data-table';
import { useServices } from '@/features/services/api/get-services';
import { cn } from '@/lib/utils';
import { HealthcareServiceDialogContent } from '@/shared/components';
import {
  Biomarker,
  HealthcareService,
  PlanGoalItem,
  Product,
} from '@/types/api';

export type ActionPlanItemRowProps = {
  item: PlanGoalItem;
  goalIndex?: number;
};

export function ActionPlanItemRow(
  props: ActionPlanItemRowProps,
): JSX.Element | null {
  const { item, goalIndex } = props;
  const { isAdmin, deleteGoalItem } = usePlan((s) => s);
  const biomarkersQuery = useBiomarkers();
  const servicesQuery = useServices();
  const productsQuery = useProducts();

  switch (props.item.itemType) {
    case 'PRODUCT': {
      const product = productsQuery.data?.products.find(
        (product) => product.id === item.itemId,
      );

      return product ? (
        <div className="relative flex w-full items-center justify-center">
          <ActionPlanProductRow
            product={product}
            goalItem={item}
            goalIndex={goalIndex}
          />
          {isAdmin && typeof goalIndex === 'number' && (
            <div
              role="presentation"
              className="absolute right-[-40px] cursor-pointer"
              onClick={() => deleteGoalItem(product.id, goalIndex)}
            >
              <Trash2 width={20} height={20} color="#B90090" />
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
        <div className="relative flex w-full items-center justify-center">
          <ActionPlanServiceRow
            service={service}
            goalItem={item}
            goalIndex={goalIndex}
          />
          {isAdmin && typeof goalIndex === 'number' && (
            <div
              role="presentation"
              className="absolute right-[-40px] cursor-pointer"
              onClick={() => deleteGoalItem(service.id, goalIndex)}
            >
              <Trash2 width={20} height={20} color="#B90090" />
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
        <div className="relative flex w-full items-center justify-center">
          <ActionPlanBiomarkerRow item={biomarker} />
          {isAdmin && typeof goalIndex === 'number' && (
            <div
              role="presentation"
              className="absolute right-[-40px] cursor-pointer"
              onClick={() => deleteGoalItem(biomarker.id, goalIndex)}
            >
              <Trash2 width={20} height={20} color="#B90090" />
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
  goalIndex?: number;
}
function ActionPlanProductRow({
  product,
  goalItem,
  goalIndex,
}: ActionPlanProductRowInterface): JSX.Element {
  const { isAdmin, changeGoalItemDescription } = usePlan((s) => s);
  return (
    <div
      role="presentation"
      className={cn(
        `flex flex-row space-x-6 items-center bg-[#F7F7F7] transition rounded-[20px] p-3 h-[96px] w-full`,
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
            'w-full h-auto shadow-none border-none font-normal text-zinc-400 text-base placeholder:text-base placeholder:text-[#A1A1AA] placeholder:italic caret-[#FC5F2B] p-0 bg-[#F7F7F7] disabled:opacity-1 disabled:cursor-auto',
          )}
          placeholder={
            isAdmin
              ? 'Please write short instructions'
              : 'Clinician will add note here.'
          }
          maxLength={75}
          disabled={!isAdmin}
          value={goalItem.description}
          onChange={(e) =>
            typeof goalIndex === 'number' &&
            changeGoalItemDescription(goalItem, e.target.value, goalIndex)
          }
        />
      </div>
    </div>
  );
}

interface ActionPlanServiceRowInterface {
  service: HealthcareService;
  goalItem: PlanGoalItem;
  goalIndex?: number;
}
function ActionPlanServiceRow({
  service,
  goalIndex,
  goalItem,
}: ActionPlanServiceRowInterface): JSX.Element {
  const { isAdmin, changeGoalItemDescription } = usePlan((s) => s);
  return (
    <div className="flex h-[96px] w-full items-center justify-between rounded-[20px] bg-[#F7F7F7] p-3 transition">
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
            className="h-auto w-full truncate border-none bg-[#F7F7F7] p-0 text-sm font-normal text-zinc-400 caret-[#FC5F2B] shadow-none placeholder:text-sm placeholder:italic placeholder:text-zinc-400 disabled:cursor-auto disabled:opacity-50 md:text-base placeholder:md:text-base"
            placeholder={
              isAdmin
                ? 'Please write short instructions'
                : 'Clinician will add note here.'
            }
            maxLength={75}
            disabled={!isAdmin}
            value={goalItem.description}
            onChange={(e) =>
              typeof goalIndex === 'number' &&
              changeGoalItemDescription(goalItem, e.target.value, goalIndex)
            }
          />
        </div>
      </div>
      {isAdmin && (
        <ActionPlanItemDatePicker goalItem={goalItem} goalIndex={goalIndex} />
      )}
      {service.active && !isAdmin && (
        <Dialog>
          <DialogTrigger>
            <div className="hidden cursor-pointer gap-[3px] whitespace-nowrap text-sm text-[#A1A1AA] hover:text-[#FC5F2B] md:flex">
              <h5>Get Started</h5>
              <ChevronRight width={16} height={16} />
            </div>
          </DialogTrigger>
          <HealthcareServiceDialogContent healthcareService={service}>
            <Button>Have you changed me?</Button>
          </HealthcareServiceDialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ActionPlanBiomarkerRow({ item }: { item: Biomarker }) {
  return (
    <BiomarkersDataTable
      biomarkers={[item]}
      disableHeader={true}
      disableToolbar={true}
      cellClassName="bg-[#F7F7F7]"
    />
  );
}

interface ActionPlanItemDatePickerInterface {
  goalItem: PlanGoalItem;
  goalIndex?: number;
}

function ActionPlanItemDatePicker({
  goalItem,
  goalIndex,
}: ActionPlanItemDatePickerInterface) {
  const [date, setDate] = useState<Date>();
  const { isAdmin, changeItemDeadline } = usePlan((s) => s);

  useEffect(() => {
    if (goalItem.timestamp) {
      setDate(new Date(goalItem.timestamp));
    }
  }, []);

  useEffect(() => {
    if (date && typeof goalIndex === 'number') {
      changeItemDeadline(goalItem, date, goalIndex);
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal bg-[#F7F7F7] ml-8 h-[52px] p-3 w-auto whitespace-nowrap disabled:opacity-1',
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
