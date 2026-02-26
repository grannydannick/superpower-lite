import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { File } from '@/types/api';

type GetFileResponse = { file: File & { presignedUrl: string } };

export const getFile = ({
  fileId,
}: {
  fileId: string;
}): Promise<GetFileResponse> => {
  return api.get(`/files/${fileId}/presign`);
};

export const getFileQueryOptions = (fileId: string) => {
  return queryOptions({
    queryKey: ['file', fileId],
    queryFn: () => getFile({ fileId }),
  });
};

type UseGetFileOptions = {
  fileId: string;
  queryConfig?: QueryConfig<typeof getFileQueryOptions>;
};

export const useGetFile = ({ fileId, queryConfig }: UseGetFileOptions) => {
  return useQuery({
    ...getFileQueryOptions(fileId),
    ...queryConfig,
  });
};
