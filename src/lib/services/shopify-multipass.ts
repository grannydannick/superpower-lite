import { api } from '../api-client';

interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
}

interface MultipassResponse {
  url: string;
}

/**
 * Service for handling Shopify Multipass integration
 */
export const shopifyMultipassService = {
  /**
   * Get a Shopify Multipass URL for the current user
   * @param userInfo User information required for Multipass
   * @returns Promise with the Shopify URL
   */
  getMultipassUrl: async (userInfo: UserInfo): Promise<string> => {
    try {
      const params = new URLSearchParams({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
      });

      const response = await api.get<MultipassResponse>(
        `/shop/multipass-url?${params.toString()}`,
      );

      if (
        typeof response === 'object' &&
        response !== null &&
        'url' in response
      ) {
        return (response as MultipassResponse).url;
      }
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error getting Shopify Multipass URL:', error);
      throw error;
    }
  },

  /**
   * Redirect the user to the Shopify store with Multipass authentication
   * @param userInfo User information required for Multipass
   */
  redirectToShopify: async (userInfo: UserInfo): Promise<void> => {
    try {
      const url = await shopifyMultipassService.getMultipassUrl(userInfo);
      if (!url) {
        throw new Error('No URL returned from server');
      }
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to Shopify:', error);
      // Only fallback to products.superpower.com if we cannot reach the server
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        window.location.href = 'https://products.superpower.com/';
      } else {
        throw error;
      }
    }
  },
};
