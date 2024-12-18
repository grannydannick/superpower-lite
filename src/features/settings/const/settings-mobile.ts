import { CreditCard, File, Heart, History, UserIcon } from 'lucide-react';

import { IntegrationsIcon } from '@/components/icons';

export const SETTINGS_MOBILE = [
  {
    icon: UserIcon,
    value: 'profile',
    description: 'Update information about your account',
    disabled: false,
  },
  {
    icon: CreditCard,
    value: 'billing',
    description: 'Import and manage previous health care records',
    disabled: false,
  },
  {
    icon: File,
    value: 'health records',
    description: 'Integrate your healthcare data into the Superpower ecosystem',
    disabled: false,
  },
  {
    icon: Heart,
    value: 'membership',
    description: 'Manage your Superpower Membership',
    disabled: false,
  },
  {
    icon: History,
    value: 'order history',
    description: 'Manage orders',
    disabled: false,
  },
  {
    icon: IntegrationsIcon,
    value: 'integrations',
    description: 'Manage wearable and other platform integrations',
    disabled: false,
  },
];
