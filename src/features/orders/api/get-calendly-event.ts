import { Location, WebAddressType } from '@/types/api';

export const fetchCalendlyEvent = async (
  orderId: string | undefined,
  token: string,
): Promise<Location> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await fetch(
          `https://api.calendly.com/scheduled_events/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (result.ok) {
          const event = await result.json();
          console.log(event);
          resolve({
            webAddress: {
              url: event.resource.location?.join_url,
              type: 'ZOOM' as WebAddressType, // Assuming WebAddressType is predefined somewhere else
            },
          });
        } else {
          reject(new Error('Failed to fetch event details'));
        }
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
};
