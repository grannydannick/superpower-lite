import { ReactNode } from 'react';

import { FileUpload } from '@/components/shared/upload-wrapper';
import { useCreateFiles } from '@/features/files/api';
import { useAuthorization } from '@/lib/authorization';

export const FileUploadBanner = ({ children }: { children?: ReactNode }) => {
  const { mutate } = useCreateFiles({});
  const { checkAdminActorAccess } = useAuthorization();
  const isAdmin = checkAdminActorAccess();

  const source = isAdmin ? 'user-admin-actor' : 'user';

  const onChange = (files: File[]) => {
    if (files.length > 0) {
      mutate({
        data: {
          files: files.map((file) => ({
            rawFile: file,
            source,
          })),
        },
      });
    }
  };

  return (
    <FileUpload multiple onChange={onChange}>
      {children}
    </FileUpload>
  );
};
