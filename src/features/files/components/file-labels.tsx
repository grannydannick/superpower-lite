import { Badge } from '@/components/ui/badge';
import { FileProcessingStatus, FileSource } from '@/types/api';
import { capitalize } from '@/utils/format';

// Label components for Source, Category, and Status
export const SourceLabel = ({ source }: { source?: FileSource }) => {
  const variant: 'vermillion' | 'secondary' | 'outline' = 'vermillion';
  let displayText = 'Unknown';

  switch (source) {
    case 'user':
      displayText = 'Your File';
      break;
    case 'internal-server':
    case 'user-admin-actor':
      displayText = 'Superpower';
      break;
    case 'unknown':
    default:
      break;
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};

export const CategoryLabel = ({ category }: { category?: string }) => {
  const variant: 'vermillion' | 'secondary' = 'vermillion';
  let displayText = 'Uncategorized';
  if (category && category !== 'unknown') {
    displayText = capitalize(category.replace('-', ' '));
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};

export const StatusLabel = ({ status }: { status: FileProcessingStatus }) => {
  const statusLower = status.toLowerCase();
  const variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'vermillion' = 'vermillion';

  switch (statusLower) {
    case 'completed':
      break;
    case 'pending':
    case 'processing':
      break;
    case 'failed':
    case 'unsupported-file-type':
      break;
    case 'unknown':
    default:
      break;
  }

  let displayText: string;
  switch (statusLower) {
    case 'pending':
    case 'processing':
      displayText = 'Processing';
      break;
    case 'unsupported-file-type':
      displayText = 'Unsupported';
      break;
    case 'unknown':
      displayText = 'Uploaded';
      break;
    default:
      displayText = capitalize(statusLower);
      break;
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};
