import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import {
  UploadFilesAPIResponse,
  FileSource,
  File as SPFile,
} from '@/types/api';

import { getFilesQueryOptions } from './get-files';

export type UploadFilesInput = {
  rawFile: File;
  source: FileSource;
  data?: Record<string, any>;
};

export const createFiles = ({
  data,
}: {
  data: { files: UploadFilesInput[] };
}): Promise<UploadFilesAPIResponse> => {
  const formData = new FormData();

  data.files.forEach((fileInput, index) => {
    const { rawFile, data, source } = fileInput;
    const fieldName = `file${index + 1}`;

    // Add the file with field name
    formData.append(fieldName, rawFile);

    // Add metadata associated by field name
    formData.append(`metadata[${fieldName}][filename]`, rawFile.name);
    formData.append(`metadata[${fieldName}][contentType]`, rawFile.type);
    formData.append(`metadata[${fieldName}][source]`, source);

    // Add metadata as JSON string if provided
    if (data) {
      formData.append(`metadata[${fieldName}][data]`, JSON.stringify(data));
    }
  });

  return api.post('files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseCreateFilesOptions = {
  mutationConfig?: MutationConfig<typeof createFiles>;
};

export const useCreateFiles = ({
  mutationConfig,
}: UseCreateFilesOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (response: UploadFilesAPIResponse, ...args) => {
      queryClient.setQueryData(
        getFilesQueryOptions().queryKey,
        (oldData: { files: SPFile[] } | undefined) => ({
          files: [...response.successful, ...(oldData?.files ?? [])],
        }),
      );

      const { failed, summary } = response;

      if (summary.successful > 0) {
        const message =
          summary.successful === 1
            ? '1 file uploaded successfully.'
            : `${summary.successful} files uploaded successfully.`;
        toast.success(message);
      }

      if (summary.failed > 0) {
        failed.forEach((failedUpload, index) => {
          setTimeout(() => {
            toast.error(
              `Failed to upload ${failedUpload.fileName}: ${failedUpload.error}`,
            );
          }, index * 2500);
        });
      }

      onSuccess?.(response, ...args);
    },
    ...restConfig,
    mutationFn: createFiles,
  });
};
