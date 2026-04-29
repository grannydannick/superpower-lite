import { Head } from '@/components/seo';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { usePosthogFeatureFlagVariantKey } from '@/hooks/use-posthog-feature-flag-variant-key';
import { FeatureFlags } from '@/lib/posthog';

import { BundlePicker } from './bundle-picker/bundle-picker';
import { AdvancedPanelUpgradeControl } from './upgrade-control/advanced-panel-upgrade-control';

/**
 * Variant router for the advanced-upgrade onboarding step.
 *
 * Reads the `advanced-upgrade-bundles` PostHog flag and mounts the matching
 * variant component. Each variant is self-contained — they share no UI or
 * state, so removing the losing arm after the experiment is a one-line delete.
 *
 * Variants:
 * - `bundle-picker` → 3-card horizontal picker, sends `bundleId` on submit.
 * - `control` (or undefined / unbucketed) → existing single-card UI.
 */
export const AdvancedPanelUpgradeStep = () => {
  const variantKey = usePosthogFeatureFlagVariantKey(
    FeatureFlags.AdvancedUpgradeBundles,
  );
  const variantTag = variantKey ?? 'unbucketed';

  return (
    <>
      <Head
        title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.ADVANCED_UPGRADE)}
      />
      {variantKey === 'bundle-picker' ? (
        <BundlePicker variant={variantTag} />
      ) : (
        <AdvancedPanelUpgradeControl variant={variantTag} />
      )}
    </>
  );
};
