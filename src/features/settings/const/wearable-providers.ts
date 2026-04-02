export interface WearableProviderDefinition {
  provider: string;
  name: string;
  icon?: string;
}

export const WEARABLE_PROVIDERS: WearableProviderDefinition[] = [
  {
    provider: 'apple_health_kit',
    name: 'Apple Health',
    icon: '/integrations/apple-health.png',
  },
  { provider: 'fitbit', name: 'Fitbit', icon: '/integrations/fitbit.webp' },
  { provider: 'oura', name: 'Oura', icon: '/integrations/oura.webp' },
  { provider: 'peloton', name: 'Peloton', icon: '/integrations/peloton.webp' },
  { provider: 'whoop_v2', name: 'Whoop', icon: '/integrations/whoop.webp' },
  // { provider: "polar", name: "Polar", icon: "/integrations/polar.webp" },
  {
    provider: 'eight_sleep',
    name: 'Eight Sleep',
    icon: '/integrations/eight-sleep.webp',
  },
  {
    provider: 'withings',
    name: 'Withings',
    icon: '/integrations/withings.webp',
  },
  { provider: 'garmin', name: 'Garmin', icon: '/integrations/garmin.webp' },
  {
    provider: 'ultrahuman',
    name: 'Ultrahuman',
    icon: '/integrations/ultrahuman.webp',
  },
];
