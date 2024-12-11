export type TestDetails = {
  'Why is this test important?': string;
  'Test Process'?: string;
  'Pre-test considerations'?: string;
  "What's measured?"?: string;
  'Test process'?: string;
  sampleReportLink?: string;
};

export type ServiceDetails = {
  [serviceName: string]: TestDetails;
};
