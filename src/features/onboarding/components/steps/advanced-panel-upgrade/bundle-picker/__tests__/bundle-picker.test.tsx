import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADVANCED_UPGRADE_BUNDLE_IDS } from '@/const';
import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';
import type { User } from '@/types/api';

import { BundlePicker } from '../bundle-picker';

const mocks = vi.hoisted(() => ({
  track: vi.fn(),
  next: vi.fn(),
  prev: vi.fn(),
  mutateAsync: vi.fn(),
  trackOnboardingCreditPurchase: vi.fn(),
  user: undefined as User | undefined,
}));

const scrollIntoViewMock = vi.fn();

const testUser = {
  id: 'u1',
  username: 'u1',
  firstName: 'T',
  lastName: 'E',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 't@e.com',
  phone: '555',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  subscribed: true,
  admin: false,
  authMethod: 'password',
  address: [],
  role: ['MEMBER'],
} satisfies User;

const nyUser = {
  ...testUser,
  primaryAddress: {
    id: 'a1',
    line: ['1 Main St'],
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    use: 'home',
  },
} satisfies User;

interface BiomarkerFixture {
  name: string;
  category: string;
}

function biomarker(input: BiomarkerFixture) {
  return {
    id: input.name,
    slug: input.name.toLowerCase().replaceAll(' ', '-'),
    name: input.name,
    title: input.name,
    subtitle: null,
    shortDescription: null,
    description: null,
    gender: 'all',
    aliases: [],
    hidden: false,
    tags: [],
    categories: [
      {
        id: input.category,
        slug: input.category.toLowerCase().replaceAll(' ', '-'),
        name: input.category,
        title: input.category,
      },
    ],
  } satisfies OnboardingProduct['biomarkers'][number];
}

function product(
  slug: string,
  image: string,
  biomarkers: BiomarkerFixture[] = [],
): OnboardingProduct {
  const biomarkerRows: OnboardingProduct['biomarkers'] = [];
  for (const b of biomarkers) {
    biomarkerRows.push(biomarker(b));
  }

  return {
    id: slug,
    slug,
    name: slug,
    title: slug === 'advanced-blood-panel' ? 'Advanced Blood Panel' : slug,
    subtitle: null,
    type: 'diagnostic_test',
    status: 'published',
    shortDescription:
      slug === 'advanced-blood-panel'
        ? '135+ biomarkers tested through a comprehensive advanced blood and urine panel.'
        : `${slug} API summary`,
    description: null,
    image,
    hidden: false,
    tags: [],
    metaTitle: null,
    metaDescription: null,
    sampleReport: null,
    biomarkers: biomarkerRows,
  };
}

const bundleProducts: OnboardingProduct[] = [
  product('advanced-blood-panel', '/advanced.png', [
    { category: 'Immune System', name: 'Absolute Blast Count' },
  ]),
  product('gut-microbiome-analysis', '/gut.png'),
  product('heavy-metals', '/metals.png'),
  product('mycotoxins', '/myco.png', [
    { category: 'Aflatoxins', name: 'Aflatoxin M1' },
    { category: 'Ochratoxins', name: 'Ochratoxin A' },
    { category: 'Trichothecenes', name: 'Roridin E' },
    { category: 'Trichothecenes', name: 'Verrucarin A' },
    { category: 'API-only category', name: 'API-only mycotoxin marker' },
  ]),
  product('environmental-toxins', '/enviro.png'),
];

vi.mock('@/lib/auth', () => ({
  useUser: () => ({ data: mocks.user, isFetched: true }),
}));

vi.mock('@/hooks/use-gender', () => ({
  useGender: () => ({ gender: 'male' }),
}));

vi.mock('@/features/settings/hooks', () => ({
  usePaymentMethodSelection: () => ({
    paymentMethods: [],
    defaultPaymentMethod: null,
    flexPaymentMethod: undefined,
    activePaymentMethod: {
      stripePaymentMethodId: 'pm_1',
      stripeCustomerId: 'cus_1',
      billing_details: null,
      type: 'card',
      card: {
        brand: 'visa',
        country: 'US',
        exp_month: 1,
        exp_year: 2030,
        last4: '4242',
      },
      created: 1,
      default: true,
      paymentProvider: 'stripe',
      externalPaymentMethodId: 'pm_1',
    },
    activePaymentMethodId: 'pm_1',
    setActivePaymentMethod: vi.fn(),
    setSelectedPaymentMethodId: vi.fn(),
    startSelectingPaymentMethod: vi.fn(),
    stopSelectingPaymentMethod: vi.fn(),
    isFlexSelected: false,
    hasFlexPaymentMethod: false,
    isSelectingPaymentMethod: false,
    isLoading: false,
  }),
}));

