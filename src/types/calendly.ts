export type CalendlyScheduledEventInfo = {
  uri: string;
  name: string;
  status: string;
  bookingMethod: string;
  start_time: string;
  end_time: string;
  location: {
    join_url?: string;
    type?: 'zoom';
  };
};
