import { FamilyInsightsBanner } from '@/features/home/components/family-insights/family-insights-banner';
import { RecommendationsList } from '@/features/home/components/recommendations/recommendations-list';

import { cardRegistry } from '../registry/card-registry';
import { CardConfig, HomepageState } from '../types';

import { ActionableOrdersCard } from './actionable-orders-card';
import { ActiveOrdersCard } from './active-orders-card';
import { AiapSummaryCardWeb } from './aiap-summary-card-web';
import { KeyInsightsCard } from './key-insights-card';
import { NavigationCard } from './navigation-card';
import { PhlebotomyAppointmentCard } from './phlebotomy-appointment/phlebotomy-appointment-card';
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
const phlebotomyAppointmentCardConfig: CardConfig = {
  id: 'phlebotomyAppointment',
  component: PhlebotomyAppointmentCard,
  shouldShow: (state: HomepageState) => state.hasActiveBloodPanelOrders,
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
  id: 'actionableOrders',
  component: ActionableOrdersCard,
  shouldShow: (state: HomepageState) => state.hasActionableOrders,
  getPriority: () => 20,
};

/**
 * Card configuration for Active Orders card
 */
const activeOrdersCardConfig: CardConfig = {
  id: 'activeOrders',
  component: ActiveOrdersCard,
  shouldShow: (state: HomepageState) => state.hasActiveLabOrders,
  getPriority: () => 80,
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
 * Card configuration for Referral card
 */
const referralCardConfig: CardConfig = {
  id: 'referral',
  component: ReferralCard,
  shouldShow: () => true,
  getPriority: () => 90,
};

cardRegistry.register(aiapSummaryCardWebConfig);
cardRegistry.register(phlebotomyAppointmentCardConfig);
cardRegistry.register(actionableOrdersCardConfig);
cardRegistry.register(switchRxCardConfig);
cardRegistry.register(navigationCardConfig);
cardRegistry.register(activeOrdersCardConfig);
cardRegistry.register(keyInsightsCardConfig);
cardRegistry.register(referralCardConfig);
cardRegistry.register(familyInsightsBannerConfig);
