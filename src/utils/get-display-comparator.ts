export const getDisplayComparator = (comparator?: string) => {
  if (comparator === 'EQUAL') {
    return '';
  } else if (comparator === 'GREATER_THAN') {
    return '>';
  } else if (comparator === 'LESS_THAN') {
    return '<';
  } else if (comparator === 'GREATER_THAN_EQUALS') {
    return '≥';
  } else if (comparator === 'LESS_THAN_EQUALS') {
    return '≤';
  }
  return '';
};
