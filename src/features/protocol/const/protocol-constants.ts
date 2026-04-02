import { getServiceImage, protocolIdToDisplay } from '@/utils/service';

/**
 * Constants for the new protocol API (ts-ai-chat)
 */

/**
 * Reviewing clinician displayed in the reveal flow
 */
export const REVIEWING_CLINICIAN = {
  name: 'Dr. Anant',
  avatarUrl: '/services/doctors/doc_1.webp',
} as const;

/**
 * Goal colors derived from goal.number (1-indexed)
 * Usage: GOAL_COLORS[goal.number - 1]
 */
export const GOAL_COLORS = ['red', 'orange', 'blue'] as const;
export type GoalColor = (typeof GOAL_COLORS)[number];

/**
 * Images for action types, keyed by type or type:category for lifestyle subtypes
 */
export const ACTION_TYPE_IMAGES: Record<string, string> = {
  supplement: '/protocol/types/supplement-type.png',
  prescription: '/protocol/final/three-bottles.webp',
  testing: '/protocol/types/testing-type.webp',
  consultation: '/protocol/types/consultation-type.webp',
  'lifestyle:exercise': '/protocol/decision/woman-workout.webp',
  'lifestyle:nutrition': '/protocol/decision/healthy-food.webp',
  'lifestyle:general': '/protocol/types/lifestyle-type.webp',
};

export const ACTION_TYPE_FALLBACK_IMAGE = '/protocol/types/lifestyle-type.webp';

/**
 * Get the image URL for an action based on its content (type + optional category)
 */
export function getActionTypeImage(content: {
  type: string;
  category?: string;
  testPanelId?: string;
}): string {
  if (content.type === 'testing' && content.testPanelId) {
    const serviceDisplayName = protocolIdToDisplay(content.testPanelId);
    return getServiceImage(serviceDisplayName);
  }
  if (content.type === 'lifestyle' && content.category) {
    return (
      ACTION_TYPE_IMAGES[`lifestyle:${content.category}`] ??
      ACTION_TYPE_IMAGES['lifestyle:general'] ??
      ACTION_TYPE_FALLBACK_IMAGE
    );
  }
  return ACTION_TYPE_IMAGES[content.type] ?? ACTION_TYPE_FALLBACK_IMAGE;
}
