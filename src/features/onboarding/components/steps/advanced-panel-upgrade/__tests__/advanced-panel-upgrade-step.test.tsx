import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePosthogFeatureFlagVariantKey } from '@/hooks/use-posthog-feature-flag-variant-key';

import { AdvancedPanelUpgradeStep } from '../advanced-panel-upgrade-step';

vi.mock('@/components/seo', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('@/hooks/use-posthog-feature-flag-variant-key', () => ({
  usePosthogFeatureFlagVariantKey: vi.fn(),
}));

vi.mock('../upgrade-control/advanced-panel-upgrade-control', () => ({
  AdvancedPanelUpgradeControl: ({ variant }: { variant: string }) => (
    <div data-testid="control-variant">{variant}</div>
  ),
}));

vi.mock('../bundle-picker/bundle-picker', () => ({
  BundlePicker: ({ variant }: { variant: string }) => (
    <div data-testid="bundle-picker-variant">{variant}</div>
  ),
}));

describe('AdvancedPanelUpgradeStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders control while the flag is unresolved', () => {
    vi.mocked(usePosthogFeatureFlagVariantKey).mockReturnValue(undefined);

    render(<AdvancedPanelUpgradeStep />);

    expect(screen.getByTestId('control-variant')).toHaveTextContent(
      'unbucketed',
    );
    expect(
      screen.queryByTestId('bundle-picker-variant'),
    ).not.toBeInTheDocument();
  });

  it('renders control for the control variant', () => {
    vi.mocked(usePosthogFeatureFlagVariantKey).mockReturnValue('control');

    render(<AdvancedPanelUpgradeStep />);

    expect(screen.getByTestId('control-variant')).toHaveTextContent('control');
    expect(
      screen.queryByTestId('bundle-picker-variant'),
    ).not.toBeInTheDocument();
  });

  it('renders the picker only for the bundle-picker variant', () => {
    vi.mocked(usePosthogFeatureFlagVariantKey).mockReturnValue('bundle-picker');

    render(<AdvancedPanelUpgradeStep />);

    expect(screen.getByTestId('bundle-picker-variant')).toHaveTextContent(
      'bundle-picker',
    );
    expect(screen.queryByTestId('control-variant')).not.toBeInTheDocument();
  });
});
