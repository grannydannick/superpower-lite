interface AppEnv {
  API_URL: string;
  AUTH_URL: string;
  SOCIAL_BASE_URL: string;
  STRIPE_PUBLISHABLE_KEY: string;
  ENABLE_API_MOCKING?: boolean;
  MAINTENANCE_MODE: boolean;
  IN_LAB_DISABLED: boolean;
  APP_URL: string;
  WEBSITE_URL: string;
  VITAL_ENV: string;
  GOOGLE_API_KEY: string;
  KLAVIYO_PUBLIC_API_KEY: string;
  KLAVIYO_WAITLIST_LIST_ID: string;
  KLAVIYO_LEADS_LIST_ID: string;
  POSTHOG_HOST?: string;
  POSTHOG_UI_HOST?: string;
  POSTHOG_KEY?: string;
  POSTHOG_DEBUG?: string;
  MARKETING_SITE_URL: string;
  DEV_TOOLS_ENABLED?: boolean;
  SENTRY_DSN?: string;
  APP_ENV: string;
}

const raw = import.meta.env;
const issues: string[] = [];

let API_URL: string;
const apiUrlRaw = raw.VITE_APP_API_URL;
if (typeof apiUrlRaw === 'string') {
  API_URL = apiUrlRaw;
} else {
  issues.push('API_URL');
  API_URL = '';
}

let AUTH_URL: string;
const authUrlRaw = raw.VITE_APP_AUTH_URL;
if (typeof authUrlRaw === 'string') {
  AUTH_URL = authUrlRaw;
} else {
  issues.push('AUTH_URL');
  AUTH_URL = '';
}

let SOCIAL_BASE_URL: string;
const socialBaseUrlRaw = raw.VITE_APP_SOCIAL_BASE_URL;
if (typeof socialBaseUrlRaw === 'string') {
  SOCIAL_BASE_URL = socialBaseUrlRaw;
} else {
  issues.push('SOCIAL_BASE_URL');
  SOCIAL_BASE_URL = '';
}

let STRIPE_PUBLISHABLE_KEY: string;
const stripePublishableKeyRaw = raw.VITE_APP_STRIPE_PUBLISHABLE_KEY;
if (typeof stripePublishableKeyRaw === 'string') {
  STRIPE_PUBLISHABLE_KEY = stripePublishableKeyRaw;
} else {
  issues.push('STRIPE_PUBLISHABLE_KEY');
  STRIPE_PUBLISHABLE_KEY = '';
}

let VITAL_ENV: string;
const vitalEnvRaw = raw.VITE_APP_VITAL_ENV;
if (typeof vitalEnvRaw === 'string') {
  VITAL_ENV = vitalEnvRaw;
} else {
  issues.push('VITAL_ENV');
  VITAL_ENV = '';
}

let GOOGLE_API_KEY: string;
const googleApiKeyRaw = raw.VITE_APP_GOOGLE_API_KEY;
if (typeof googleApiKeyRaw === 'string') {
  GOOGLE_API_KEY = googleApiKeyRaw;
} else {
  issues.push('GOOGLE_API_KEY');
  GOOGLE_API_KEY = '';
}

let KLAVIYO_PUBLIC_API_KEY: string;
const klaviyoPublicApiKeyRaw = raw.VITE_APP_KLAVIYO_PUBLIC_API_KEY;
if (typeof klaviyoPublicApiKeyRaw === 'string') {
  KLAVIYO_PUBLIC_API_KEY = klaviyoPublicApiKeyRaw;
} else {
  issues.push('KLAVIYO_PUBLIC_API_KEY');
  KLAVIYO_PUBLIC_API_KEY = '';
}

