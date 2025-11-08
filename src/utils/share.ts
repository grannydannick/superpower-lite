import { toast } from '@/components/ui/sonner';

export const handleShare = async (text: string) => {
  try {
    // copy to clipboard
    await navigator.clipboard.writeText(text);

    // open iMessage / SMS app with prefilled text
    const encoded = encodeURIComponent(text);
    window.location.href = `sms:&body=${encoded}`;
  } catch (err) {
    console.error('Failed to copy/share insight:', err);
    toast.error('Could not copy text. Please try again.');
  }
};
