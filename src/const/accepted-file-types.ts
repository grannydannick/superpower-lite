import { FileContentType } from '@/types/api';

export const acceptedFileTypes: { [key in FileContentType]: string[] } = {
  'application/pdf': [],
  'text/csv': [],
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
};
