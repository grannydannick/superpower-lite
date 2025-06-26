import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { H3 } from '@/components/ui/typography';

import { CreatePaymentMethodDialog } from './create-payment-method-dialog';
import { PaymentMethodList } from './payment-method-list';

export const Billing = () => {
  return (
    <div className="md:space-y-8">
      <Card className="p-4 md:bg-white md:p-10">
        <H3 className="mb-4 hidden md:block">Credit Card</H3>
        <PaymentMethodList />
        <div className="mt-3 flex md:mt-12 md:justify-end">
          <CreatePaymentMethodDialog>
            <Button className="w-full md:w-auto">Add payment method</Button>
          </CreatePaymentMethodDialog>
        </div>
      </Card>
    </div>
  );
};
