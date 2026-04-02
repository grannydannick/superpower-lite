import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getFilesQueryOptions } from './get-files';

export type IngestFileResponse = {
  runId: string;
};

export const ingestFile = async ({
  fileId,
}: {
  fileId: string;
}): Promise<IngestFileResponse> => {
  return api.post(`/files/${fileId}/ingest`, undefined, {
    headers: { 'x-hide-toast': 'true' },
  }) as Promise<IngestFileResponse>;
};

type UseIngestFileOptions = {
  mutationConfig?: MutationConfig<typeof ingestFile>;
};

export const useIngestFile = ({
  mutationConfig,
}: UseIngestFileOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (response, variables, ...rest) => {
      queryClient.invalidateQueries({
        queryKey: getFilesQueryOptions().queryKey,
      });

      onSuccess?.(response, variables, ...rest);
    },
    onError: (error, variables, onMutateResult, mutationFunctionContext) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 400) {
          toast.error('Only PDF files can be extracted.');
        } else if (status === 404) {
          toast.error('This file is no longer available.');
        } else if (status === 409) {
          queryClient.invalidateQueries({
            queryKey: getFilesQueryOptions().queryKey,
          });
          toast.info('Extraction is already in progress for this file.');
        } else if (status !== 401) {
          toast.error(error.message || 'Failed to start extraction.');
        }
      } else {
        toast.error(error.message || 'Failed to start extraction.');
      }

      onError?.(error, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: ingestFile,
  });
};
