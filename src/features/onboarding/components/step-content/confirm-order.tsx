import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import moment from 'moment';
import React, { FormEvent, useState } from 'react';

import { ConsentInfo } from '@/components/shared/consent-info';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  SUPERPOWER_BLOOD_PANEL,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { getTotalPrice } from '@/features/onboarding/utils/get-total-price';
import { useCreateOrder } from '@/features/orders/api/create-order';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { useServices } from '@/features/services/api/get-services';
import {
  useCreateSubscription,
  useMembershipPrice,
} from '@/features/settings/api';
import { useAddPaymentMethod } from '@/features/settings/api/add-payment-method';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { Address } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

const loadingStates = [
  {
    text: 'Processing your payment method',
  },
  {
    text: 'Securing your membership',
  },
  {
    text: 'Creating your first-ever superpower order',
  },
  {
    text: 'Adding your selected services',
  },
  {
    text: 'Finalizing your order',
  },
  {
    text: 'Reviewing your choices',
  },
  {
    text: 'Almost there, wrapping up',
  },
  {
    text: 'Double-checking everything for you',
  },
  {
    text: 'Making sure everything’s perfect',
  },
];

export const ConfirmOrder = () => {
  const { additionalServices, collectionMethod } = useOnboarding();

  const code = localStorage.getItem('superpower-code');
  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
    queryConfig: {},
  });

  const total = getTotalPrice(
    collectionMethod ?? 'IN_LAB',
    additionalServices,
    membershipQuery.data?.total,
  );

  const { prevStep } = useStepper((s) => s);
  const [method, setMethod] = React.useState<string>('credit');
  return (
    <section id="main" className="flex flex-col gap-8">
      <H2 className="text-zinc-900">Confirm Order</H2>
      <div className="flex w-full items-center  justify-between rounded-[16px] bg-[#F7F7F7] px-6 py-5">
        <div>
          <Body1 className="text-zinc-900">
            {formatMoney(total / 12)} / month
          </Body1>
          <Body2 className="text-zinc-900 opacity-50">
            {formatMoney(total)} / year, billed annually
          </Body2>
        </div>
        <Button
          className="p-0 text-sm text-zinc-400"
          variant="ghost"
          onClick={prevStep}
        >
          Edit Plan
        </Button>
      </div>
      <H2 className="text-zinc-900">Payment</H2>
      <RadioGroup value={method} onValueChange={(value) => setMethod(value)}>
        <div
          className={cn(
            'flex items-center rounded-2xl border border-zinc-200 px-6 py-5',
            method === 'credit' ? 'bg-zinc-50' : null,
          )}
        >
          <div className="flex w-full flex-row items-center justify-between">
            <Body1 className="text-zinc-600">Credit Card</Body1>

            <div className="flex flex-row items-center gap-x-6">
              <RadioGroupItem value="credit" />
            </div>
          </div>
        </div>
        {/*<div*/}
        {/*  className={cn(*/}
        {/*    'flex items-center rounded-2xl border border-zinc-200 px-6 py-5',*/}
        {/*    method === 'hsa' ? 'bg-zinc-50' : null,*/}
        {/*  )}*/}
        {/*>*/}
        {/*  <div className="flex w-full flex-row items-center justify-between">*/}
        {/*    <Body1 className="text-zinc-600">Pay with HSA/FSA</Body1>*/}

        {/*    <div className="flex flex-row items-center gap-x-6">*/}
        {/*      <RadioGroupItem*/}
        {/*        value="hsa"*/}
        {/*        className="min-h-5 min-w-5 border-zinc-200"*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </RadioGroup>
      {/*{method === 'hsa' ? <HSACheckout /> : null}*/}
      {method === 'credit' ? <CreditCardPaymentForm /> : null}
    </section>
  );
};

// const HSACheckout = () => {
//   return (
//     <div className="flex flex-col gap-8">
//       <Body1 className="text-zinc-500">
//         After clicking “Confirm”, you will be redirected to TrueMed - Pay with
//         HSA/FSA to complete your purchase securely.{' '}
//       </Body1>
//       <Button>Confirm</Button>
//     </div>
//   );
// };

