import { trackEvent } from '@/utils/analytics';
import { getUtmData } from '@/utils/utm-middleware';

/**
 * Get UTM parameters from cookie using existing UTM middleware
 */
const getUtmParameters = () => {
  const utmData = getUtmData();
  return {
    utm_source: utmData.utm_source || undefined,
    utm_medium: utmData.utm_medium || undefined,
    utm_campaign: utmData.utm_campaign || undefined,
    utm_content: utmData.utm_content || undefined,
    utm_term: utmData.utm_term || undefined,
  };
};

/**
 * Track lead capture using unified trackEvent
 */
export const trackLead = (userData: { email: string }) => {
  try {
    const utmParams = getUtmParameters();

    const leadProperties = {
      email: userData.email.toLowerCase().trim(),
      via: 'web_app',
      ...utmParams,
    };

    // Track lead event with email and UTM data
    trackEvent('Lead', leadProperties);
  } catch (error) {
    // Log tracking errors for debugging but don't interrupt user flow
    console.warn('Lead analytics failed:', error);
  }
};

/**
 * Track user creation using unified trackEvent - GTM will hash automatically
 */
export const trackUserCreated = (userData: {
  email: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    const utmParams = getUtmParameters();

    const registerProperties = {
      email: userData.email.toLowerCase().trim(),
      first_name: userData.firstName.toLowerCase().trim(),
      last_name: userData.lastName.toLowerCase().trim(),
      user_id: userData.email,
      via: 'web_app',
      ...utmParams,
    };

    // Send raw data - GTM will hash using built-in functions, Segment gets raw data
    trackEvent('register', registerProperties);
  } catch (error) {
    // Log tracking errors for debugging but don't interrupt user flow
    console.warn('Registration analytics failed:', error);
  }
};