vi.mock('@/features/orders/api', () => ({
  useUpgradeCredit: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}));

vi.mock('../../../../../hooks/use-onboarding-analytics', () => ({
  useOnboardingAnalytics: () => ({
    trackOnboardingCreditPurchase: mocks.trackOnboardingCreditPurchase,
    trackOnboardingCreditAddedToCart: vi.fn(),
  }),
}));

vi.mock('../../../../../hooks/use-onboarding-navigation', () => ({
  useOnboardingNavigation: () => ({
    next: mocks.next,
    prev: mocks.prev,
    goTo: vi.fn(),
    currentStep: 'advanced-upgrade',
    validSteps: ['about-you', 'advanced-upgrade'],
    isLastStep: false,
    isFirstStep: true,
  }),
}));

vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({ track: mocks.track }),
}));

vi.mock('@/components/ui/sonner', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/ui/sonner')>();

  return {
    ...actual,
    toast: { ...actual.toast, error: vi.fn(), success: vi.fn() },
  };
});

vi.mock(
  '@/features/onboarding/api/onboarding-products',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/onboarding/api/onboarding-products')
      >();

    return {
      ...actual,
      useOnboardingProducts: () => ({
        data: { products: bundleProducts },
        isPending: false,
        isError: false,
      }),
    };
  },
);

describe('BundlePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = testUser;
    mocks.mutateAsync.mockResolvedValue({});
    scrollIntoViewMock.mockClear();
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });
  });

  it('tracks picker exposure when mounted', async () => {
    render(<BundlePicker variant="test" />);

    await waitFor(() =>
      expect(mocks.track).toHaveBeenCalledWith(
        'advanced_upgrade_picker_viewed',
        {
          variant: 'test',
          bundle_id: null,
        },
      ),
    );
  });

  it('selects the standard advanced bundle by default', () => {
    render(<BundlePicker variant="test" />);

    const carousel = screen.getByTestId('bundle-mobile-carousel');
    const advancedCard = within(carousel).getByRole('button', {
      name: /male advanced/i,
    });
    const microbiomeCard = within(carousel).getByRole('button', {
      name: /advanced & microbiome/i,
    });

    expect(advancedCard).toHaveAttribute('aria-pressed', 'true');
    expect(microbiomeCard).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('bundle-mobile-upgrade-cta')).toHaveTextContent(
      'Upgrade — $189',
    );
  });

  it('tracks when the user selects a different bundle', async () => {
    render(<BundlePicker variant="test" />);

    const user = userEvent.setup();
    const carousel = screen.getByTestId('bundle-mobile-carousel');
    const completeCard = within(carousel).getByRole('button', {
      name: /complete bundle/i,
    });

    await user.click(completeCard);

    expect(mocks.track).toHaveBeenCalledWith(
      'advanced_upgrade_bundle_selected',
      expect.objectContaining({
        variant: 'test',
        bundle_id: ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE,
      }),
    );
  });

  it('hides the complete bundle for NY/NJ members', () => {
    mocks.user = nyUser;

    render(<BundlePicker variant="test" />);

    expect(screen.queryByText('Complete Bundle')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /advanced & microbiome/i }),
    ).toHaveTextContent('$379');
  });

  it('submits the selected bundle id on upgrade', async () => {
    render(<BundlePicker variant="test" />);

    const user = userEvent.setup();
    const carousel = screen.getByTestId('bundle-mobile-carousel');
    const advancedCard = within(carousel).getByRole('button', {
      name: /male advanced/i,
    });

    await user.click(advancedCard);

    const primaryUpgrade = screen.getByTestId('bundle-mobile-upgrade-cta');
    await user.click(primaryUpgrade);
    expect(screen.getAllByText('Payment method').length).toBeGreaterThan(0);
    expect(primaryUpgrade).toHaveTextContent('Confirm');
    expect(mocks.mutateAsync).not.toHaveBeenCalled();

    await user.click(primaryUpgrade);

    await waitFor(() =>
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        data: {
          upgradeType: 'advanced',
          paymentMethodId: 'pm_1',
          bundleId: ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE,
        },
      }),
    );
  });
});
