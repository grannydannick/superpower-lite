import { defaultSchema } from 'rehype-sanitize';

export const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [
      ...(defaultSchema.protocols?.href ?? []),
      'tel',
      'sms',
      'fhir',
      'product',
      'memory',
      'chat',
      'marketplace',
      'copy',
    ],
  },
};
