import * as z from 'zod';

import { getState } from '@/utils/verify-state-from-postal';

export const addressInputSchema = z.object({
  line: z.array(z.string()),
  city: z.string().min(1, 'This is required.'),
  state: z.string().min(1, 'This is required.'),
  postalCode: z.string().min(5, 'This is required.'),
  use: z.enum(['old', 'home', 'work', 'temp', 'billing']),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

/**
 * Used as main type for all form inputs where we need to add/update address
 */
export const formAddressInputSchema = z
  .object({
    line1: z
      .string()
      .min(3, { message: 'Please enter a valid address.' })
      .regex(/^[a-zA-Z0-9 ./-]+$/, {
        message: `Address Line 1 has invalid characters`,
      }),
    line2: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === undefined ||
          val.trim() === '' ||
          /^[a-zA-Z0-9 ./-]+$/.test(val),
        {
          message: `Address Line 2 has invalid characters`,
        },
      ),
    postalCode: z
      .string()
      .min(5, { message: 'Please enter a valid zip code.' }),
    city: z.string().min(1, { message: 'Please enter a city.' }),
    state: z.string().min(2, { message: 'Please enter a state.' }),
  })
  .superRefine((data, ctx) => {
    const derived = getState(data.postalCode);
    if (!derived) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: 'Cannot derive state from this ZIP code.',
      });
    } else if (derived.state !== data.state) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: 'ZIP code does not match the selected state.',
      });
    }
  });

export type FormAddressInput = z.infer<typeof formAddressInputSchema>;

export type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};
