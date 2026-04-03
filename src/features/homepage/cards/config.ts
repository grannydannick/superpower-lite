import { DailyBriefTeaser } from '@/features/daily-brief/components/daily-brief-teaser';
import { FamilyInsightsBanner } from '@/features/homepage/components/family-insights-banner';
import { FamilyRiskBanner } from '@/features/homepage/components/family-risk-banner';
import { RecommendationsList } from '@/features/homepage/components/recommendations-list';

import { cardRegistry } from '../registry/card-registry';
import { CardConfig, HomepageState } from '../types';

import { ActionItemsCard } from './action-items-card';
import { ActionableOrdersCard } from './actionable-orders-card';
import { AiapSummaryCardWeb } from './aiap-summary-card-web';
import { KeyInsightsCard } from './key-insights-card';
import { LabOrderCard } from './lab-order/lab-order-card';
import { NavigationCard } from './navigation-card';
import { ReferralCard } from './referral-card';

/**
 * Card configuration for AI Action Plan Summary card
 */
const aiapSummaryCardWebConfig: CardConfig = {
  id: 'aiapSummaryWeb',
  component: AiapSummaryCardWeb,
  shouldShow: (state: HomepageState) => state.hasCompletedActionPlan,
  getPriority: () => 30,
};

/**
 * Card configuration for Phlebotomy Appointment card
 */
const labOrderCardConfig: CardConfig = {
  id: 'appointmentCard',
  component: LabOrderCard,
  shouldShow: (state: HomepageState) => state.hasActiveLabOrders,
  getPriority: () => 10,
};

/**
 * Card configuration for Switch Rx card
 */
const switchRxCardConfig: CardConfig = {
  id: 'switchRx',
  component: RecommendationsList,
  shouldShow: (state: HomepageState) => !state.hasCompletedActionPlan,
  getPriority: () => 60,
};

/**
 * Card configuration for Navigation card
 */
const navigationCardConfig: CardConfig = {
  id: 'navigation',
  component: NavigationCard,
  shouldShow: (state: HomepageState) => state.isMobile,
  getPriority: () => 70,
};

/**
 * Card configuration for Actionable Orders card
 */
const actionableOrdersCardConfig: CardConfig = {
  id: 'actionableCards',
  component: ActionableOrdersCard,
  shouldShow: () => true,
  getPriority: () => 5,
};

/**
 * Card configuration for Homepage Action Items card
 */
const actionItemsCardConfig: CardConfig = {
  id: 'homepageActionItems',
  component: ActionItemsCard,
  shouldShow: () => true,
  getPriority: () => 6,
};

/**
 * Card configuration for Key Insights card
 */
const keyInsightsCardConfig: CardConfig = {
  id: 'keyInsights',
  component: KeyInsightsCard,
  shouldShow: (state: HomepageState) => state.hasCompletedActionPlan,
  getPriority: () => 50,
};

/**
 * Card configuration for Family Insights Banner card
 */
const familyInsightsBannerConfig: CardConfig = {
  id: 'familyInsightsBanner',
  component: FamilyInsightsBanner,
  shouldShow: () => true,
  getPriority: () => 40,
};

/**
 * Card configuration for Family Risk Banner card
 * Shows when user has a family risk plan available
 */
const familyRiskBannerConfig: CardConfig = {
  id: 'familyRiskBanner',
  component: FamilyRiskBanner,
  shouldShow: () => true,
  getPriority: () => 35,
};

/**
 * Card configuration for Referral card
 */
const referralCardConfig: CardConfig = {
  id: 'referral',
  component: ReferralCard,
  shouldShow: () => true,
  getPriority: () => 90,
};

/**
 * Card configuration for Daily Brief Teaser card
 */
const dailyBriefCardConfig: CardConfig = {
  id: 'dailyBrief',
  component: DailyBriefTeaser,
  shouldShow: () => true,
  getPriority: () => 3,
};

cardRegistry.register(aiapSummaryCardWebConfig);
// cardRegistry.register(phlebotomyAppointmentCardConfig);
cardRegistry.register(actionableOrdersCardConfig);
cardRegistry.register(actionItemsCardConfig);
cardRegistry.register(switchRxCardConfig);
cardRegistry.register(navigationCardConfig);
cardRegistry.register(labOrderCardConfig);
cardRegistry.register(keyInsightsCardConfig);
cardRegistry.register(referralCardConfig);
cardRegistry.register(familyInsightsBannerConfig);
cardRegistry.register(familyRiskBannerConfig);
cardRegistry.register(dailyBriefCardConfig);
