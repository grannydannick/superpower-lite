import 'moment-timezone';

import { UpsellSequence } from '../../steps/upsell/items/upsell-sequence';
import { ConfiguratorLayout } from '../layouts';

export const UpsellStep = () => (
  <ConfiguratorLayout title="Additional services" className="bg-zinc-50">
    <UpsellSequence />
  </ConfiguratorLayout>
);
