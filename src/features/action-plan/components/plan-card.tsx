import { format } from 'date-fns';
import { ChevronDownIcon, ChevronRight, Dot, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  usePlanDates,
  usePlans,
  useProducts,
  useCreatePlan,
} from '@/features/action-plan/api';
import { ActionPlanCheckoutModal } from '@/features/action-plan/components/checkout-modal';
import { filterGoalsByItemType } from '@/features/action-plan/utils/filter-goals-by-item-type';
import { generateDummyPlan } from '@/features/action-plan/utils/generate-dummy-plan';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PlanGoal, PlanGoalItem } from '@/types/api';

export const PlanCard = () => {
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex items-center justify-between">
        <H2>Actions</H2>
        <ActionPlanDatePicker setOrderId={(orderId) => setOrderId(orderId)} />
      </div>
      <Card className="w-full space-y-12">
        <PlanCardContent orderId={orderId} />
        <PlanCardFooter orderId={orderId} />
      </Card>
    </div>
  );
};

const PlanCardFooter = ({ orderId }: { orderId?: string }) => {
  const { data: plansData } = usePlans({});
  const { data: user } = useUser();
  const navigate = useNavigate();
  const createPlanMutation = useCreatePlan({
    mutationConfig: {
      onSuccess: (data) => {
        navigate(`./plans/${data.actionPlan.orderId}`);
      },
    },
  });

  if (!orderId) {
    return <div className="px-6 pb-6 md:px-[72px] md:pb-[72px]" />;
  }

  const isAdmin = Boolean(user?.adminActor);
  const plans = plansData?.actionPlans;
  const dummyPlan = generateDummyPlan(orderId);

  const specificPlan = plans?.find((p) => p.orderId === orderId);

  const products = specificPlan
    ? filterGoalsByItemType('PRODUCT', specificPlan)
    : [];

  if (isAdmin) {
    return (
      <div className="flex w-full items-center justify-end space-x-4 px-6 pb-6 md:px-[72px] md:pb-[72px]">
        {!specificPlan ? (
          <Button
            className="w-full"
            onClick={() => createPlanMutation.mutate({ data: dummyPlan })}
          >
            {createPlanMutation.isPending ? <Spinner /> : 'Add your note'}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => navigate(`./plans/${orderId}`)}
          >
            Edit your note
          </Button>
        )}
      </div>
    );
  }

  if (!specificPlan || !specificPlan.published) {
    return <div className="px-[72px] pb-[72px]" />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-end gap-4 px-6 pb-6 md:px-[72px] md:pb-[72px] lg:flex-row">
      <Button
        className="w-full lg:w-auto"
        variant="outline"
        onClick={() => navigate(`./plans/${orderId}`)}
      >
        See Doctor’s Note
      </Button>
      {products.length === 0 ? (
        <Button
          className="w-full lg:w-auto"
          onClick={() => navigate('https://products.superpower.com/')}
        >
          Go to marketplace
        </Button>
      ) : (
        <ActionPlanCheckoutModal actionPlan={specificPlan} />
      )}
    </div>
  );
};

const PlanCardContent = ({ orderId }: { orderId?: string }) => {
  return (
    <div className="px-6 pt-6 md:px-[72px] md:pt-[72px]">
      <Tabs defaultValue="SERVICE">
        <TabsList className="flex w-full justify-start space-x-6 overflow-x-scroll rounded-none">
          <TabsTrigger value="PRODUCT" className="pb-1">
            Products
          </TabsTrigger>
          <TabsTrigger value="SERVICE" className="pb-1">
            Services
          </TabsTrigger>
          <TabsTrigger value="LIFESTYLE" disabled className="pb-1">
            <Lock className="mr-1.5 w-4" />
            Lifestyle
          </TabsTrigger>
        </TabsList>
        <hr />
        <ServicesTab orderId={orderId} />
        <ProductsTab orderId={orderId} />
      </Tabs>
    </div>
  );
};

