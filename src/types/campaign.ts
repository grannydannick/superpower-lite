/**
 * Campaign data interface for tracking marketing attribution
 */
export interface CampaignData {
  // UTM Parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Platform-specific click IDs
  fbclid?: string; // Facebook Click ID
  ttclid?: string; // TikTok Click ID
  gclid?: string; // Google Click ID
  li_fat_id?: string; // LinkedIn Click ID
  // Coupon code
  coupon?: string; // Promotion or discount code
}
