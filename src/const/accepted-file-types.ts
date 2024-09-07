import { FileContentType } from '@/types/api';

export const acceptedFileTypes: { [key in FileContentType]: string[] } = {
  'application/pdf': [],
  'application/zip': [],
  'text/csv': [],
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
  'video/mov': [],
  'application/vnd.md-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
};
