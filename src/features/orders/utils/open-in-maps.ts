import { PhlebotomyLocation, ServiceLabTypeEnum } from '@/types/api';
import { formatAddress } from '@/utils/format';

export const openInMaps = (
  location: PhlebotomyLocation,
  mapType: 'google' | 'apple',
): void => {
  const address = formatAddress(location.address);
  const provider = getProviderName(location.name);

  const encodedQuery = encodeURIComponent(`${provider} ${address}`);

  const urls = {
    google: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    apple: `https://maps.apple.com/?q=${encodedQuery}`,
  };

  window.open(urls[mapType], '_blank');
};

const getProviderName = (name: string) => {
  if (name.toLowerCase().includes(ServiceLabTypeEnum.Labcorp)) return 'Labcorp';
  if (name.toLowerCase().includes(ServiceLabTypeEnum.Bioref))
    return 'BioReference Patient Service Center';
  if (name.toLowerCase().includes(ServiceLabTypeEnum.Quest))
    return 'Quest Diagnostic';
};