const ActionPlanDatePicker = ({
  setOrderId,
}: {
  setOrderId: (orderId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const { data: planDatesData } = usePlanDates();
  const planDates = planDatesData?.availableDates;

  useEffect(() => {
    if (!planDates) return;

    // Only set the initial date if planDates is not empty
    if (planDates.length > 0) {
      setCurrentDate(new Date(planDates[0].timestamp));
      setOrderId(planDates[0].orderId);
    }
  }, [planDates]);

  // Render a disabled button if there are no plan dates
  if (planDates?.length === 0) return <h1>No dates available</h1>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal px-4 border h-10 rounded-2xl',
            !currentDate && 'text-muted-foreground',
          )}
        >
          {currentDate ? format(currentDate, 'PP') : <span>Pick a date</span>}
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-50 w-auto p-0">
        <Command>
          <CommandEmpty>Select Date</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {planDates?.map((option, index) => (
                <CommandItem
                  key={index}
                  value={new Date(option.timestamp).toISOString()}
                  onSelect={(currentValue) => {
                    /*
                    NB: upper case is neeeded because for some interesting
                    reason T and Z is transformed into t and z

                    so like you get:

                    2024-05-09t16:00:00.000z
                    instead of
                    2024-05-09T16:00:00.000Z

                    which brakes format()
                    */
                    setCurrentDate(new Date(currentValue.toUpperCase()));
                    setOpen(false);
                    setOrderId(option.orderId);
                  }}
                >
                  {format(new Date(option.timestamp), 'PP')}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ProductsTab = ({ orderId }: { orderId?: string }) => {
  const { data: plansData } = usePlans({});
  const { data: user } = useUser();
  const plans = plansData?.actionPlans;

  if (!plans) return null;

  const specificPlan = plans.find((p) => p.orderId === orderId);

  if (!specificPlan || !specificPlan.published)
    return !user?.adminActor ? (
      <TabsContent value="PRODUCT" className="pt-8">
        <h3 className="font-[16px] text-[#18181B]">
          Your action plan will be available once your clinician has reviewed
          your data.
        </h3>
      </TabsContent>
    ) : null;

  const products = filterGoalsByItemType('PRODUCT', specificPlan);

  if (products.length === 0) {
    return (
      <TabsContent value="PRODUCT" className="pt-8">
        <h3 className="font-[16px] text-[#18181B]">
          Your clinician has not recommended any products.
          <br />
          <br />{' '}
          <a className="text-[#FC5F2B]" href="https://products.superpower.com/">
            Click here
          </a>{' '}
          to browse our curated marketplace. <br /> <br /> If you have any
          questions, please don’t hesitate to message your concierge.
        </h3>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="PRODUCT" className="pt-8">
      <div className="space-y-8">
        {products?.map((product, indx) => (
          <ActionPlanGoalContainer goalItem={product} key={indx} />
        ))}
      </div>
    </TabsContent>
  );
};

const ServicesTab = ({ orderId }: { orderId?: string }) => {
  const { data: plansData } = usePlans({});
  const { data: user } = useUser();
  const plans = plansData?.actionPlans;

  if (!plans) return null;

  const specificPlan = plans.find((p) => p.orderId === orderId);

  if (!specificPlan || !specificPlan.published)
    return !user?.adminActor ? (
      <TabsContent value="SERVICE" className="pt-8">
        <h3 className="font-[16px] text-[#18181B]">
          Your action plan will be available once your clinician has reviewed
          your data.
        </h3>
      </TabsContent>
    ) : null;

  const services = filterGoalsByItemType('SERVICE', specificPlan);

  if (services.length === 0) {
    return (
      <TabsContent value="SERVICE" className="pt-8">
        <h3 className="font-[16px] text-[#18181B]">
          Your clinician has not recommended any services.
          <br />
          <br />{' '}
          <a className="text-[#FC5F2B]" href="/services">
            Click here
          </a>{' '}
          to browse our curated services. <br /> <br /> If you have any
          questions, please don’t hesitate to message your concierge.
        </h3>
      </TabsContent>
    );
  }
  return (
    <TabsContent value="SERVICE" className="pt-8">
      <div>
        <div className="space-y-2">
          {services?.map((service, index) => (
            <ActionPlanGoalContainer goalItem={service} key={index} />
          ))}
        </div>
      </div>
    </TabsContent>
  );
};

const ActionPlanGoalContainer = ({ goalItem }: { goalItem: PlanGoal }) => {
  return (
    <div>
      <h4 className="text-[#A1A1AA]">
        {goalItem.title}
        <span className="hidden md:inline">({goalItem.goalItems.length})</span>
      </h4>
      <div className="mt-5 space-y-2">
        {goalItem.goalItems.map(
          (item, indx): JSX.Element => (
            <Item item={item} key={indx} />
          ),
        )}
      </div>
    </div>
  );
};

const Item = ({ item }: { item: PlanGoalItem }) => {
  const productsQuery = useProducts();
  const servicesQuery = useServices();

  switch (item.itemType) {
    case 'PRODUCT': {
      const product = productsQuery.data?.products.find(
        (product) => product.id === item.itemId,
      );
      return (
        <div
          role="presentation"
          className={cn(
            `flex flex-row space-x-6 items-center bg-[#F7F7F7] transition rounded-[20px] p-3 h-[96px] w-full`,
            'cursor-pointer',
          )}
          onClick={() => window.open(product?.url, '_blank')}
        >
          {productsQuery.isLoading ? (
            <Skeleton className="h-[72px] min-w-[72px]" />
          ) : (
            <img
              alt={product?.name}
              src={product?.image}
              className="size-[72px] rounded-[8px] bg-white object-cover object-center"
            />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <Body1>
              {servicesQuery.isLoading ? (
                <Skeleton className="h-[24px] min-w-[130px] bg-zinc-300" />
              ) : (
                product?.name
              )}
            </Body1>
            <Body2 className="text-zinc-400"></Body2>
          </div>
        </div>
      );
    }
    case 'SERVICE': {
      const service = servicesQuery.data?.services.find(
        (service) => service.id === item.itemId,
      );

      return (
        <div className="flex h-[96px] w-full items-center justify-between rounded-[20px] bg-[#F7F7F7] p-3 transition">
          <div className="flex w-full items-center space-x-6">
            {servicesQuery.isLoading ? (
              <Skeleton className="h-[72px] min-w-[72px] bg-zinc-300" />
            ) : (
              <img
                alt={service?.name}
                src={service?.image}
                className="size-[72px] rounded-[8px] bg-white object-cover object-center"
              />
            )}
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex">
                <Body1 className="line-clamp-1">
                  {servicesQuery.isLoading ? (
                    <Skeleton className="h-[24px] min-w-[130px] bg-zinc-300" />
                  ) : (
                    service?.name
                  )}
                </Body1>
                {item.timestamp && (
                  <>
                    <Dot color="#A1A1AA" className="hidden lg:block" />
                    {item.timestamp && (
                      <Body1 className="line-clamp-1 hidden text-zinc-400 lg:block">
                        By {format(new Date(item.timestamp), 'PP')}
                      </Body1>
                    )}
                  </>
                )}
              </div>
              <Body2 className="text-zinc-400">{item.description}</Body2>
            </div>
          </div>
          {service?.active && (
            <HealthcareServiceDialog healthcareService={service}>
              <div className="flex cursor-pointer gap-[3px] whitespace-nowrap text-sm text-[#A1A1AA] hover:text-[#FC5F2B]">
                <h5 className="hidden lg:block">Get Started</h5>
                <ChevronRight width={16} height={16} />
              </div>
            </HealthcareServiceDialog>
          )}
        </div>
      );
    }
  }
};
