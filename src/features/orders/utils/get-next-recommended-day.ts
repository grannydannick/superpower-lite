import moment from 'moment';

// It is recommended to take first actions 72 hours before the appointment
export const getNextRecommendedDay = () => {
  let nextDay = moment().add(3, 'day');
  while (nextDay.day() === 0 || nextDay.day() === 6) {
    nextDay = nextDay.add(1, 'day');
  }
  return nextDay.format('dddd, D MMMM');
};
