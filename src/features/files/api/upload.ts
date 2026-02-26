import { api } from '@/lib/api-client';

type PresignUploadRequest = {
  sha256: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

type PresignUploadResponse =
  | { existed: true; id: string }
  | {
      existed: false;
      tmpKey: string;
      uploadUrl: string;
      uploadHeaders: Record<string, string>;
    };

type CompleteUploadResponse = { id: string };

export const presignUpload = (
  params: PresignUploadRequest,
): Promise<PresignUploadResponse> => {
  return api.post('/files/presign', params);
};

/** Uses plain fetch — the axios client would inject auth headers which S3 presigned URLs don't want. */
export const putToS3 = async (
  presignedUrl: string,
  file: File,
  headers: Record<string, string>,
) => {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      `S3 upload failed: ${response.status} ${response.statusText}`,
    );
  }
};

export const completeUpload = (
  params: PresignUploadRequest & { tmpKey: string },
): Promise<CompleteUploadResponse> => {
  return api.post('/files/upload', params);
};
