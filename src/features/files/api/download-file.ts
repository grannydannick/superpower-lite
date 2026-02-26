import { useMutation } from '@tanstack/react-query';

import { MutationConfig } from '@/lib/react-query';

import { getFile } from './get-file';

export const downloadFile = async ({
  fileId,
}: {
  fileId: string;
}): Promise<Blob> => {
  const { file } = await getFile({ fileId });
  const response = await fetch(file.presignedUrl, { credentials: 'omit' });

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.blob();
};

type UseDownloadFileOptions = {
  mutationConfig?: MutationConfig<typeof downloadFile>;
};

export const useDownloadFile = ({
  mutationConfig,
}: UseDownloadFileOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: downloadFile,
  });
};
