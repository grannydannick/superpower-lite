import * as z from 'zod';

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z.string(),
    STRIPE_PUBLISHABLE_KEY: z.string(),
    ENABLE_API_MOCKING: z
      .string()
      .refine((s) => s === 'true' || s === 'false')
      .transform((s) => s === 'true')
      .optional(),
    MAINTENANCE_MODE: z
      .string()
      .refine((s) => s === 'true' || s === 'false')
      .transform((s) => s === 'true')
      .optional()
      .default('false'),
    APP_URL: z.string().optional().default('http://localhost:3000'),
    APP_MOCK_API_PORT: z.string().optional().default('8080'),
    VITAL_ENV: z.string(),
    GOOGLE_API_KEY: z.string(),
    CALENDLY_TOKEN: z.string(),
    TYPEFORM_FORM_ID: z.string(),
    BRIDGE_PUBLISHABLE_KEY: z.string(),
    BRIDGE_ENDPOINT: z.string(),
    NEW_RELIC_INFO_LICENSE_KEY: z.string(),
    NEW_RELIC_INFO_APPLICATION_ID: z.string(),
    NEW_RELIC_LOADER_ACCOUNT_ID: z.string(),
    NEW_RELIC_LOADER_TRUST_KEY: z.string(),
    NEW_RELIC_LOADER_AGENT_ID: z.string(),
    NEW_RELIC_LOADER_LICENSE_KEY: z.string(),
    NEW_RELIC_LOADER_APPLICATION_ID: z.string(),
    KLAVIYO_PUBLIC_API_KEY: z.string(),
    KLAVIYO_LIST_ID: z.string(),
    ENABLE_WAITLIST: z
      .string()
      .refine((s) => s === 'true' || s === 'false')
      .transform((s) => s === 'true')
      .optional()
      .default('true'),
  });

  const envVars = Object.entries(import.meta.env).reduce<
    Record<string, string>
  >((acc, curr) => {
    const [key, value] = curr;
    if (key.startsWith('VITE_APP_')) {
      acc[key.replace('VITE_APP_', '')] = value;
    }
    return acc;
  }, {});

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
`,
    );
  }

  return parsedEnv.data;
};

export const env = createEnv();
