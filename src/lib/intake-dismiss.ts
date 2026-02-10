// Session-only flag — resets on page refresh so the redirect fires again next visit.
// Lives in @/lib to avoid a circular dep between @/features/intake and @/lib/auth.
let dismissed = false;

export const isIntakeDismissed = () => dismissed;
export const dismissIntake = () => {
  dismissed = true;
};
