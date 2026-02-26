import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/sonner';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/const/accepted-file-types';
import { useAnalytics } from '@/hooks/use-analytics';
import { MutationConfig } from '@/lib/react-query';

import { sha256Hex } from '../utils/file-hash';

import { getFilesQueryOptions } from './get-files';
import { completeUpload, presignUpload, putToS3 } from './upload';

type UploadResult =
  | {
      success: true;
      id: string;
      existed: boolean;
      fileName: string;
      contentType: string;
    }
  | { success: false; fileName: string; error: string };

async function uploadSingleFile(rawFile: File): Promise<UploadResult> {
  if (rawFile.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = Math.round(rawFile.size / (1024 * 1024));
    return {
      success: false,
      fileName: rawFile.name,
      error: `File is too large (${sizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  try {
    const hexHash = await sha256Hex(rawFile);
    const contentType = rawFile.type || 'application/octet-stream';

    const metadata = {
      originalName: rawFile.name,
      mimeType: contentType,
      sizeBytes: rawFile.size,
      sha256: hexHash,
    };

    const presigned = await presignUpload(metadata);

    if (presigned.existed) {
      return {
        success: true,
        id: presigned.id,
        existed: true,
        fileName: rawFile.name,
        contentType,
      };
    }

    await putToS3(presigned.uploadUrl, rawFile, presigned.uploadHeaders);
    const confirmed = await completeUpload({
      ...metadata,
      tmpKey: presigned.tmpKey,
    });
    return {
      success: true,
      id: confirmed.id,
      existed: false,
      fileName: rawFile.name,
      contentType,
    };
  } catch (err) {
    return {
      success: false,
      fileName: rawFile.name,
      error: err instanceof Error ? err.message : 'Unknown upload error',
    };
  }
}

export type UploadedFile = { id: string; name: string; contentType: string };

export type UploadFailure = { name: string; error: string };

export type UploadFilesResult = {
  uploaded: UploadedFile[];
  duplicateNames: string[];
  failed: UploadFailure[];
};

const uploadFiles = async ({
  data,
}: {
  data: { files: File[] };
}): Promise<UploadFilesResult> => {
  const results = await Promise.all(
    data.files.map((file) => uploadSingleFile(file)),
  );

  const uploaded: UploadedFile[] = [];
  const duplicateNames: string[] = [];
  const failed: UploadFailure[] = [];

  for (const result of results) {
    if (result.success) {
      uploaded.push({
        id: result.id,
        name: result.fileName,
        contentType: result.contentType,
      });
      if (result.existed) {
        duplicateNames.push(result.fileName);
      }
    } else {
      failed.push({ name: result.fileName, error: result.error });
    }
  }

  return { uploaded, duplicateNames, failed };
};

type UseUploadFilesOptions = {
  mutationConfig?: MutationConfig<typeof uploadFiles>;
  context?: 'ai-chat' | 'general';
};

export const useUploadFiles = ({
  mutationConfig,
  context = 'general',
}: UseUploadFilesOptions = {}) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (response, variables, ...rest) => {
      const newCount =
        response.uploaded.length - response.duplicateNames.length;

      if (context === 'ai-chat' && newCount > 0) {
        const newUploads = response.uploaded.filter(
          (f) => !response.duplicateNames.includes(f.name),
        );
        track('uploaded_file_ai', {
          file_count: newCount,
          file_types: newUploads.map((f) => f.contentType),
          file_sizes: variables.data.files
            .filter((f) => newUploads.some((u) => u.name === f.name))
            .map((f) => f.size),
        });
      }

      // Server is source of truth — refetch the file list
      queryClient.invalidateQueries({
        queryKey: getFilesQueryOptions().queryKey,
      });

      if (newCount > 0) {
        const message =
          newCount === 1
            ? '1 file uploaded successfully.'
            : `${newCount} files uploaded successfully.`;
        toast.success(message);
      }

      if (response.duplicateNames.length > 0) {
        const names = response.duplicateNames.join(', ');
        toast.info(`Already in your files: ${names}`);
      }

      if (response.failed.length > 0) {
        response.failed.forEach((failure, index) => {
          setTimeout(() => {
            toast.error(`Failed to upload ${failure.name}: ${failure.error}`);
          }, index * 2500);
        });
      }

      onSuccess?.(response, variables, ...rest);
    },
    ...restConfig,
    mutationFn: uploadFiles,
  });
};
