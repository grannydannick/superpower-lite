import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

import { env } from '@/config/env';
import { MutationConfig } from '@/lib/react-query';
import { getCampaignData } from '@/utils/campaign-tracking';

export const subscribeInputSchema = z.object({
  state: z.string().min(1, 'Required'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .min(1, 'Please enter your phone number.')
    .refine(
      (value) => {
        if (!isValidPhoneNumber(value)) return false;

        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber && phoneNumber.country === 'US';
      },
      {
        message: 'Please enter a valid US phone number.',
      },
    ),
  firstName: z.string().min(1, 'Required'),
});

export type SubscribeInput = z.infer<typeof subscribeInputSchema>;

export const subscribe = async ({
  data,
}: {
  data: SubscribeInput;
}): Promise<any> => {
  const campaignData = getCampaignData() || {};

  const payload = {
    data: {
      type: 'subscription',
      attributes: {
        profile: {
          data: {
            type: 'profile',
            attributes: {
              location: { region: data.state },
              phone_number: data.phone,
              email: data.email,
              first_name: data.firstName,
              properties: {
                ...campaignData,
              },
            },
          },
        },
      },
      relationships: {
        list: {
          data: { type: 'list', id: env.KLAVIYO_LIST_ID },
        },
      },
    },
  };

  const response = await axios.post(
    'https://a.klaviyo.com/client/subscriptions/',
    payload,
    {
      params: { company_id: env.KLAVIYO_PUBLIC_API_KEY },
      headers: {
        revision: '2024-07-15',
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

type UseSubscribeOptions = {
  mutationConfig?: MutationConfig<typeof subscribe>;
};

export const useAddToWaitlist = ({
  mutationConfig,
}: UseSubscribeOptions = {}) => {
  return useMutation({
    mutationFn: subscribe,
    ...mutationConfig,
  });
};
