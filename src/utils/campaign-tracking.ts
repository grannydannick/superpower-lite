import { CampaignData } from '../types/campaign';

import { getAccessCode } from './access-code';

const CAMPAIGN_STORAGE_KEY = 'superpower_campaign_data';

/**
 * Extracts campaign parameters from the current URL
 */
export function extractCampaignParameters(): CampaignData {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const campaignData: CampaignData = {};

  // Extract UTM parameters
  if (params.has('utm_source'))
    campaignData.utm_source = params.get('utm_source') ?? undefined;
  if (params.has('utm_medium'))
    campaignData.utm_medium = params.get('utm_medium') ?? undefined;
  if (params.has('utm_campaign'))
    campaignData.utm_campaign = params.get('utm_campaign') ?? undefined;
  if (params.has('utm_term'))
    campaignData.utm_term = params.get('utm_term') ?? undefined;
  if (params.has('utm_content'))
    campaignData.utm_content = params.get('utm_content') ?? undefined;

  // Extract platform-specific click IDs
  if (params.has('fbclid'))
    campaignData.fbclid = params.get('fbclid') ?? undefined;
  if (params.has('ttclid'))
    campaignData.ttclid = params.get('ttclid') ?? undefined;
  if (params.has('gclid'))
    campaignData.gclid = params.get('gclid') ?? undefined;
  if (params.has('li_fat_id'))
    campaignData.li_fat_id = params.get('li_fat_id') ?? undefined;

  return campaignData;
}

/**
 * Stores campaign data in session storage
 */
export function storeCampaignData(campaignData: CampaignData): void {
  if (Object.keys(campaignData).length > 0) {
    sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaignData));
  }
}

/**
 * Retrieves stored campaign data
 */
export function getCampaignData(): CampaignData | null {
  const storedData = sessionStorage.getItem(CAMPAIGN_STORAGE_KEY);
  let campaignData: CampaignData | null = null;

  if (storedData) {
    try {
      campaignData = JSON.parse(storedData) as CampaignData;
    } catch (error) {
      console.error('Failed to parse campaign data', error);
      return null;
    }
  }

  // Get access code from localStorage and add it to campaign data
  const accessCode = getAccessCode();
  if (accessCode) {
    campaignData = campaignData || {};
    campaignData.coupon = accessCode;
  }

  return campaignData;
}

/**
 * Captures and stores campaign parameters from the URL
 * Call this function on app initialization or page load
 */
export function captureCampaignParameters(): CampaignData | null {
  // Always extract current UTM parameters from URL
  const currentUrlData = extractCampaignParameters();
  const hasCurrentUrlParams = Object.keys(currentUrlData).length > 0;
  // Get existing data from session storage
  const existingData = getCampaignData();
  if (hasCurrentUrlParams) {
    // If we have UTM parameters in the current URL, use them (overwriting any existing)
    storeCampaignData(currentUrlData);
    console.log('Captured new UTM parameters from URL:', currentUrlData);
    return currentUrlData;
  } else if (existingData && Object.keys(existingData).length > 0) {
    // No current UTM parameters, but we have existing data
    console.log('Using existing UTM parameters from session:', existingData);
    return existingData;
  }

  // No UTM parameters in URL or session storage
  return null;
}
