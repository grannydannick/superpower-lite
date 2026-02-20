import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { File } from '@/types/api';

import { getFilesQueryOptions } from './get-files';

export const deleteFile = ({ fileId }: { fileId: string }) => {
  return api.delete(`/files/${fileId}`);
};

type FilesData = { files: File[] };

type UseDeleteFileOptions = {
  mutationConfig?: MutationConfig<typeof deleteFile>;
};

export const useDeleteFile = ({
  mutationConfig,
}: UseDeleteFileOptions = {}) => {
  const queryClient = useQueryClient();

  const { onError, onMutate, ...restConfig } = mutationConfig || {};

  return useMutation({
    onMutate: async (variables, mutationFunctionContext) => {
      const userContext = await onMutate?.(variables, mutationFunctionContext);

      await queryClient.cancelQueries({
        queryKey: getFilesQueryOptions().queryKey,
      });

      const previousFiles = queryClient.getQueryData<FilesData>(
        getFilesQueryOptions().queryKey,
      );

      queryClient.setQueryData<FilesData>(
        getFilesQueryOptions().queryKey,
        (old) =>
          old && {
            ...old,
            files: old.files.filter((file) => file.id !== variables.fileId),
          },
      );

      return {
        previousFiles,
        ...(userContext as Record<string, unknown>),
      };
    },
    onError: (error, variables, onMutateResult, mutationFunctionContext) => {
      if (
        onMutateResult &&
        typeof onMutateResult === 'object' &&
        'previousFiles' in onMutateResult &&
        onMutateResult.previousFiles
      ) {
        queryClient.setQueryData<FilesData>(
          getFilesQueryOptions().queryKey,
          () => onMutateResult.previousFiles as FilesData,
        );
      }
      onError?.(error, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: deleteFile,
  });
};
