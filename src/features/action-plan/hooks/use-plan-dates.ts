import { useEffect, useState } from 'react';

import { usePlanDates } from '@/features/action-plan/api';

interface UseActionPlanDatePickerProps {
  setOrderId: (orderId?: string) => void;
}

export const useActionPlanDatePicker = ({
  setOrderId,
}: UseActionPlanDatePickerProps) => {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const { data: planDatesData } = usePlanDates();
  const planDates = planDatesData?.availableDates;

  useEffect(() => {
    if (!planDates) return;

    if (planDates.length === 0) {
      setCurrentDate(null);
      setOrderId(undefined);
    } else {
      setCurrentDate(new Date(planDates[0].timestamp));
      setOrderId(planDates[0].orderId);
    }
  }, [planDates, setOrderId]);

  return {
    currentDate,
    setCurrentDate,
    planDates,
  };
};
