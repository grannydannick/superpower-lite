/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_API_URL?: string;
    readonly VITE_APP_SOCIAL_BASE_URL?: string;
    readonly VITE_APP_STRIPE_PUBLISHABLE_KEY?: string;
    readonly VITE_APP_ENABLE_API_MOCKING?: string;
    readonly VITE_APP_MAINTENANCE_MODE?: string;
    readonly VITE_APP_IN_LAB_DISABLED?: string;
    readonly VITE_APP_APP_URL?: string;
    readonly VITE_APP_WEBSITE_URL?: string;
    readonly VITE_APP_VITAL_ENV?: string;
    readonly VITE_APP_GOOGLE_API_KEY?: string;
    readonly VITE_APP_KLAVIYO_PUBLIC_API_KEY?: string;
    readonly VITE_APP_KLAVIYO_WAITLIST_LIST_ID?: string;
    readonly VITE_APP_KLAVIYO_LEADS_LIST_ID?: string;
    readonly VITE_APP_POSTHOG_HOST?: string;
    readonly VITE_APP_POSTHOG_UI_HOST?: string;
    readonly VITE_APP_POSTHOG_KEY?: string;
    readonly VITE_APP_POSTHOG_DEBUG?: string;
    readonly VITE_APP_MARKETING_SITE_URL?: string;
  }

  interface Window {
    posthog?: import('posthog-js').PostHog;
  }
}

export {};
