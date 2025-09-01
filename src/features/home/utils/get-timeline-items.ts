type TimelineItemType = 'onboarding' | 'current' | 'completed';

export const getTimelineItems = (
  timelineItems: any[] | undefined,
  type: TimelineItemType,
) => {
  const getOnboardingItems = () => {
    return timelineItems?.filter(
      (ti) => ti.type === 'ONBOARDING_TASK' && ti.status !== 'DONE',
    );
  };

  const getCurrentItems = () => {
    return (
      timelineItems
        ?.filter(
          (ti) =>
            ti.type !== 'ONBOARDING_TASK' &&
            ti.status !== 'DONE' &&
            ti.status !== 'DISABLED',
        )
        //we want latest appointments first, and for unbooked items to be priortized to be scheduled ahead of time
        // this is a hack until we enable timeline grouping on backend
        .sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.getTime() - a.timestamp.getTime();
          }
          return 0;
        })
        .reverse()
    );
  };

  const getCompletedItems = () => {
    if (!timelineItems) return [];

    const isCompletedItem = (item: any) => {
      return item.status === 'DONE' || item.status === 'DISABLED';
    };

    const isCompletedTest = (item: any) => {
      return item.type === 'ORDER' && item.status === 'DONE';
    };

    const isCompletedPlan = (item: any) => {
      return item.type === 'PLAN' && item.status === 'DONE';
    };

    const isDisabledDraftPlan = (item: any) => {
      return item.type === 'PLAN' && item.status === 'DISABLED';
    };

    // Count completed tests and plans
    const completedTests = timelineItems.filter(isCompletedTest);
    const completedPlans = timelineItems.filter(isCompletedPlan);
    const disabledPlans = timelineItems.filter(isDisabledDraftPlan);

    const completedTestsCount = completedTests.length;
    const completedPlansCount = completedPlans.length;
    const missingPlansCount = Math.max(
      0,
      completedTestsCount - completedPlansCount,
    );

    return timelineItems.filter((item) => {
      if (!isCompletedItem(item)) return false;

      // Always show completed plans and tests
      if (isCompletedPlan(item) || isCompletedTest(item)) {
        return true;
      }

      // Show disabled plans up to the missing count
      if (isDisabledDraftPlan(item)) {
        const disabledPlanIndex = disabledPlans.findIndex(
          (plan) => plan.id === item.id,
        );
        return disabledPlanIndex < missingPlansCount;
      }

      // Show other completed items
      return true;
    });
  };

  switch (type) {
    case 'onboarding':
      return getOnboardingItems();
    case 'current':
      return getCurrentItems();
    case 'completed':
      return getCompletedItems();
    default:
      return [];
  }
};
