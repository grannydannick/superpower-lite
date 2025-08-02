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
    onMutate: async (variables) => {
      const userContext = await onMutate?.(variables);

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
    onError: (context, ...args) => {
      if (context && 'previousFiles' in context && context.previousFiles) {
        queryClient.setQueryData<FilesData>(
          getFilesQueryOptions().queryKey,
          () => context.previousFiles as FilesData,
        );
      }
      onError?.(context, ...args);
    },
    ...restConfig,
    mutationFn: deleteFile,
  });
};
