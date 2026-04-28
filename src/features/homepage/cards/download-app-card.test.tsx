import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDownloadAppDismissedStore } from '@/features/homepage/stores/download-app-dismissed-store';

import { DownloadAppCard } from './download-app-card';

const trackMock = vi.fn();
vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({ track: trackMock }),
}));

const isIOSMock = vi.fn();
const isAndroidMock = vi.fn();
vi.mock('@/utils/browser-detection', () => ({
  isIOS: () => isIOSMock(),
  isAndroid: () => isAndroidMock(),
}));

const onOpenChangeRefs: { current: ((open: boolean) => void) | undefined }[] =
  [];
vi.mock('@/features/settings/components/wearables/mobile-app-banner', () => ({
  QrCodeDialog: ({
    trigger,
    onOpenChange,
  }: {
    trigger: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => {
    onOpenChangeRefs.push({ current: onOpenChange });
    return <div data-testid="qr-dialog-mock">{trigger}</div>;
  },
}));

beforeEach(() => {
  useDownloadAppDismissedStore.setState({ dismissed: false });
  trackMock.mockReset();
  isIOSMock.mockReset();
  isAndroidMock.mockReset();
  isIOSMock.mockReturnValue(false);
  isAndroidMock.mockReturnValue(false);
  onOpenChangeRefs.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('DownloadAppCard', () => {
  it('renders nothing when dismissed', () => {
    useDownloadAppDismissedStore.setState({ dismissed: true });

    const { container } = render(<DownloadAppCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on Android (iOS-only app)', () => {
    isAndroidMock.mockReturnValue(true);

    const { container } = render(<DownloadAppCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the entire card as an App Store link on iOS', () => {
    isIOSMock.mockReturnValue(true);

    render(<DownloadAppCard />);

    const cardLink = screen.getByRole('link', {
      name: /get the superpower app/i,
    });
    expect(cardLink).toHaveAttribute(
      'href',
      'https://apps.apple.com/us/app/superpower/id6747997159',
    );
    // The body copy is a child of the link — the whole surface is the click target.
    expect(cardLink).toHaveTextContent(/all your data in your pocket/i);
  });

  it('wraps the entire card in QrCodeDialog on desktop', () => {
    render(<DownloadAppCard />);

    expect(screen.getByTestId('qr-dialog-mock')).toBeInTheDocument();
    const cardTrigger = screen.getByRole('button', {
      name: /get the superpower app/i,
    });
    expect(cardTrigger).toHaveTextContent(/all your data in your pocket/i);
  });

  it('clicking the ✕ fires dismissed_app_download and sets dismissed without firing the link', async () => {
    isIOSMock.mockReturnValue(true);

    render(<DownloadAppCard />);

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(trackMock).toHaveBeenCalledWith('dismissed_app_download');
    expect(trackMock).not.toHaveBeenCalledWith(
      'clicked_app_download',
      expect.anything(),
    );
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(true);
  });

  it('clicking the iOS CTA fires clicked_app_download with platform:mobile and does NOT dismiss', async () => {
    isIOSMock.mockReturnValue(true);

    render(<DownloadAppCard />);

    await userEvent.click(
      screen.getByRole('link', { name: /get the superpower app/i }),
    );

    expect(trackMock).toHaveBeenCalledWith('clicked_app_download', {
      platform: 'mobile',
    });
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(false);
  });

  it('on desktop, opening the QR dialog tracks clicked; neither open nor close dismisses', () => {
    render(<DownloadAppCard />);

    const onOpenChange = onOpenChangeRefs[onOpenChangeRefs.length - 1].current;
    if (!onOpenChange) throw new Error('Expected onOpenChange to be wired up');

    onOpenChange(true);
    expect(trackMock).toHaveBeenCalledWith('clicked_app_download', {
      platform: 'desktop',
    });
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(false);

    onOpenChange(false);
    expect(useDownloadAppDismissedStore.getState().dismissed).toBe(false);
  });
});