const CreditCardPaymentForm = () => {
  const { nextOnboardingStep } = useStepper((s) => s);
  const elements = useElements();
  const stripe = useStripe();
  const servicesQuery = useServices({});
  const createOrderMutation = useCreateOrder({});
  const user = useUser({});
  const {
    collectionMethod,
    additionalServices,
    updateBloodOrderId,
    updateCancerOrderId,
    updateToxinOrderId,
    updateMicrobiomeOrderId,
  } = useOnboarding();

  const addPaymentMethodMutation = useAddPaymentMethod({
    mutationConfig: {
      onError: ({ message }) => {
        setErrorMessage(message);
      },
    },
  });

  const createSubscriptionMutation = useCreateSubscription({});

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [processing, setProcessing] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);

    if (!cardNumber) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        setErrorMessage(error.message);
        setProcessing(false);
        return;
      }

      setErrorMessage(undefined);

      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: paymentMethod.id },
      });

      if (!success) {
        setErrorMessage('Error creating payment method');
        setProcessing(false);
        return;
      }

      await createSubscriptionMutation.mutateAsync({
        data: {
          code: localStorage.getItem('superpower-code') ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
        },
      });

      const superpowerPanel = servicesQuery.data?.services.find(
        (s) => s.name === SUPERPOWER_BLOOD_PANEL,
      );

      if (!superpowerPanel) {
        setErrorMessage(
          'Cannot find test package you requested. Contact support',
        );
        setProcessing(false);
        return;
      }

      const { order } = await createOrderMutation.mutateAsync({
        data: {
          items: [],
          serviceId: superpowerPanel.id,
          status: 'DRAFT',
          location: {
            address: user.data?.primaryAddress?.address as Address,
          },
          method: collectionMethod ? [collectionMethod] : [],
          timestamp: new Date().toISOString(),
          timezone: moment.tz.guess(),
        },
      });

      updateBloodOrderId(order.id);

      for (const as of additionalServices) {
        const collectionMethod = getDefaultCollectionMethod(as);
        const response = await createOrderMutation.mutateAsync({
          data: {
            items: [],
            serviceId: as.id,
            status: 'DRAFT',
            location: {
              address: user.data?.primaryAddress?.address as Address,
            },
            method: collectionMethod ? [collectionMethod] : [],
            timestamp: new Date().toISOString(),
            timezone: moment.tz.guess(),
          },
        });

        as.name === GRAIL_GALLERI_MULTI_CANCER_TEST &&
          updateCancerOrderId(response.order.id);
        as.name === GUT_MICROBIOME_ANALYSIS &&
          updateMicrobiomeOrderId(response.order.id);
        as.name === TOTAL_TOXIN_TEST && updateToxinOrderId(response.order.id);
      }
    } catch (e) {
      setProcessing(false);
      setErrorMessage(
        "We can't fulfil this request at the moment. Contact support.",
      );
      return;
    }

    setProcessing(false);
    await nextOnboardingStep();
  };

  return (
    <div className="flex flex-col gap-8">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={processing}
        duration={3000}
      />

      <H2 className="text-zinc-900">Payment</H2>
      <form onSubmit={handleSubmit} className="grid gap-8">
        <div className="space-y-2">
          <Label htmlFor="cardNumber" className="text-sm text-zinc-500">
            Card number
          </Label>
          <CardNumberElement
            id="cardNumber"
            options={{
              disableLink: true,
            }}
            onFocus={() => setErrorMessage(undefined)}
            className="rounded-xl border border-input bg-white px-6 py-4 text-base placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cardExpiration" className="text-sm text-zinc-500">
              Expiration date
            </Label>
            <CardExpiryElement
              onFocus={() => setErrorMessage(undefined)}
              id="cardExpiration"
              className="rounded-xl border border-input bg-white px-6 py-4 text-base placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardCvc" className="text-sm text-zinc-500">
              CVC
            </Label>
            <CardCvcElement
              onFocus={() => setErrorMessage(undefined)}
              id="cardCvc"
              className="rounded-xl border border-input bg-white px-6 py-4 text-base placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms1"
            checked={consentGiven}
            onCheckedChange={(checked) =>
              checked ? setConsentGiven(true) : setConsentGiven(false)
            }
          />

          <ConsentInfo />
        </div>
        <div className="space-y-2">
          <Button
            className={cn(
              'w-full',
              processing ? 'animate-pulse rounded-md bg-[#eaebec]' : '',
            )}
            type="submit"
            disabled={
              !stripe ||
              processing ||
              servicesQuery.isLoading ||
              !servicesQuery.data?.services ||
              !user.data ||
              !!errorMessage ||
              !consentGiven
            }
          >
            Confirm
          </Button>
          {errorMessage && (
            <Body1 className="text-[#B90090]">{errorMessage}</Body1>
          )}
        </div>
      </form>
    </div>
  );
};

export const ConfirmOrderStep = () => (
  <ImageContentLayout title="Confirm">
    <ConfirmOrder />
  </ImageContentLayout>
);
