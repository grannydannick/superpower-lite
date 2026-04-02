import { ComponentType } from 'react';

export interface HomepageState {
  readonly isMobile: boolean;
  readonly hasActiveLabOrders: boolean;
  readonly hasActionableOrders: boolean;
  readonly hasCompletedActionPlan: boolean;
  readonly hasMultipleActionPlans: boolean;
  readonly hasActiveNonLabOrders: boolean;
  readonly hasNoWearables: boolean;
}

export interface CardConfig {
  readonly id: string;
  readonly component: ComponentType;
  readonly shouldShow: (state: HomepageState) => boolean;
  readonly getPriority: (state: HomepageState) => number;
}

export interface VisibleCard {
  readonly id: string;
  readonly priority: number;
  readonly component: ComponentType;
}
