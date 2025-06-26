import { env } from '@/config/env';

/**
 * Builds a link to the social image for the given card type
 * It uses the types for the paths from the backend
 */
export const buildShareableLink = ({
  cardType,
  username,
  platform,
  format,
}: {
  // short versions for platforms, e.g. t for twitter, l for linkedin, etc.
  platform: 't' | 'l' | 't' | 'i' | 'd' | 'r';
  // formats of the images, e.g. o for og, s for square, c for card
  format: 'o' | 's' | 'c';
  // types of the cards, e.g. s for score, b for biological age (hidden), ba for biological age
  cardType: 's' | 'b' | 'ba';
  username?: string;
}) => {
  const baseUrl = env.SOCIAL_BASE_URL;

  return `${baseUrl}/${platform}/${format}${cardType}/${username}`;
};