let KLAVIYO_WAITLIST_LIST_ID: string;
const klaviyoWaitlistListIdRaw = raw.VITE_APP_KLAVIYO_WAITLIST_LIST_ID;
if (typeof klaviyoWaitlistListIdRaw === 'string') {
  KLAVIYO_WAITLIST_LIST_ID = klaviyoWaitlistListIdRaw;
} else {
  issues.push('KLAVIYO_WAITLIST_LIST_ID');
  KLAVIYO_WAITLIST_LIST_ID = '';
}

let KLAVIYO_LEADS_LIST_ID: string;
const klaviyoLeadsListIdRaw = raw.VITE_APP_KLAVIYO_LEADS_LIST_ID;
if (typeof klaviyoLeadsListIdRaw === 'string') {
  KLAVIYO_LEADS_LIST_ID = klaviyoLeadsListIdRaw;
} else {
  issues.push('KLAVIYO_LEADS_LIST_ID');
  KLAVIYO_LEADS_LIST_ID = '';
}

let MARKETING_SITE_URL: string;
const marketingSiteUrlRaw = raw.VITE_APP_MARKETING_SITE_URL;
if (typeof marketingSiteUrlRaw === 'string') {
  MARKETING_SITE_URL = marketingSiteUrlRaw;
} else {
  issues.push('MARKETING_SITE_URL');
  MARKETING_SITE_URL = '';
}

let ENABLE_API_MOCKING: boolean | undefined;
const enableApiMockingRaw = raw.VITE_APP_ENABLE_API_MOCKING;
if (enableApiMockingRaw === undefined) {
  ENABLE_API_MOCKING = undefined;
} else if (enableApiMockingRaw === 'true') {
  ENABLE_API_MOCKING = true;
} else if (enableApiMockingRaw === 'false') {
  ENABLE_API_MOCKING = false;
} else {
  issues.push('ENABLE_API_MOCKING');
  ENABLE_API_MOCKING = undefined;
}

let MAINTENANCE_MODE = false;
const maintenanceModeRaw = raw.VITE_APP_MAINTENANCE_MODE;
if (maintenanceModeRaw === undefined) {
  MAINTENANCE_MODE = false;
} else if (maintenanceModeRaw === 'true') {
  MAINTENANCE_MODE = true;
} else if (maintenanceModeRaw === 'false') {
  MAINTENANCE_MODE = false;
} else {
  issues.push('MAINTENANCE_MODE');
  MAINTENANCE_MODE = false;
}

let IN_LAB_DISABLED = false;
const inLabDisabledRaw = raw.VITE_APP_IN_LAB_DISABLED;
if (inLabDisabledRaw === undefined) {
  IN_LAB_DISABLED = false;
} else if (inLabDisabledRaw === 'true') {
  IN_LAB_DISABLED = true;
} else if (inLabDisabledRaw === 'false') {
  IN_LAB_DISABLED = false;
} else {
  issues.push('IN_LAB_DISABLED');
  IN_LAB_DISABLED = false;
}

let APP_URL = 'http://localhost:3000';
const appUrlRaw = raw.VITE_APP_APP_URL;
if (appUrlRaw === undefined) {
  APP_URL = 'http://localhost:3000';
} else if (typeof appUrlRaw === 'string') {
  APP_URL = appUrlRaw;
} else {
  issues.push('APP_URL');
  APP_URL = 'http://localhost:3000';
}

let WEBSITE_URL = 'http://localhost:2999';
const websiteUrlRaw = raw.VITE_APP_WEBSITE_URL;
if (websiteUrlRaw === undefined) {
  WEBSITE_URL = 'http://localhost:2999';
} else if (typeof websiteUrlRaw === 'string') {
  WEBSITE_URL = websiteUrlRaw;
} else {
  issues.push('WEBSITE_URL');
  WEBSITE_URL = 'http://localhost:2999';
}

let POSTHOG_HOST: string | undefined;
const posthogHostRaw = raw.VITE_APP_POSTHOG_HOST;
if (posthogHostRaw === undefined) {
  POSTHOG_HOST = undefined;
} else if (typeof posthogHostRaw === 'string') {
  POSTHOG_HOST = posthogHostRaw;
} else {
  issues.push('POSTHOG_HOST');
  POSTHOG_HOST = undefined;
}

