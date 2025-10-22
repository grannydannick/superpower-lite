// catches whole number distance from labcorp if not show decimal
export const formatDistanceText = (distance?: number): string => {
  if (distance === undefined) return '';

  return distance === 1 || distance === 0
    ? 'within 1 mile'
    : `${distance} miles away`;
};
