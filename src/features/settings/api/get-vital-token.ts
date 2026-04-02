import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

type VitalTokenResponse = { linkToken: string; linkWebUrl: string };

export const getVitalToken = (
  provider: string,
): Promise<VitalTokenResponse> => {
  return api.get('/chat/wearables/vital/token', { params: { provider } });
};

export const useConnectWearable = () => {
  return useMutation({ mutationFn: getVitalToken });
};
