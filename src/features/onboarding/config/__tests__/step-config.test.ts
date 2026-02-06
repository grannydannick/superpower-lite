import { describe, it, expect } from 'vitest';

import { getValidSteps, FlowContext, STEP_IDS } from '../step-config';

const baseContext: FlowContext = {
  userInfoCompleted: false,
  userGender: null,
  userAge: null,
  primerCompleted: false,
  medicalHistoryCompleted: false,
  femaleHealthCompleted: false,
  lifestyleCompleted: false,
  userHasAdvancedUpgrade: false,
  userHasOrganAge: false,
  hasAdditionalCredits: false,
  baselineCreditsCount: 1,
  hasStartedIntake: false,
  hasOrganAgeService: true,
  hasFatigueService: true,
  hasHormoneService: true,
  hasClaimedBenefits: false,
};

describe('getValidSteps', () => {
  describe('introduction step', () => {
    it('includes introduction for fresh user with no credits and no intake started', () => {
      const ctx = {
        ...baseContext,
        hasAdditionalCredits: false,
        hasStartedIntake: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.INTRODUCTION);
    });

    it('excludes introduction when user has additional credits', () => {
      const ctx = { ...baseContext, hasAdditionalCredits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.INTRODUCTION);
    });

    it('excludes introduction when user has started intake', () => {
      const ctx = { ...baseContext, hasStartedIntake: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.INTRODUCTION);
    });
  });

  describe('digital-twin step', () => {
    it('includes digital-twin for fresh user with no credits and no intake started', () => {
      const ctx = {
        ...baseContext,
        hasAdditionalCredits: false,
        hasStartedIntake: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.DIGITAL_TWIN);
    });

    it('excludes digital-twin when user has additional credits', () => {
      const ctx = { ...baseContext, hasAdditionalCredits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.DIGITAL_TWIN);
    });

    it('excludes digital-twin when user has started intake', () => {
      const ctx = { ...baseContext, hasStartedIntake: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.DIGITAL_TWIN);
    });
  });

  describe('update-info step', () => {
    it('includes update-info when user info is not completed', () => {
      const ctx = { ...baseContext, userInfoCompleted: false };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.UPDATE_INFO);
    });

    it('excludes update-info when user info is completed', () => {
      const ctx = { ...baseContext, userInfoCompleted: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.UPDATE_INFO);
    });
  });

  describe('advanced-upgrade step', () => {
    it('includes advanced-upgrade when intake not started and no upgrade', () => {
      const ctx = { ...baseContext, hasStartedIntake: false };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.ADVANCED_UPGRADE);
    });

    it('excludes advanced-upgrade when intake is started', () => {
      const ctx = { ...baseContext, hasStartedIntake: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ADVANCED_UPGRADE);
    });

    it('excludes advanced-upgrade when intake is started even if questionnaires completed', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: true,
        primerCompleted: true,
        medicalHistoryCompleted: true,
        lifestyleCompleted: true,
      };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ADVANCED_UPGRADE);
    });

    it('excludes advanced-upgrade when user already has upgrade', () => {
      const ctx = { ...baseContext, userHasAdvancedUpgrade: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ADVANCED_UPGRADE);
    });

    it('excludes advanced-upgrade for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ADVANCED_UPGRADE);
    });
  });

  describe('bundled-discount step', () => {
    it('includes bundled-discount for fresh user with 1 baseline credit', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: false,
        hasClaimedBenefits: false,
        baselineCreditsCount: 1,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.BUNDLED_DISCOUNT);
    });

    it('excludes bundled-discount when user has started intake', () => {
      const ctx = { ...baseContext, hasStartedIntake: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.BUNDLED_DISCOUNT);
    });

    it('excludes bundled-discount when user has more than 1 baseline credit', () => {
      const ctx = { ...baseContext, baselineCreditsCount: 2 };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.BUNDLED_DISCOUNT);
    });

    it('excludes bundled-discount for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.BUNDLED_DISCOUNT);
    });

    it('includes bundled-discount when baselineCreditsCount is 0', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: false,
        hasClaimedBenefits: false,
        baselineCreditsCount: 0,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.BUNDLED_DISCOUNT);
    });
  });

  describe('organ-age step', () => {
    it('includes organ-age when user does not have OrganAge', () => {
      const ctx = {
        ...baseContext,
        userHasOrganAge: false,
        hasClaimedBenefits: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.ORGAN_AGE);
    });

    it('excludes organ-age when user already has OrganAge', () => {
      const ctx = { ...baseContext, userHasOrganAge: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ORGAN_AGE);
    });

    it('excludes organ-age for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ORGAN_AGE);
    });

    it('excludes organ-age for B2B users even without OrganAge', () => {
      const ctx = {
        ...baseContext,
        userHasOrganAge: false,
        hasClaimedBenefits: true,
      };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ORGAN_AGE);
    });
  });

  describe('heard-about-us step', () => {
    it('includes heard-about-us when user info is not completed', () => {
      const ctx = {
        ...baseContext,
        userInfoCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.HEARD_ABOUT_US);
    });

    it('places heard-about-us at the beginning when included', () => {
      const ctx = {
        ...baseContext,
        userInfoCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps[0]).toBe(STEP_IDS.HEARD_ABOUT_US);
    });

    it('excludes heard-about-us when user info is completed', () => {
      const ctx = { ...baseContext, userInfoCompleted: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.HEARD_ABOUT_US);
    });
  });

  describe('primer step', () => {
    it('includes primer intro when not completed', () => {
      const ctx = {
        ...baseContext,
        primerCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.PRIMER_INTRO);
    });

    it('includes primer when not completed', () => {
      const ctx = { ...baseContext, primerCompleted: false };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.PRIMER);
    });

    it('excludes primer when completed', () => {
      const ctx = { ...baseContext, primerCompleted: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.PRIMER);
    });
  });

  describe('medical-history step', () => {
    it('includes medical-history intro when not completed', () => {
      const ctx = {
        ...baseContext,
        medicalHistoryCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.MEDICAL_HISTORY_INTRO);
    });

    it('includes medical-history when not completed', () => {
      const ctx = { ...baseContext, medicalHistoryCompleted: false };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.MEDICAL_HISTORY);
    });

    it('excludes medical-history when completed', () => {
      const ctx = { ...baseContext, medicalHistoryCompleted: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.MEDICAL_HISTORY);
    });
  });

  describe('female-health step', () => {
    it('includes female-health intro for female users when not completed', () => {
      const ctx = {
        ...baseContext,
        userGender: 'female' as const,
        femaleHealthCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.FEMALE_HEALTH_INTRO);
    });

    it('includes female-health for female users when not completed', () => {
      const ctx = {
        ...baseContext,
        userGender: 'female' as const,
        femaleHealthCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.FEMALE_HEALTH);
    });

    it('excludes female-health for female users when completed', () => {
      const ctx = {
        ...baseContext,
        userGender: 'female' as const,
        femaleHealthCompleted: true,
      };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.FEMALE_HEALTH);
    });

    it('excludes female-health for male users', () => {
      const ctx = {
        ...baseContext,
        userGender: 'male' as const,
        femaleHealthCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.FEMALE_HEALTH);
    });

    it('excludes female-health when gender is null', () => {
      const ctx = {
        ...baseContext,
        userGender: null,
        femaleHealthCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.FEMALE_HEALTH);
    });
  });

  describe('lifestyle step', () => {
    it('includes lifestyle intro when not completed', () => {
      const ctx = {
        ...baseContext,
        lifestyleCompleted: false,
      };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.LIFESTYLE_INTRO);
    });

    it('includes lifestyle when not completed', () => {
      const ctx = { ...baseContext, lifestyleCompleted: false };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.LIFESTYLE);
    });

    it('excludes lifestyle when completed', () => {
      const ctx = { ...baseContext, lifestyleCompleted: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.LIFESTYLE);
    });
  });

  describe('upsell-panels step', () => {
    it('includes upsell-panels in default context', () => {
      const steps = getValidSteps(baseContext);
      expect(steps).toContain(STEP_IDS.UPSELL_PANELS);
    });

    it('excludes upsell-panels for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.UPSELL_PANELS);
    });
  });

  describe('add-on-panels step', () => {
    it('includes add-on-panels in default context', () => {
      const steps = getValidSteps(baseContext);
      expect(steps).toContain(STEP_IDS.ADD_ON_PANELS);
    });

    it('excludes add-on-panels for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).not.toContain(STEP_IDS.ADD_ON_PANELS);
    });
  });

  describe('phlebotomy-booking step', () => {
    it('always includes phlebotomy-booking', () => {
      const steps = getValidSteps(baseContext);
      expect(steps).toContain(STEP_IDS.PHLEBOTOMY_BOOKING);
    });

    it('includes phlebotomy-booking for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps).toContain(STEP_IDS.PHLEBOTOMY_BOOKING);
    });
  });

  describe('commitment step', () => {
    it('always includes commitment', () => {
      const steps = getValidSteps(baseContext);
      expect(steps).toContain(STEP_IDS.COMMITMENT);
    });

    it('commitment is last step', () => {
      const steps = getValidSteps(baseContext);
      expect(steps[steps.length - 1]).toBe(STEP_IDS.COMMITMENT);
    });

    it('commitment is last step for B2B users', () => {
      const ctx = { ...baseContext, hasClaimedBenefits: true };
      const steps = getValidSteps(ctx);
      expect(steps[steps.length - 1]).toBe(STEP_IDS.COMMITMENT);
    });
  });

  describe('step order', () => {
    it('maintains correct step order for default context', () => {
      const steps = getValidSteps({
        ...baseContext,
        userGender: 'female',
      });

      const updateInfoIdx = steps.indexOf(STEP_IDS.UPDATE_INFO);
      const introductionIdx = steps.indexOf(STEP_IDS.INTRODUCTION);
      const digitalTwinIdx = steps.indexOf(STEP_IDS.DIGITAL_TWIN);
      const advancedIdx = steps.indexOf(STEP_IDS.ADVANCED_UPGRADE);
      const bundledIdx = steps.indexOf(STEP_IDS.BUNDLED_DISCOUNT);
      const organAgeIdx = steps.indexOf(STEP_IDS.ORGAN_AGE);
      const heardAboutIdx = steps.indexOf(STEP_IDS.HEARD_ABOUT_US);
      const finishTwinIdx = steps.indexOf(STEP_IDS.FINISH_TWIN);
      const primerIntroIdx = steps.indexOf(STEP_IDS.PRIMER_INTRO);
      const primerIdx = steps.indexOf(STEP_IDS.PRIMER);
      const medicalIntroIdx = steps.indexOf(STEP_IDS.MEDICAL_HISTORY_INTRO);
      const medicalIdx = steps.indexOf(STEP_IDS.MEDICAL_HISTORY);
      const femaleIntroIdx = steps.indexOf(STEP_IDS.FEMALE_HEALTH_INTRO);
      const femaleIdx = steps.indexOf(STEP_IDS.FEMALE_HEALTH);
      const lifestyleIntroIdx = steps.indexOf(STEP_IDS.LIFESTYLE_INTRO);
      const lifestyleIdx = steps.indexOf(STEP_IDS.LIFESTYLE);
      const upsellIdx = steps.indexOf(STEP_IDS.UPSELL_PANELS);
      const addOnIdx = steps.indexOf(STEP_IDS.ADD_ON_PANELS);
      const phlebIdx = steps.indexOf(STEP_IDS.PHLEBOTOMY_BOOKING);
      const commitmentIdx = steps.indexOf(STEP_IDS.COMMITMENT);

      expect(heardAboutIdx).toBeLessThan(updateInfoIdx);
      expect(updateInfoIdx).toBeLessThan(introductionIdx);
      expect(introductionIdx).toBeLessThan(digitalTwinIdx);
      expect(digitalTwinIdx).toBeLessThan(advancedIdx);
      expect(advancedIdx).toBeLessThan(bundledIdx);
      expect(bundledIdx).toBeLessThan(organAgeIdx);
      expect(organAgeIdx).toBeLessThan(finishTwinIdx);
      expect(heardAboutIdx).toBeLessThan(finishTwinIdx);
      expect(finishTwinIdx).toBeLessThan(primerIntroIdx);
      expect(primerIntroIdx).toBeLessThan(primerIdx);
      expect(primerIdx).toBeLessThan(medicalIntroIdx);
      expect(medicalIntroIdx).toBeLessThan(medicalIdx);
      expect(medicalIdx).toBeLessThan(femaleIntroIdx);
      expect(femaleIntroIdx).toBeLessThan(femaleIdx);
      expect(femaleIdx).toBeLessThan(lifestyleIntroIdx);
      expect(lifestyleIntroIdx).toBeLessThan(lifestyleIdx);
      expect(lifestyleIdx).toBeLessThan(upsellIdx);
      expect(upsellIdx).toBeLessThan(addOnIdx);
      expect(addOnIdx).toBeLessThan(phlebIdx);
      expect(phlebIdx).toBeLessThan(commitmentIdx);
    });

    it('returns only always-shown steps when most are excluded', () => {
      const ctx: FlowContext = {
        userInfoCompleted: true,
        userGender: 'female',
        userAge: 50,
        primerCompleted: true,
        medicalHistoryCompleted: true,
        femaleHealthCompleted: true,
        lifestyleCompleted: true,
        userHasAdvancedUpgrade: true,
        userHasOrganAge: true,
        hasAdditionalCredits: true,
        baselineCreditsCount: 2,
        hasStartedIntake: true,
        hasOrganAgeService: false,
        hasFatigueService: false,
        hasHormoneService: false,
        hasClaimedBenefits: true,
      };
      const steps = getValidSteps(ctx);

      expect(steps).toEqual([STEP_IDS.PHLEBOTOMY_BOOKING, STEP_IDS.COMMITMENT]);
    });
  });

  describe('resume questionnaire flow', () => {
    it('starts at primer intro when any questionnaire has status and primer incomplete', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: true,
        primerCompleted: false,
      };
      const steps = getValidSteps(ctx);

      expect(steps[0]).toBe(STEP_IDS.PRIMER_INTRO);
      expect(steps).not.toContain(STEP_IDS.UPDATE_INFO);
      expect(steps).not.toContain(STEP_IDS.DIGITAL_TWIN);
      expect(steps).toContain(STEP_IDS.PRIMER);
    });

    it('starts at medical history intro when primer completed', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: true,
        primerCompleted: true,
        medicalHistoryCompleted: false,
      };
      const steps = getValidSteps(ctx);

      expect(steps[0]).toBe(STEP_IDS.MEDICAL_HISTORY_INTRO);
      expect(steps).not.toContain(STEP_IDS.PRIMER_INTRO);
      expect(steps).toContain(STEP_IDS.MEDICAL_HISTORY);
    });

    it('skips female health intro for non-female users', () => {
      const ctx = {
        ...baseContext,
        hasStartedIntake: true,
        primerCompleted: true,
        medicalHistoryCompleted: true,
        femaleHealthCompleted: false,
        userGender: 'male' as const,
        lifestyleCompleted: false,
      };
      const steps = getValidSteps(ctx);

      expect(steps[0]).toBe(STEP_IDS.LIFESTYLE_INTRO);
      expect(steps).not.toContain(STEP_IDS.FEMALE_HEALTH_INTRO);
    });
  });
});
