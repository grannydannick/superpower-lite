import { Card } from '@/components/ui/card';
import { H2 } from '@/components/ui/typography';
import { CreatePaymentMethod } from '@/features/settings/components/billing/create-payment-method';
import { PaymentMethodList } from '@/features/settings/components/billing/payment-method-list';

export const Billing = () => {
  return (
    <div className="md:space-y-8">
      <H2>Credit Card</H2>
      <Card className="bg-transparent p-[72px] md:bg-white">
        <PaymentMethodList />
        <div className="mt-3 flex md:mt-12 md:justify-end">
          <CreatePaymentMethod />
        </div>
      </Card>
    </div>
  );
};
