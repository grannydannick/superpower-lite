import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { MutationConfig } from '@/lib/react-query';

import { avatarApi } from '../lib/avatar-api-client';

export const uploadAvatarInputSchema = z.object({
  avatar: z.instanceof(File),
  avatar_bg_removed: z.optional(z.instanceof(File)),
});

export type UploadAvatarInput = z.infer<typeof uploadAvatarInputSchema>;

export const uploadAvatar = ({
  data,
}: {
  data: UploadAvatarInput;
}): Promise<{ success: boolean }> => {
  const { avatar, avatar_bg_removed } = data;

  const formData = new FormData();
  formData.append('avatar', avatar);
  if (avatar_bg_removed) {
    formData.append('avatar_bg_removed', avatar_bg_removed);
  }

  return avatarApi.post(`/avatar`, formData);
};

type UseUploadAvatarOptions = {
  mutationConfig?: MutationConfig<typeof uploadAvatar>;
};

export const useUploadAvatar = ({
  mutationConfig,
}: UseUploadAvatarOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['avatar'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: uploadAvatar,
  });
};
