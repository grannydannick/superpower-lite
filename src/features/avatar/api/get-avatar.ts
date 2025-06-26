import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';

import { avatarApi } from '../lib/avatar-api-client';
import { getImagePath } from '../utils/get-image-path';

export const getAvatar = async ({
  username,
}: {
  username: string;
}): Promise<{ original: string; removedBg: string } | undefined> => {
  const response = await avatarApi.get(`/ts-user/${username}`);
  const { avatar_url_original, avatar_url_bg_removed } = response.data;

  if (!avatar_url_original || !avatar_url_bg_removed) {
    return undefined;
  }

  const originalPath = getImagePath(avatar_url_original);
  const removedBgPath = getImagePath(avatar_url_bg_removed);

  return {
    original: originalPath,
    removedBg: removedBgPath,
  };
};

export const getAvatarQueryOptions = (username: string) => {
  return queryOptions({
    queryKey: ['avatar', username],
    queryFn: () => getAvatar({ username }),
  });
};

type UseAvatarOptions = {
  username: string;
  queryConfig?: QueryConfig<typeof getAvatarQueryOptions>;
};

export const useAvatar = ({ username, queryConfig }: UseAvatarOptions) => {
  return useQuery({
    ...getAvatarQueryOptions(username),
    ...queryConfig,
  });
};
