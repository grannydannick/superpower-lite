export function isWithinDays(date: Date | string, days: number) {
  return new Date(date).getTime() > Date.now() - days * 24 * 60 * 60 * 1000;
}

export const getDaytime = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'morning';
  if (currentHour >= 12 && currentHour < 17) return 'afternoon';
  return 'evening';
};
