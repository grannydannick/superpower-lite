import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { CircleCheckBig } from 'lucide-react';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { H3, H4 } from '@/components/ui/typography';
import { ServiceWithMetadata } from '@/features/onboarding/hooks/use-upsell-services';
import { useCreateBulkOrders } from '@/features/orders/api/create-bulk-orders';
import { CreateOrderInput } from '@/features/orders/api/create-order';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { OrderStatus } from '@/types/api';

import { ItemPreviews } from '../item-previews';

import { UpsellServiceCard } from './upsell-service-card';

export const UpsellCheckout = ({
  services,
  selectedServices,
  toggleService,
}: {
  services: ServiceWithMetadata[];
  selectedServices: ServiceWithMetadata[];
  toggleService: (service: ServiceWithMetadata) => void;
}) => {
  const { data: user } = useUser();
  const { mutateAsync, isPending, error } = useCreateBulkOrders();
  const { track } = useAnalytics();

  const { nextStep, activeStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  const { jump, getStepIndexById } = useStepper((s) => s);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | undefined
  >();
  const [isSelectingPaymentMethod, setIsSelectingPaymentMethod] =
    useState(false);

  const { isFlexSelected, hasFlexPaymentMethod, activePaymentMethod } =
    usePaymentMethodSelection(selectedPaymentMethodId);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethodId(id);
    setIsSelectingPaymentMethod(false);
  };

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, service) => acc + service.price, 0);
  }, [selectedServices]);

  const updateStep = useCallback(async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep },
    });
    if (!isError) nextStep();
  }, [activeStep, isError, nextStep, updateTaskProgress]);

  const skipStep = async () => {
    const stepToJump = getStepIndexById('booking');
    if (stepToJump === -1) {
      toast.error("Something went wrong. Can't skip this step.");
    }

    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: stepToJump },
    });

    if (!isError) jump('booking');
  };

  const createBulkOrdersFromServices = useCallback(async () => {
    if (!user) return;

    const orders: CreateOrderInput[] = selectedServices.map((service) => {
      const collectionMethod = getDefaultCollectionMethod(service);
      return {
        serviceId: service.id,
        location: {},
        timestamp: new Date().toISOString(),
        timezone: moment.tz.guess(),
        method: collectionMethod ?? undefined,
        status: OrderStatus.draft,
        paymentMethodId: activePaymentMethod?.externalPaymentMethodId,
      };
    });

    await mutateAsync({ data: orders });

    track('upsell_checkout_completed', {
      number_of_services: selectedServices.length,
      value: totalPrice,
      currency: 'USD',
      services: selectedServices.map((service) => service.name),
      service_ids: selectedServices.map((service) => service.id),
      payment_provider: activePaymentMethod?.paymentProvider.toLowerCase(),
    });

    return updateStep();
  }, [
    user,
    mutateAsync,
    selectedServices,
    updateStep,
    totalPrice,
    track,
    activePaymentMethod,
  ]);

  const existingOrders = useMemo(() => {
    return services.some((service) => service.order);
  }, [services]);

  const handleBooking = async () => {
    if (existingOrders && !selectedServices?.length) {
      return updateStep();
    }

    if (!selectedServices?.length) {
      return skipStep();
    }

    await createBulkOrdersFromServices();
  };

  const buttonContent = useMemo(() => {
    if (isPending) {
      return (
        <TextShimmer
          className="line-clamp-1 text-base [--base-color:white] [--base-gradient-color:#a1a1aa]"
          duration={1}
        >
          Confirming…
        </TextShimmer>
      );
    }

    let text = '';
    if (selectedServices.length > 0) {
      text = `Book additional tests${isFlexSelected ? ' with HSA/FSA' : ''}`;
    } else if (existingOrders) {
      text = 'Confirm booking details';
    } else {
      text = 'Continue without additional tests';
    }

    return (
      <>
        {isFlexSelected && <CircleCheckBig className="mr-2 size-[20px]" />}
        {text}
      </>
    );
  }, [isPending, selectedServices.length, existingOrders, isFlexSelected]);

  return (
    <>
      <div className="mx-auto mb-16 flex w-full flex-col space-y-4 px-6 lg:mt-0 lg:max-w-[700px] lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <H3>Order Summary</H3>
        </motion.div>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          {services.map((service, index) => {
            if (!service) return null;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.1,
                  ease: 'easeOut',
                }}
              >
                <UpsellServiceCard
                  service={service}
                  services={services}
                  selectedServices={selectedServices}
                  toggleService={toggleService}
                />
              </motion.div>
            );
          })}
        </motion.div>
        {totalPrice > 0 && (
          <motion.div
            className="my-4 flex justify-between gap-4 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          >
            <H4>Total</H4>
            <H4 className="text-right text-zinc-500">
              <NumberFlow
                format={{
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }}
                value={Math.floor(totalPrice / 100)}
                className="text-base"
              />
            </H4>
          </motion.div>
        )}
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          >
            <H3 className="mb-4">Payment</H3>

            <CurrentPaymentMethodCard
              className="bg-white"
              selectedPaymentMethodId={selectedPaymentMethodId}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              isEditing={isSelectingPaymentMethod}
              setIsEditing={setIsSelectingPaymentMethod}
              error={
                error
                  ? 'There was an issue with your payment method. Please try again'
                  : undefined
              }
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
          className="space-y-4 pb-4"
        >
          <Button
            onClick={handleBooking}
            disabled={isPending}
            className="w-full hover:bg-zinc-800 disabled:bg-zinc-700 disabled:opacity-100"
          >
            {buttonContent}
          </Button>
          {hasFlexPaymentMethod &&
            selectedServices.length > 0 &&
            !selectedPaymentMethodId && (
              <Button
                onClick={() => setIsSelectingPaymentMethod(true)}
                variant="outline"
                className="w-full bg-white"
              >
                <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
                Select HSA/FSA card
              </Button>
            )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
        >
          <TestimonialCarousel darkMode={false} />
        </motion.div>
        <div className="h-24 md:hidden" />
      </div>
      <ItemPreviews services={services} />
    </>
  );
};
