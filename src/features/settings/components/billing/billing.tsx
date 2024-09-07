import { Card } from '@/components/ui/card';
import { H2 } from '@/components/ui/typography';

import { CreatePaymentMethod } from './create-payment-method';
import { PaymentMethodList } from './payment-method-list';

export const Billing = () => {
  return (
    <div className="md:space-y-8">
      <H2 className="hidden md:block">Credit Card</H2>
      <Card className="p-4 md:bg-white md:p-[72px]">
        <PaymentMethodList />
        <div className="mt-3 flex md:mt-12 md:justify-end">
          <CreatePaymentMethod />
        </div>
      </Card>
    </div>
  );
};
