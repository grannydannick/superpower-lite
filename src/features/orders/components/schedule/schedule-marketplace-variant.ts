export const SCHEDULE_MARKETPLACE_VARIANTS = ['add-ons', 'retest'] as const;

export type ScheduleMarketplaceVariant =
  (typeof SCHEDULE_MARKETPLACE_VARIANTS)[number];
