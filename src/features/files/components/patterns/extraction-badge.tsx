import { Badge } from '@/components/ui/badge';
import { FileExtraction } from '@/types/api';

interface ExtractionBadgeProps {
  extraction: FileExtraction | undefined;
  className?: string;
}

export function ExtractionBadge({
  extraction,
  className,
}: ExtractionBadgeProps) {
  if (extraction == null) return null;

  switch (extraction.status) {
    case 'registered':
      return (
        <Badge variant="secondary" className={className}>
          Queued
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="vermillion" className={className}>
          Processing...
        </Badge>
      );
    case 'final':
      return null;
    case 'failed':
      return (
        <Badge variant="destructive" className={className}>
          Processing Failed
        </Badge>
      );
    default:
      return null;
  }
}
