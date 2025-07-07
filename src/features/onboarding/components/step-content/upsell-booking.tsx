import { UpsellBooking } from '../../steps/upsell/booking/upesell-booking';
import { ConfiguratorLayout } from '../layouts';

export const UpsellBookingStep = () => (
  <ConfiguratorLayout title="Book additional services" className="bg-zinc-50">
    <UpsellBooking />
  </ConfiguratorLayout>
);
