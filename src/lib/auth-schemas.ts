import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

export const baseLoginInputSchema = z.object({
  redirectUri: z.string().optional(),
});

export const loginInputSchema = baseLoginInputSchema.merge(
  z.object({
    email: z
      .string()
      .min(1, 'Please enter your email address.')
      .email('Please enter a valid email address.'),
    password: z.string().min(5, 'Please enter your password.'),
    authMethod: z.enum(['admin']).optional(),
  }),
);

export type BaseLoginInput = z.infer<typeof baseLoginInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

const REQUIRED_MSG = 'This is required.';

const requiredString = () =>
  z.string({ required_error: REQUIRED_MSG }).min(1, REQUIRED_MSG);

export const registerInputSchema = z.object({
  email: requiredString().email('Please enter a valid email address.'),
  phone: requiredString().refine(
    (value) => {
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
  dateOfBirth: z.date({ required_error: REQUIRED_MSG }).refine((data) => {
    const today = new Date();
    const birthDate = new Date(data);
    let age = today.getFullYear() - birthDate.getFullYear();

    // Check if the user has not had their birthday this year yet
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  }, 'You must be over 18 years old to register.'),
  consent: z
    .boolean({ required_error: 'Please agree to the Terms to continue.' })
    .refine((v) => v === true, {
      message: 'Please agree to the Terms to continue.',
    }),
  postalCode: requiredString().min(5, {
    message: 'Please enter a valid zip code.',
  }),
  phiMarketingConsent: z.boolean().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  state: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const resetPasswordInputSchema = z.object({
  email: z.string().email().min(1),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const setPasswordInputSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;
