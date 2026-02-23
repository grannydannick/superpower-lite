import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import * as z from 'zod';

import { env } from '@/config/env';
import { MutationConfig } from '@/lib/react-query';
import { getCampaignData } from '@/utils/campaign-tracking';

export const subscribeInputSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  type: z.enum(['waitlist', 'leads']),
  state: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') {
          return true;
        }

        if (!isValidPhoneNumber(value)) return false;

        const phoneNumber = parsePhoneNumber(value);
        return (
          phoneNumber &&
          (phoneNumber.country === 'US' || phoneNumber.country === 'CA')
        );
      },
      {
        message: 'Please enter a valid US or Canadian phone number.',
      },
    ),
  firstName: z.string().optional(),
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
              location: data.state ? { region: data.state } : undefined,
              phone_number: data.phone ? data.phone : undefined,
              email: data.email,
              first_name: data.firstName ? data.firstName : undefined,
              properties: {
                ...campaignData,
              },
              subscriptions: {
                email: {
                  marketing: { consent: 'SUBSCRIBED' },
                },
                sms: {
                  marketing: { consent: 'SUBSCRIBED' },
                },
              },
            },
          },
        },
      },
      relationships: {
        list: {
          data: {
            type: 'list',
            id:
              data.type === 'leads'
                ? env.KLAVIYO_LEADS_LIST_ID
                : env.KLAVIYO_WAITLIST_LIST_ID,
          },
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
        revision: '2025-04-15',
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

type UseSubscribeOptions = {
  mutationConfig?: MutationConfig<typeof subscribe>;
};

export const useKlaviyoSubscribe = ({
  mutationConfig,
}: UseSubscribeOptions = {}) => {
  return useMutation({
    mutationFn: subscribe,
    ...mutationConfig,
  });
};
