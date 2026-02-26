export const acceptedFileContentTypes: {
  [key in 'application/pdf']: string[];
} = {
  'application/pdf': ['.pdf'],
  // 'text/csv': [],
  // 'image/jpeg': [],
  // 'image/png': [],
  // 'video/mp4': [],
};

export const MAX_FILE_SIZE_MB = 30;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