let POSTHOG_UI_HOST: string | undefined;
const posthogUiHostRaw = raw.VITE_APP_POSTHOG_UI_HOST;
if (posthogUiHostRaw === undefined) {
  POSTHOG_UI_HOST = undefined;
} else if (typeof posthogUiHostRaw === 'string') {
  POSTHOG_UI_HOST = posthogUiHostRaw;
} else {
  issues.push('POSTHOG_UI_HOST');
  POSTHOG_UI_HOST = undefined;
}

let POSTHOG_KEY: string | undefined;
const posthogKeyRaw = raw.VITE_APP_POSTHOG_KEY;
if (posthogKeyRaw === undefined) {
  POSTHOG_KEY = undefined;
} else if (typeof posthogKeyRaw === 'string') {
  POSTHOG_KEY = posthogKeyRaw;
} else {
  issues.push('POSTHOG_KEY');
  POSTHOG_KEY = undefined;
}

let POSTHOG_DEBUG: string | undefined;
const posthogDebugRaw = raw.VITE_APP_POSTHOG_DEBUG;
if (posthogDebugRaw === undefined) {
  POSTHOG_DEBUG = undefined;
} else if (typeof posthogDebugRaw === 'string') {
  POSTHOG_DEBUG = posthogDebugRaw;
} else {
  issues.push('POSTHOG_DEBUG');
  POSTHOG_DEBUG = undefined;
}

let DEV_TOOLS_ENABLED: boolean | undefined;
const devToolsEnabledRaw = raw.VITE_APP_DEV_TOOLS_ENABLED;
if (devToolsEnabledRaw === undefined) {
  DEV_TOOLS_ENABLED = import.meta.env.DEV;
} else if (devToolsEnabledRaw === 'true') {
  DEV_TOOLS_ENABLED = true;
} else if (devToolsEnabledRaw === 'false') {
  DEV_TOOLS_ENABLED = false;
} else {
  issues.push('DEV_TOOLS_ENABLED');
  DEV_TOOLS_ENABLED = import.meta.env.DEV;
}

const APP_ENV: string =
  typeof raw.VITE_APP_ENV === 'string'
    ? raw.VITE_APP_ENV
    : import.meta.env.MODE;

let SENTRY_DSN: string | undefined;
const sentryDsnRaw = raw.VITE_APP_SENTRY_DSN;
if (sentryDsnRaw === undefined) {
  SENTRY_DSN = undefined;
} else if (typeof sentryDsnRaw === 'string') {
  SENTRY_DSN = sentryDsnRaw;
} else {
  issues.push('SENTRY_DSN');
  SENTRY_DSN = undefined;
}

if (issues.length > 0) {
  let lines = '';
  for (const issue of issues) {
    lines += `- ${issue}\n`;
  }
  throw new Error(
    `Invalid env provided.\nThe following variables are missing or invalid:\n${lines}`,
  );
}

export const env: AppEnv = {
  API_URL,
  AUTH_URL,
  SOCIAL_BASE_URL,
  STRIPE_PUBLISHABLE_KEY,
  ENABLE_API_MOCKING,
  MAINTENANCE_MODE,
  IN_LAB_DISABLED,
  APP_URL,
  WEBSITE_URL,
  VITAL_ENV,
  GOOGLE_API_KEY,
  KLAVIYO_PUBLIC_API_KEY,
  KLAVIYO_WAITLIST_LIST_ID,
  KLAVIYO_LEADS_LIST_ID,
  POSTHOG_HOST,
  POSTHOG_UI_HOST,
  POSTHOG_KEY,
  POSTHOG_DEBUG,
  MARKETING_SITE_URL,
  DEV_TOOLS_ENABLED,
  SENTRY_DSN,
  APP_ENV,
};
